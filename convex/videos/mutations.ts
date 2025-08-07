import { v } from 'convex/values'

import { mutation } from '../_generated/server'

export const saveGeneratedVideo = mutation({
  args: {
    characterId: v.id('characters'),
    sourceImageId: v.id('images'),
    storageId: v.id('_storage'),
    prompt: v.string(),
    modelId: v.string(),
    width: v.number(),
    height: v.number(),
    duration: v.number(),
    fps: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert('videos', {
      characterId: args.characterId,
      storageId: args.storageId,
      sourceImageId: args.sourceImageId,
      prompt: args.prompt,
      modelId: args.modelId,
      width: args.width,
      height: args.height,
      duration: args.duration,
      fps: args.fps,
      createdAt: Date.now(),
    })
  },
})

export const deleteVideo = mutation({
  args: {
    videoId: v.id('videos'),
  },
  handler: async (ctx, args) => {
    const video = await ctx.db.get(args.videoId)
    if (!video) return

    // Delete from storage
    await ctx.storage.delete(video.storageId)

    // Delete from database
    await ctx.db.delete(args.videoId)
  },
})
