import { getAuthUserId } from '@convex-dev/auth/server'
import { v } from 'convex/values'

import { query } from '../_generated/server'

export const getCharacterVideos = query({
  args: {
    characterId: v.id('characters'),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) {
      return []
    }

    // Verify character ownership
    const character = await ctx.db.get(args.characterId)
    if (!character || character.userId !== userId) {
      return []
    }

    const videos = await ctx.db
      .query('videos')
      .withIndex('by_character_created', (q) => q.eq('characterId', args.characterId))
      .order('desc')
      .collect()

    // Get URLs and source image info for each video
    const videosWithDetails = await Promise.all(
      videos.map(async (video) => {
        const url = await ctx.storage.getUrl(video.storageId)

        // Get source image info
        const sourceImage = await ctx.db.get(video.sourceImageId)
        let sourceImageUrl: string | null = null
        if (sourceImage) {
          sourceImageUrl = await ctx.storage.getUrl(sourceImage.storageId)
        }

        return {
          ...video,
          url,
          sourceImageUrl,
          sourceImagePrompt: sourceImage?.userPrompt,
        }
      })
    )

    return videosWithDetails
  },
})

export const getVideoById = query({
  args: {
    videoId: v.id('videos'),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) {
      return null
    }

    const video = await ctx.db.get(args.videoId)
    if (!video) {
      return null
    }

    // Verify ownership through character
    const character = await ctx.db.get(video.characterId)
    if (!character || character.userId !== userId) {
      return null
    }

    const url = await ctx.storage.getUrl(video.storageId)

    // Get source image info
    const sourceImage = await ctx.db.get(video.sourceImageId)
    let sourceImageUrl: string | null = null
    if (sourceImage) {
      sourceImageUrl = await ctx.storage.getUrl(sourceImage.storageId)
    }

    return {
      ...video,
      url,
      character,
      sourceImage: sourceImage
        ? {
            ...sourceImage,
            url: sourceImageUrl,
          }
        : null,
    }
  },
})
