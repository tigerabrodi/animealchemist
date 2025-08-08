import { api } from '@convex/_generated/api'
import { FunctionReturnType } from 'convex/server'
import { Image, Plus, Video } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

type Character = FunctionReturnType<typeof api.characters.queries.getUserCharacters>[0]

interface CharacterCardProps {
  character?: Character
  isCreateNew?: boolean
  onClick: () => void
}

export function CharacterCard({ character, isCreateNew = false, onClick }: CharacterCardProps) {
  if (isCreateNew) {
    return (
      <Card
        className="group cursor-pointer overflow-hidden transition-all hover:shadow-lg"
        onClick={onClick}
      >
        <CardContent className="p-0">
          <div className="from-muted/50 to-muted/30 flex aspect-square items-center justify-center bg-gradient-to-br">
            <div className="text-muted-foreground flex flex-col items-center gap-3 transition-transform group-hover:scale-110">
              <Plus className="h-12 w-12" />
              <span className="font-medium">Create New Character</span>
            </div>
          </div>

          <div className="p-4">
            <p className="text-muted-foreground text-sm">
              Bring your anime character to life with AI
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!character) return null

  return (
    <Card
      className="group cursor-pointer overflow-hidden transition-all hover:shadow-lg"
      onClick={onClick}
    >
      <CardContent className="p-0">
        {/* Character Thumbnail */}
        <div className="from-muted/50 to-muted/30 aspect-square overflow-hidden bg-gradient-to-br">
          {character.thumbnailUrl ? (
            <img
              src={character.thumbnailUrl}
              alt={character.name}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <div className="text-6xl opacity-50">{getCharacterEmoji(character.personality)}</div>
            </div>
          )}
        </div>

        {/* Character Info */}
        <div className="p-4">
          <h3 className="mb-1 line-clamp-1 font-semibold">{character.name}</h3>

          <p className="text-muted-foreground mb-3 line-clamp-2 text-sm">
            {character.description || character.personality}
          </p>

          {/* Stats */}
          <div className="flex gap-2">
            {character.imageCount > 0 && (
              <Badge variant="secondary" className="gap-1">
                <Image className="h-3 w-3" />
                {character.imageCount}
              </Badge>
            )}

            {character.videoCount > 0 && (
              <Badge variant="secondary" className="gap-1">
                <Video className="h-3 w-3" />
                {character.videoCount}
              </Badge>
            )}

            {character.imageCount === 0 && character.videoCount === 0 && (
              <Badge variant="outline" className="text-xs">
                New Character
              </Badge>
            )}
          </div>

          {/* Optional: Show settings/traits as small badges */}
          {character.setting && (
            <div className="mt-2">
              <Badge variant="outline" className="text-xs">
                {character.setting}
              </Badge>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Helper function to get a character emoji based on personality
function getCharacterEmoji(personality: string): string {
  const lower = personality.toLowerCase()

  if (lower.includes('cheerful') || lower.includes('happy') || lower.includes('energetic')) {
    return '😊'
  }
  if (lower.includes('mysterious') || lower.includes('dark')) {
    return '🌙'
  }
  if (lower.includes('cool') || lower.includes('calm')) {
    return '😎'
  }
  if (lower.includes('fierce') || lower.includes('warrior') || lower.includes('fighter')) {
    return '⚔️'
  }
  if (lower.includes('magical') || lower.includes('mage') || lower.includes('witch')) {
    return '✨'
  }
  if (lower.includes('cute') || lower.includes('adorable')) {
    return '🌸'
  }
  if (lower.includes('smart') || lower.includes('intelligent')) {
    return '🧠'
  }

  // Default emoji
  return '🎭'
}
