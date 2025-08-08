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
          <div className="from-primary/50 to-primary/30 flex aspect-square items-center justify-center bg-gradient-to-br">
            <div className="text-primary-foreground flex flex-col items-center gap-3 transition-transform group-hover:scale-110">
              <Plus className="h-12 w-12" />
              <span className="font-bold">Create New Character</span>
            </div>
          </div>

          <div className="p-4">
            <p className="text-muted-foreground text-sm">
              Bring your anime character to life with AI.
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
          <img
            src={character.thumbnailUrl ?? ''}
            alt={character.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
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
              <Badge variant="outline" className="max-w-full text-xs">
                <span className="line-clamp-1">{character.setting}</span>
              </Badge>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
