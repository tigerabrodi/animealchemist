import { authTables } from '@convex-dev/auth/server'
import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export default defineSchema({
  // Include Convex Auth tables
  ...authTables,

  // Users table (minimal, with access control)
  users: defineTable({
    email: v.string(),
    updatedAt: v.number(),
    apiKey: v.optional(
      v.object({
        encryptedKey: v.array(v.number()), // For encrypted API key storage
        initializationVector: v.array(v.number()), // IV for encryption
      })
    ),
  }).index('by_email', ['email']),

  // Characters table - stores the character's core identity
  characters: defineTable({
    userId: v.id('users'),

    // Basic info
    name: v.string(),
    slug: v.string(), // URL-friendly identifier

    // Character traits that get injected into every prompt
    personality: v.string(), // e.g., "cheerful and energetic"
    appearance: v.string(), // e.g., "long pink hair, blue eyes, school uniform"
    setting: v.optional(v.string()), // e.g., "fantasy world" or "modern city"
    age: v.optional(v.string()), // e.g., "teenage" or "young adult"
    specialTraits: v.optional(v.string()), // e.g., "cat ears, magical powers"

    // Optional description for user's notes
    description: v.optional(v.string()),

    // Thumbnail for grid view (latest or user-selected image)
    thumbnailImageId: v.optional(v.id('images')),

    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_user', ['userId'])
    .index('by_slug', ['slug'])
    .index('by_user_and_slug', ['userId', 'slug']),

  // Images table - all generated images
  images: defineTable({
    characterId: v.id('characters'),
    storageId: v.id('_storage'),

    // User's prompt (what they typed)
    userPrompt: v.string(),

    // Full prompt sent to model (with character traits + enhancements)
    fullPrompt: v.string(),

    // Generation type
    generationType: v.union(
      v.literal('initial'), // First image on character creation
      v.literal('text2img'), // New generation from text
      v.literal('img2img') // Variation from existing image
    ),

    // For img2img generations
    sourceImageId: v.optional(v.id('images')), // Which image this was based on
    strength: v.optional(v.number()), // How much to transform (0-1)

    // Model used
    modelId: v.string(), // Either qwen/qwen-image or mistoon-anime-xl

    // Image dimensions
    width: v.number(),
    height: v.number(),
    aspectRatio: v.string(), // e.g., "16:9", "1:1", "9:16"

    createdAt: v.number(),
  })
    .index('by_character', ['characterId'])
    .index('by_character_created', ['characterId', 'createdAt'])
    .index('by_source_image', ['sourceImageId']),

  // Videos table - all generated videos
  videos: defineTable({
    characterId: v.id('characters'),
    storageId: v.id('_storage'),

    // Source image that was animated
    sourceImageId: v.id('images'),

    // Required prompt for the animation (what the character should do)
    prompt: v.string(), // e.g., "walking through a field", "winking at camera"

    // Model used (bytedance/seedance-1-pro for now)
    modelId: v.string(),

    // Video properties
    width: v.number(),
    height: v.number(),
    duration: v.number(), // in seconds, user-specified
    fps: v.optional(v.number()), // defaulted on backend

    createdAt: v.number(),
  })
    .index('by_character', ['characterId'])
    .index('by_character_created', ['characterId', 'createdAt'])
    .index('by_source_image', ['sourceImageId']),
})
