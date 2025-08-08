'use node'

import { getAuthUserId } from '@convex-dev/auth/server'
import { v } from 'convex/values'
import Replicate from 'replicate'

import { api } from '../_generated/api'
import { action, ActionCtx } from '../_generated/server'
import { sharedErrors } from '../errors'
import { handlePromise } from '../utils'

import { videoErrors } from './errors'

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

export const generateVideo = action({
  args: {
    imageId: v.id('images'),
    prompt: v.string(),
    duration: v.number(), // in seconds
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) {
      throw sharedErrors.USER_NOT_AUTHENTICATED
    }

    // Validate duration - Seedance 1 Pro only supports 5 or 10 seconds
    if (![5, 10].includes(args.duration)) {
      throw videoErrors.INVALID_DURATION
    }

    // Get API key
    const apiKey = await getUserApiKey(ctx)
    const replicate = new Replicate({ auth: apiKey })

    // Get source image
    const sourceImage = await ctx.runQuery(api.images.queries.getImageById, {
      imageId: args.imageId,
    })

    if (!sourceImage) {
      throw videoErrors.SOURCE_IMAGE_NOT_FOUND
    }

    // Generate video with ByteDance SeedDance model
    const input = {
      prompt: args.prompt,
      image: sourceImage.url, // Use the source image
      duration: args.duration, // Must be 5 or 10
      resolution: '1080p', // Optional but recommended
      fps: 24, // Optional, defaults to 24
      aspect_ratio: '16:9', // Optional
      camera_fixed: false, // Optional
    }

    const [error, output] = await handlePromise(
      replicate.run('bytedance/seedance-1-pro', { input })
    )

    if (error || !output) {
      throw videoErrors.GENERATION_FAILED
    }

    // Handle ReadableStream output from Replicate
    let blob: Blob

    if (output && typeof output === 'object' && 'getReader' in output) {
      // It's a ReadableStream - read it chunk by chunk
      const reader = (output as ReadableStream<Uint8Array>).getReader()
      const chunks: Array<Uint8Array> = []

      try {
        while (true) {
          const { done: isDone, value } = await reader.read()
          if (isDone) break
          if (value) chunks.push(value)
        }
      } finally {
        reader.releaseLock()
      }

      blob = new Blob(chunks, { type: 'video/mp4' })
    } else {
      throw videoErrors.GENERATION_FAILED
    }

    const storageId = await ctx.storage.store(blob)

    // Save to database
    await ctx.runMutation(api.videos.mutations.saveGeneratedVideo, {
      characterId: sourceImage.characterId,
      sourceImageId: args.imageId,
      storageId,
      prompt: args.prompt,
      modelId: 'bytedance/seedance-1-pro',
      width: sourceImage.width,
      height: sourceImage.height,
      duration: args.duration,
      fps: 24,
    })

    const url = await ctx.storage.getUrl(storageId)
    return { url, storageId }
  },
})
