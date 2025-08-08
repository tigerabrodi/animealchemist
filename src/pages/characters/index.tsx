import { api } from '@convex/_generated/api'
import { Id } from '@convex/_generated/dataModel'
import { useQuery } from 'convex/react'
import { Plus, Search } from 'lucide-react'
import { useState } from 'react'
import { generatePath, useNavigate } from 'react-router'

import { CharacterCard } from './components/CharacterCard'

import NarutoCartoonPng from '@/assets/naruto-cartoon.png'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { usePrefetchQuery } from '@/hooks/usePrefetchQuery'
import { HeaderPortal } from '@/layouts/authenticated/components/HeaderPortal'
import { ROUTES } from '@/lib/constants'

export function CharactersGrid() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const prefetchCharacterDetail = usePrefetchQuery(api.characters.queries.getCharacterById)

  const prefetchImages = usePrefetchQuery(api.images.queries.getCharacterImages)

  const prefetchVideos = usePrefetchQuery(api.videos.queries.getCharacterVideos)

  const characters = useQuery(api.characters.queries.getUserCharacters)
  const isLoading = characters === undefined
  const isEmpty = characters?.length === 0

  // Filter characters based on search
  const filteredCharacters =
    characters?.filter(
      (character) =>
        character.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        character.personality.toLowerCase().includes(searchQuery.toLowerCase()) ||
        character.appearance.toLowerCase().includes(searchQuery.toLowerCase()) ||
        character.setting?.toLowerCase().includes(searchQuery.toLowerCase())
    ) || []

  const handleCreateCharacter = () => {
    void navigate(ROUTES.characterCreate)
  }

  const handleCharacterClick = (characterId: string) => {
    void navigate(generatePath(ROUTES.characterDetail, { characterId }))
  }

  const handlePrefetchCharacter = (characterId: Id<'characters'>) => {
    void prefetchCharacterDetail({ characterId })
    void prefetchImages({ characterId })
    void prefetchVideos({ characterId })
  }

  if (isLoading) {
    return (
      <>
        <HeaderPortal title="My Characters" subtitle="Loading your collection..." />
        <LoadingState />
      </>
    )
  }

  if (isEmpty && !searchQuery) {
    return (
      <>
        <HeaderPortal title="My Characters" subtitle="Start your anime journey" />
        <EmptyState onCreateClick={handleCreateCharacter} />
      </>
    )
  }

  return (
    <>
      <HeaderPortal
        title="My Characters"
        subtitle={`${characters?.length || 0} character${characters?.length !== 1 ? 's' : ''} created`}
        actions={
          <Button onClick={handleCreateCharacter}>
            <Plus className="mr-2 h-4 w-4" />
            Create Character
          </Button>
        }
      />

      <main className="container mx-auto px-4 py-8">
        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
              placeholder="Search characters by name, personality, or setting..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Characters Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {/* Create New Card */}
          <CharacterCard isCreateNew onClick={handleCreateCharacter} />

          {/* Character Cards */}
          {filteredCharacters.map((character) => (
            <CharacterCard
              key={character._id}
              character={character}
              onClick={() => handleCharacterClick(character._id)}
              onMouseEnter={() => handlePrefetchCharacter(character._id)}
            />
          ))}
        </div>

        {/* No Results */}
        {filteredCharacters.length === 0 && searchQuery && (
          <div className="py-16 text-center">
            <h3 className="mb-2 text-xl font-semibold">No characters found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search terms or create a new character.
            </p>
          </div>
        )}
      </main>
    </>
  )
}

function LoadingState() {
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="bg-muted h-10 w-full max-w-md animate-pulse rounded-md" />
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-muted aspect-square rounded-lg" />
            <div className="mt-4 space-y-2">
              <div className="bg-muted h-4 rounded" />
              <div className="bg-muted h-3 rounded" />
              <div className="flex gap-2">
                <div className="bg-muted h-6 w-16 rounded" />
                <div className="bg-muted h-6 w-20 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}

function EmptyState({ onCreateClick }: { onCreateClick: () => void }) {
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 text-center">
        <img src={NarutoCartoonPng} alt="Naruto Cartoon" className="size-24" />

        <div className="flex flex-col gap-2">
          <h2 className="text-3xl font-bold">Create Your First Character</h2>
          <p className="text-muted-foreground max-w-md text-lg">
            Start your anime character creation journey! Design unique characters and bring them to
            life with AI-generated images and videos.
          </p>
        </div>

        <Button onClick={onCreateClick} size="lg" className="gap-2">
          <Plus className="h-5 w-5" />
          Create Your First Character
        </Button>
      </div>
    </main>
  )
}
