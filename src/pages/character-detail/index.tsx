import { api } from '@convex/_generated/api'
import { Id } from '@convex/_generated/dataModel'
import { useQuery } from 'convex/react'
import { Edit, Image as ImageIcon, Plus, Video } from 'lucide-react'
import { useState } from 'react'
import { generatePath, useNavigate, useParams } from 'react-router'

import { MediaGrid } from '@/components/MediaGrid'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { HeaderPortal } from '@/layouts/authenticated/components/HeaderPortal'
import { ROUTES } from '@/lib/constants'

export function CharacterDetail() {
  const { characterId } = useParams<{ characterId: Id<'characters'> }>()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('all')

  // Get character data
  const character = useQuery(
    api.characters.queries.getCharacterById,
    characterId ? { characterId: characterId } : 'skip'
  )

  // Get character's images
  const images = useQuery(
    api.images.queries.getCharacterImages,
    characterId ? { characterId: characterId } : 'skip'
  )

  // Get character's videos
  const videos = useQuery(
    api.videos.queries.getCharacterVideos,
    characterId ? { characterId: characterId } : 'skip'
  )

  const isLoading = character === undefined || images === undefined || videos === undefined
  const isNotFound = character === null

  const handleEdit = () => {
    void navigate(generatePath(ROUTES.characterEdit, { characterId: characterId! }))
  }

  const handleGenerateImage = () => {
    // Navigate to a generation page or open a modal
    // For now, we'll navigate to the first image if exists, or show a toast
    if (images && images.length > 0) {
      void navigate(
        generatePath(ROUTES.characterImageDetail, {
          characterId: characterId!,
          imageId: images[0]._id,
        })
      )
    } else {
      // Could open a modal here for direct generation
      void navigate(
        generatePath(ROUTES.characterImageDetail, { characterId: characterId!, imageId: '' })
      )
    }
  }

  if (isLoading) {
    return (
      <>
        <HeaderPortal title="Loading..." />
        <LoadingState />
      </>
    )
  }

  if (isNotFound) {
    return (
      <>
        <HeaderPortal title="Character Not Found" />
        <NotFoundState />
      </>
    )
  }

  // Combine and sort media items
  const allMedia = [
    ...(images || []).map((img) => ({
      ...img,
      type: 'image' as const,
      prompt: img.userPrompt,
    })),
    ...(videos || []).map((vid) => ({
      ...vid,
      type: 'video' as const,
    })),
  ].sort((a, b) => b.createdAt - a.createdAt)

  const filteredMedia =
    activeTab === 'all'
      ? allMedia
      : activeTab === 'images'
        ? allMedia.filter((item) => item.type === 'image')
        : allMedia.filter((item) => item.type === 'video')

  const isEmpty = allMedia.length === 0

  return (
    <>
      <HeaderPortal
        title={character.name}
        subtitle={`${images?.length || 0} images • ${videos?.length || 0} videos`}
        actions={
          <Button variant="outline" size="sm" onClick={handleEdit}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
        }
      />

      <main className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Character Info Sidebar */}
          <aside className="hidden w-80 shrink-0 lg:block">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Edit className="text-primary h-5 w-5" />
                  Character Info
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <InfoSection title="Personality" content={character.personality} />
                <InfoSection title="Appearance" content={character.appearance} />
                {character.setting && <InfoSection title="Setting" content={character.setting} />}
                {character.age && (
                  <div className="flex flex-col gap-2">
                    <h3 className="font-semibold">Age</h3>
                    <Badge variant="secondary" className="w-fit">
                      {character.age}
                    </Badge>
                  </div>
                )}
                {character.specialTraits && (
                  <InfoSection title="Special Traits" content={character.specialTraits} />
                )}
                {character.description && (
                  <InfoSection title="Description" content={character.description} />
                )}
              </CardContent>
            </Card>
          </aside>

          {/* Media Content */}
          <div className="flex-1">
            {isEmpty ? (
              <EmptyMediaState onGenerateClick={handleGenerateImage} />
            ) : (
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <TabsList className="grid w-full max-w-md grid-cols-3">
                    <TabsTrigger value="all" className="gap-2">
                      All ({allMedia.length})
                    </TabsTrigger>
                    <TabsTrigger value="images" className="gap-2">
                      <ImageIcon className="h-4 w-4" />
                      Images ({images?.length || 0})
                    </TabsTrigger>
                    <TabsTrigger value="videos" className="gap-2">
                      <Video className="h-4 w-4" />
                      Videos ({videos?.length || 0})
                    </TabsTrigger>
                  </TabsList>

                  <Button onClick={handleGenerateImage}>
                    <Plus className="mr-2 h-4 w-4" />
                    Generate
                  </Button>
                </div>

                <TabsContent value="all">
                  <MediaGrid items={filteredMedia} characterId={character._id} />
                </TabsContent>

                <TabsContent value="images">
                  {filteredMedia.length === 0 ? (
                    <NoContentState type="images" onGenerateClick={handleGenerateImage} />
                  ) : (
                    <MediaGrid items={filteredMedia} characterId={character._id} />
                  )}
                </TabsContent>

                <TabsContent value="videos">
                  {filteredMedia.length === 0 ? (
                    <NoContentState type="videos" />
                  ) : (
                    <MediaGrid items={filteredMedia} characterId={character._id} />
                  )}
                </TabsContent>
              </Tabs>
            )}
          </div>
        </div>
      </main>
    </>
  )
}

