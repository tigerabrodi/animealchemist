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

    // Validate duration
    if (args.duration < 2 || args.duration > 5) {
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
      // Additional parameters if needed by the model
      fps: 24,
      duration: args.duration,
    }

    const [error, output] = await handlePromise(
      replicate.run('bytedance/seedance-1-pro', { input })
    )

    if (error || !output) {
      throw videoErrors.GENERATION_FAILED
    }

    // Handle output - ByteDance returns a file/stream
    let blob: Blob

    // Check if output is a ReadableStream or direct file
    if (output && typeof output === 'object') {
      if ('getReader' in output && typeof output.getReader === 'function') {
        // It's a ReadableStream
        const reader = output.getReader() as ReadableStreamDefaultReader<Uint8Array>
        const chunks = []

        while (true) {
          const { done: isDone, value } = await reader.read()
          if (isDone) break
          chunks.push(value)
        }

        blob = new Blob(chunks, { type: 'video/mp4' })
      } else if ('url' in output && typeof output.url === 'function') {
        // It might return a URL directly - fetch it
        const response = await fetch(output.url() as string)
        blob = await response.blob()
      } else {
        // Direct file/buffer
        blob = new Blob([output as BlobPart], { type: 'video/mp4' })
      }
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
