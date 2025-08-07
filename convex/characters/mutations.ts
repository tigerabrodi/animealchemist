import { getAuthUserId } from '@convex-dev/auth/server'
import { v } from 'convex/values'

import { Doc } from '../_generated/dataModel'
import { mutation } from '../_generated/server'
import { sharedErrors } from '../errors'

import { characterErrors } from './errors'
import { generateSlug } from './utils'

export const createCharacter = mutation({
  args: {
    name: v.string(),
    personality: v.string(),
    appearance: v.string(),
    setting: v.optional(v.string()),
    age: v.optional(v.string()),
    specialTraits: v.optional(v.string()),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) {
      throw sharedErrors.USER_NOT_AUTHENTICATED
    }

    // Validate required fields
    if (!args.name.trim()) {
      throw characterErrors.CHARACTER_NAME_REQUIRED
    }

    if (!args.personality.trim() || !args.appearance.trim()) {
      throw characterErrors.CHARACTER_TRAITS_REQUIRED
    }

    // Generate slug and check uniqueness
    const slug = generateSlug(args.name)
    const existingCharacter = await ctx.db
      .query('characters')
      .withIndex('by_user_and_slug', (q) => q.eq('userId', userId).eq('slug', slug))
      .first()

    if (existingCharacter) {
      throw characterErrors.SLUG_ALREADY_EXISTS
    }

    // Create character
    const characterId = await ctx.db.insert('characters', {
      userId,
      name: args.name.trim(),
      slug,
      personality: args.personality.trim(),
      appearance: args.appearance.trim(),
      setting: args.setting?.trim() || undefined,
      age: args.age?.trim() || undefined,
      specialTraits: args.specialTraits?.trim() || undefined,
      description: args.description?.trim() || undefined,
      thumbnailImageId: undefined,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })

    return characterId
  },
})

export const updateCharacter = mutation({
  args: {
    characterId: v.id('characters'),
    name: v.optional(v.string()),
    personality: v.optional(v.string()),
    appearance: v.optional(v.string()),
    setting: v.optional(v.string()),
    age: v.optional(v.string()),
    specialTraits: v.optional(v.string()),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) {
      throw sharedErrors.USER_NOT_AUTHENTICATED
    }

    const character = await ctx.db.get(args.characterId)
    if (!character) {
      throw characterErrors.CHARACTER_NOT_FOUND
    }

    if (character.userId !== userId) {
      throw characterErrors.NOT_CHARACTER_OWNER
    }

    const updates: Partial<Doc<'characters'>> = {
      updatedAt: Date.now(),
    }

    // Only update provided fields
    if (args.name !== undefined) {
      updates.name = args.name.trim()
      updates.slug = generateSlug(args.name)
    }
    if (args.personality !== undefined) {
      updates.personality = args.personality.trim()
    }
    if (args.appearance !== undefined) {
      updates.appearance = args.appearance.trim()
    }
    if (args.setting !== undefined) {
      updates.setting = args.setting.trim() || undefined
    }
    if (args.age !== undefined) {
      updates.age = args.age.trim() || undefined
    }
    if (args.specialTraits !== undefined) {
      updates.specialTraits = args.specialTraits.trim() || undefined
    }
    if (args.description !== undefined) {
      updates.description = args.description.trim() || undefined
    }

    await ctx.db.patch(args.characterId, updates)
  },
})

export const deleteCharacter = mutation({
  args: {
    characterId: v.id('characters'),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) {
      throw sharedErrors.USER_NOT_AUTHENTICATED
    }

    const character = await ctx.db.get(args.characterId)
    if (!character) {
      throw characterErrors.CHARACTER_NOT_FOUND
    }

    if (character.userId !== userId) {
      throw characterErrors.NOT_CHARACTER_OWNER
    }

    // Delete all associated images
    const images = await ctx.db
      .query('images')
      .withIndex('by_character', (q) => q.eq('characterId', args.characterId))
      .collect()

    for (const image of images) {
      await ctx.storage.delete(image.storageId)
      await ctx.db.delete(image._id)
    }

    // Delete all associated videos
    const videos = await ctx.db
      .query('videos')
      .withIndex('by_character', (q) => q.eq('characterId', args.characterId))
      .collect()

    for (const video of videos) {
      await ctx.storage.delete(video.storageId)
      await ctx.db.delete(video._id)
    }

    // Delete character
    await ctx.db.delete(args.characterId)
  },
})

export const updateCharacterThumbnail = mutation({
  args: {
    characterId: v.id('characters'),
    imageId: v.id('images'),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) {
      throw sharedErrors.USER_NOT_AUTHENTICATED
    }

    const character = await ctx.db.get(args.characterId)
    if (!character) {
      throw characterErrors.CHARACTER_NOT_FOUND
    }

    if (character.userId !== userId) {
      throw characterErrors.NOT_CHARACTER_OWNER
    }

    await ctx.db.patch(args.characterId, {
      thumbnailImageId: args.imageId,
      updatedAt: Date.now(),
    })
  },
})