function InfoSection({ title, content }: { title: string; content: string }) {
  return (
    <div className="flex flex-col gap-2">
      <h3 className="font-semibold">{title}</h3>
      <p className="text-muted-foreground text-sm">{content}</p>
    </div>
  )
}

function LoadingState() {
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex gap-8">
        {/* Sidebar skeleton */}
        <aside className="hidden w-80 shrink-0 lg:block">
          <Card>
            <CardContent className="space-y-4 p-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="bg-muted h-4 w-20 animate-pulse rounded" />
                  <div className="bg-muted h-12 animate-pulse rounded" />
                </div>
              ))}
            </CardContent>
          </Card>
        </aside>

        {/* Content skeleton */}
        <div className="flex-1">
          <div className="bg-muted mb-6 h-10 w-full max-w-md animate-pulse rounded-lg" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-muted aspect-square animate-pulse rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}

function NotFoundState() {
  const navigate = useNavigate()

  return (
    <main className="container mx-auto px-4 py-8">
      <Card className="mx-auto max-w-2xl">
        <CardContent className="py-12 text-center">
          <h2 className="mb-4 text-2xl font-bold">Character Not Found</h2>
          <p className="text-muted-foreground mb-6">
            The character you&apos;re looking for doesn&apos;t exist or you don&apos;t have access
            to it.
          </p>
          <Button onClick={() => navigate('/characters')}>Back to Characters</Button>
        </CardContent>
      </Card>
    </main>
  )
}

function EmptyMediaState({ onGenerateClick }: { onGenerateClick: () => void }) {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
        <div className="mb-4 text-6xl">🎨</div>
        <h3 className="mb-2 text-lg font-semibold">No Content Yet</h3>
        <p className="text-muted-foreground mb-6 max-w-sm text-sm">
          Start bringing your character to life by generating their first image!
        </p>
        <Button onClick={onGenerateClick}>
          <Plus className="mr-2 h-4 w-4" />
          Generate First Image
        </Button>
      </CardContent>
    </Card>
  )
}

function NoContentState({
  type,
  onGenerateClick,
}: {
  type: 'images' | 'videos'
  onGenerateClick?: () => void
}) {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
        <div className="mb-4 text-6xl">{type === 'images' ? '🖼️' : '🎬'}</div>
        <h3 className="mb-2 text-lg font-semibold">
          No {type === 'images' ? 'Images' : 'Videos'} Yet
        </h3>
        <p className="text-muted-foreground mb-6 max-w-sm text-sm">
          {type === 'images'
            ? "Generate images to capture your character's essence"
            : "Create videos by animating your character's images"}
        </p>
        {type === 'images' && onGenerateClick && (
          <Button onClick={onGenerateClick}>
            <Plus className="mr-2 h-4 w-4" />
            Generate Image
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
