'use node'

import { getAuthUserId } from '@convex-dev/auth/server'
import { v } from 'convex/values'
import Replicate from 'replicate'

import { api } from '../_generated/api'
import { action, ActionCtx } from '../_generated/server'
import { buildCharacterPrompt } from '../characters/utils'
import { sharedErrors } from '../errors'
import { handlePromise } from '../utils'

import { imageErrors } from './errors'

// Get user's decrypted API key
async function getUserApiKey(ctx: ActionCtx): Promise<string> {
  const userId = await getAuthUserId(ctx)
  if (!userId) {
    throw sharedErrors.USER_NOT_AUTHENTICATED
  }

  const [error, apiKey] = await handlePromise(ctx.runAction(api.users.actions.getApiKey))

  if (error || !apiKey) {
    throw sharedErrors.API_KEY_NOT_CONFIGURED
  }

  return apiKey
}

// Text to Image with Qwen model
export const generateTextToImage = action({
  args: {
    characterId: v.id('characters'),
    prompt: v.string(),
    aspectRatio: v.optional(v.union(v.literal('16:9'), v.literal('1:1'), v.literal('9:16'))),
    isInitial: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) {
      throw sharedErrors.USER_NOT_AUTHENTICATED
    }

    // Get API key
    const apiKey = await getUserApiKey(ctx)
    const replicate = new Replicate({ auth: apiKey })

    // Get character
    const character = await ctx.runQuery(api.characters.queries.getCharacterById, {
      characterId: args.characterId,
    })

    if (!character) {
      throw imageErrors.CHARACTER_NOT_FOUND
    }

    // Build full prompt with character traits
    const fullPrompt = buildCharacterPrompt({
      character,
      userPrompt: args.prompt,
    })

    // Determine dimensions based on aspect ratio
    const aspectRatio = args.aspectRatio || '1:1'
    const aspectRatioMap = {
      '16:9': { width: 1344, height: 768 },
      '1:1': { width: 1024, height: 1024 },
      '9:16': { width: 768, height: 1344 },
    }

    const dimensions = aspectRatioMap[aspectRatio]

    // Generate with Qwen model
    const input = {
      prompt: fullPrompt,
      aspect_ratio: aspectRatio,
      image_size: 'optimize_for_quality',
      num_inference_steps: 35,
      guidance: 3.5,
      output_format: 'webp',
      output_quality: 80,
    }

    const [error, output] = await handlePromise(replicate.run('qwen/qwen-image', { input }))

    if (error || !output) {
      throw imageErrors.GENERATION_FAILED
    }

    // Handle output - Qwen returns array of file objects
    if (Array.isArray(output) && output.length > 0) {
      const imageFile = output[0]

      // Read the file as blob
      const reader = imageFile.getReader()
      const chunks = []

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        chunks.push(value)
      }

      const blob = new Blob(chunks, { type: 'image/webp' })
      const storageId = await ctx.storage.store(blob)

      // Save to database
      await ctx.runMutation(api.images.mutations.saveGeneratedImage, {
        characterId: args.characterId,
        storageId,
        userPrompt: args.prompt,
        fullPrompt,
        generationType: args.isInitial ? 'initial' : 'text2img',
        modelId: 'qwen/qwen-image',
        width: dimensions.width,
        height: dimensions.height,
        aspectRatio,
      })

      // Update character thumbnail if this is the initial image
      if (args.isInitial) {
        const images = await ctx.runQuery(api.images.queries.getCharacterImages, {
          characterId: args.characterId,
        })

        if (images.length > 0) {
          await ctx.runMutation(api.characters.mutations.updateCharacterThumbnail, {
            characterId: args.characterId,
            imageId: images[0]._id,
          })
        }
      }

      const url = await ctx.storage.getUrl(storageId)
      return { url, storageId }
    }

    throw imageErrors.GENERATION_FAILED
  },
})

// Image to Image with Mistoon model
export const generateImageVariation = action({
  args: {
    imageId: v.id('images'),
    prompt: v.string(),
    strength: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) {
      throw sharedErrors.USER_NOT_AUTHENTICATED
    }

    // Get API key
    const apiKey = await getUserApiKey(ctx)
    const replicate = new Replicate({ auth: apiKey })

    // Get source image
    const sourceImage = await ctx.runQuery(api.images.queries.getImageById, {
      imageId: args.imageId,
    })

    if (!sourceImage) {
      throw imageErrors.IMAGE_NOT_FOUND
    }

    // Build full prompt with character traits
    const fullPrompt = buildCharacterPrompt({
      character: sourceImage.character,
      userPrompt: args.prompt,
    })

    // Add anime style enhancers for Mistoon
    const enhancedPrompt = `score_9, score_8_up, score_7_up, ${fullPrompt}`
    const negativePrompt =
      'score_6, score_5, score_4, multiple, lowres, text, error, missing arms, missing legs, missing fingers, extra digit, fewer digits, cropped, worst quality, low quality, jpeg artifacts, signature, watermark, out of frame, extra fingers, mutated hands, (poorly drawn hands), (poorly drawn face), (mutation), (deformed breasts), (ugly), blurry, (bad anatomy), (bad proportions), (extra limbs), cloned face, flat color, monochrome, limited palette'

    const input = {
      prompt: enhancedPrompt,
      negative_prompt: negativePrompt,
      image: sourceImage.url,
      width: sourceImage.width,
      height: sourceImage.height,
      strength: args.strength ?? 0.7,
      num_inference_steps: 28,
      guidance_scale: 7,
      scheduler: 'K_EULER_ANCESTRAL',
      num_outputs: 1,
    }

    const [error, output] = await handlePromise(
      replicate.run(
        'asiryan/mistoon-anime-xl:06285a5017bb6bdc7314b3914c48896ffbe543ab8fa1ffc114f8894deac22c9d',
        { input }
      )
    )

    if (error || !output) {
      throw imageErrors.GENERATION_FAILED
    }

    // Handle output - Mistoon returns array of ReadableStreams
    if (Array.isArray(output) && output.length > 0) {
      const imageStream = output[0]

      const reader = imageStream.getReader()
      const chunks = []

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        chunks.push(value)
      }

      const blob = new Blob(chunks, { type: 'image/png' })
      const storageId = await ctx.storage.store(blob)

      // Save to database
      await ctx.runMutation(api.images.mutations.saveGeneratedImage, {
        characterId: sourceImage.characterId,
        storageId,
        userPrompt: args.prompt,
        fullPrompt: enhancedPrompt,
        generationType: 'img2img',
        sourceImageId: args.imageId,
        strength: args.strength ?? 0.7,
        modelId: 'mistoon-anime-xl',
        width: sourceImage.width,
        height: sourceImage.height,
        aspectRatio: sourceImage.aspectRatio,
      })

      const url = await ctx.storage.getUrl(storageId)
      return { url, storageId }
    }

    throw imageErrors.GENERATION_FAILED
  },
})
