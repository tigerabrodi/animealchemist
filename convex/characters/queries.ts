import { getAuthUserId } from '@convex-dev/auth/server'
import { v } from 'convex/values'

import { query } from '../_generated/server'

export const getUserCharacters = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) {
      return []
    }

    const characters = await ctx.db
      .query('characters')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .collect()

    // Get counts for each character
    const charactersWithCounts = await Promise.all(
      characters.map(async (character) => {
        const imageCount = await ctx.db
          .query('images')
          .withIndex('by_character', (q) => q.eq('characterId', character._id))
          .collect()
          .then((images) => images.length)

        const videoCount = await ctx.db
          .query('videos')
          .withIndex('by_character', (q) => q.eq('characterId', character._id))
          .collect()
          .then((videos) => videos.length)

        let thumbnailUrl: string | null = null
        if (character.thumbnailImageId) {
          const thumbnailImage = await ctx.db.get(character.thumbnailImageId)
          if (thumbnailImage) {
            thumbnailUrl = await ctx.storage.getUrl(thumbnailImage.storageId)
          }
        }

        return {
          ...character,
          imageCount,
          videoCount,
          thumbnailUrl,
        }
      })
    )

    return charactersWithCounts
  },
})

export const getCharacterById = query({
  args: {
    characterId: v.id('characters'),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) {
      return null
    }

    const character = await ctx.db.get(args.characterId)
    if (!character || character.userId !== userId) {
      return null
    }

    // Get counts
    const imageCount = await ctx.db
      .query('images')
      .withIndex('by_character', (q) => q.eq('characterId', character._id))
      .collect()
      .then((images) => images.length)

    const videoCount = await ctx.db
      .query('videos')
      .withIndex('by_character', (q) => q.eq('characterId', character._id))
      .collect()
      .then((videos) => videos.length)

    // Get thumbnail URL if exists
    let thumbnailUrl: string | null = null
    if (character.thumbnailImageId) {
      const thumbnailImage = await ctx.db.get(character.thumbnailImageId)
      if (thumbnailImage) {
        thumbnailUrl = await ctx.storage.getUrl(thumbnailImage.storageId)
      }
    }

    return {
      ...character,
      imageCount,
      videoCount,
      thumbnailUrl,
    }
  },
})

export const getCharacterBySlug = query({
  args: {
    slug: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) {
      return null
    }

    const character = await ctx.db
      .query('characters')
      .withIndex('by_user_and_slug', (q) => q.eq('userId', userId).eq('slug', args.slug))
      .first()

    if (!character) {
      return null
    }

    // Get counts
    const imageCount = await ctx.db
      .query('images')
      .withIndex('by_character', (q) => q.eq('characterId', character._id))
      .collect()
      .then((images) => images.length)

    const videoCount = await ctx.db
      .query('videos')
      .withIndex('by_character', (q) => q.eq('characterId', character._id))
      .collect()
      .then((videos) => videos.length)

    // Get thumbnail URL if exists
    let thumbnailUrl: string | null = null
    if (character.thumbnailImageId) {
      const thumbnailImage = await ctx.db.get(character.thumbnailImageId)
      if (thumbnailImage) {
        thumbnailUrl = await ctx.storage.getUrl(thumbnailImage.storageId)
      }
    }

    return {
      ...character,
      imageCount,
      videoCount,
      thumbnailUrl,
    }
  },
})
