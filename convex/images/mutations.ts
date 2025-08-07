import { v } from 'convex/values'

import { mutation } from '../_generated/server'

export const saveGeneratedImage = mutation({
  args: {
    characterId: v.id('characters'),
    storageId: v.id('_storage'),
    userPrompt: v.string(),
    fullPrompt: v.string(),
    generationType: v.union(v.literal('initial'), v.literal('text2img'), v.literal('img2img')),
    sourceImageId: v.optional(v.id('images')),
    strength: v.optional(v.number()),
    modelId: v.string(),
    width: v.number(),
    height: v.number(),
    aspectRatio: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert('images', {
      characterId: args.characterId,
      storageId: args.storageId,
      userPrompt: args.userPrompt,
      fullPrompt: args.fullPrompt,
      generationType: args.generationType,
      sourceImageId: args.sourceImageId,
      strength: args.strength,
      modelId: args.modelId,
      width: args.width,
      height: args.height,
      aspectRatio: args.aspectRatio,
      createdAt: Date.now(),
    })
  },
})

export const deleteImage = mutation({
  args: {
    imageId: v.id('images'),
  },
  handler: async (ctx, args) => {
    const image = await ctx.db.get(args.imageId)
    if (!image) return

    // Delete from storage
    await ctx.storage.delete(image.storageId)

    // Delete from database
    await ctx.db.delete(args.imageId)
  },
})
