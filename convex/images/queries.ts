import { getAuthUserId } from '@convex-dev/auth/server'
import { v } from 'convex/values'

import { query } from '../_generated/server'

export const getCharacterImages = query({
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

    const images = await ctx.db
      .query('images')
      .withIndex('by_character_created', (q) => q.eq('characterId', args.characterId))
      .order('desc')
      .collect()

    // Get URLs for each image
    const imagesWithUrls = await Promise.all(
      images.map(async (image) => {
        const url = await ctx.storage.getUrl(image.storageId)
        return {
          ...image,
          url,
        }
      })
    )

    return imagesWithUrls
  },
})

export const getImageById = query({
  args: {
    imageId: v.id('images'),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) {
      return null
    }

    const image = await ctx.db.get(args.imageId)
    if (!image) {
      return null
    }

    // Verify ownership through character
    const character = await ctx.db.get(image.characterId)
    if (!character || character.userId !== userId) {
      return null
    }

    const url = await ctx.storage.getUrl(image.storageId)

    return {
      ...image,
      url,
      character,
    }
  },
})
