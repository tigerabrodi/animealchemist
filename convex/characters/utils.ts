/**
 * Generate a URL-friendly slug from character name
 */
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * Build full prompt by combining character traits with user prompt
 */
export function buildCharacterPrompt({
  character,
  userPrompt,
}: {
  character: {
    personality: string
    appearance: string
    setting?: string | null
    age?: string | null
    specialTraits?: string | null
  }
  userPrompt: string
}): string {
  const parts = []

  // Add user's specific prompt
  parts.push(userPrompt)

  // Add character appearance
  parts.push(character.appearance)

  // Add personality context
  parts.push(`personality: ${character.personality}`)

  // Add optional traits
  if (character.age) {
    parts.push(`age: ${character.age}`)
  }

  if (character.setting) {
    parts.push(`setting: ${character.setting}`)
  }

  if (character.specialTraits) {
    parts.push(character.specialTraits)
  }

  return parts.join(', ')
}
