import { api } from '@convex/_generated/api'
import { Id } from '@convex/_generated/dataModel'
import { useMutation, useQuery } from 'convex/react'
import {
  Clock,
  Download,
  ExternalLink,
  Image as ImageIcon,
  Pause,
  Play,
  Trash2,
  Video as VideoIcon,
} from 'lucide-react'
import { useRef, useState } from 'react'
import { generatePath, useNavigate, useParams } from 'react-router'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { HeaderPortal } from '@/layouts/authenticated/components/HeaderPortal'
import { ROUTES } from '@/lib/constants'
import { getErrorMessage, handlePromise } from '@/lib/utils'

export function VideoDetail() {
  const { characterId, videoId } = useParams<{
    characterId: Id<'characters'>
    videoId: Id<'videos'>
  }>()

  const navigate = useNavigate()
  const videoRef = useRef<HTMLVideoElement>(null)

  const [isPlaying, setIsPlaying] = useState(false)

  // Get video data
  const video = useQuery(api.videos.queries.getVideoById, videoId ? { videoId: videoId } : 'skip')

  const deleteVideo = useMutation(api.videos.mutations.deleteVideo)

  const isLoading = video === undefined
  const isNotFound = video === null

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        void videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleSourceImageClick = () => {
    if (video?.sourceImage) {
      void navigate(
        generatePath(ROUTES.characterImageDetail, {
          characterId: characterId!,
          imageId: video.sourceImage._id,
        })
      )
    }
  }

  const handleDownload = () => {
    if (video) {
      const link = document.createElement('a')
      link.href = video.url ?? ''
      link.download = `${video.character.name}_video_${video._id}.mp4`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const handleDelete = async () => {
    if (!videoId || !confirm('Are you sure you want to delete this video?')) return

    const [error] = await handlePromise(deleteVideo({ videoId: videoId }))

    if (error) {
      toast.error(getErrorMessage({ error }))
    } else {
      toast.success('Video deleted')
      void navigate(generatePath(ROUTES.characterDetail, { characterId: characterId! }))
    }
  }

  const handleCreateAnotherAnimation = () => {
    if (video?.sourceImage) {
      void navigate(
        generatePath(ROUTES.characterImageDetail, {
          characterId: characterId!,
          imageId: video.sourceImage._id,
        })
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
        <HeaderPortal title="Video Not Found" />
        <NotFoundState characterId={characterId} />
      </>
    )
  }

  // Check if video is still processing (you might have a status field)
  const isProcessing = false // You could add a status field to track this

  if (isProcessing) {
    return (
      <>
        <HeaderPortal title="Processing Video" />
        <ProcessingState />
      </>
    )
  }

  return (
    <>
      <HeaderPortal
        title={video.character.name}
        subtitle="Video Animation"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleDownload}>
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
            <Button variant="outline" size="sm" onClick={handleDelete}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        }
      />

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Video Player */}
          <div className="lg:col-span-2">
            <Card className="overflow-hidden">
              <div className="relative aspect-square bg-black">
                <video
                  ref={videoRef}
                  src={video.url ?? ''}
                  className="h-full w-full object-contain"
                  loop
                  playsInline
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                />

                {/* Video Controls Overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-opacity duration-300 hover:opacity-100">
                  <div className="flex items-center gap-4 rounded-xl bg-black/60 p-2 backdrop-blur-sm">
                    <Button
                      variant="ghost"
                      onClick={handlePlayPause}
                      className="text-white hover:bg-white/20"
                    >
                      {isPlaying ? (
                        <Pause className="h-6 w-6" />
                      ) : (
                        <Play className="ml-1 h-6 w-6" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Duration Badge */}
                <div className="absolute top-4 right-4">
                  <Badge className="gap-1 border-none bg-black/60 text-white backdrop-blur-sm">
                    <Clock className="h-3 w-3" />
                    {video.duration}s
                  </Badge>
                </div>
              </div>
            </Card>
          </div>

          {/* Video Details Sidebar */}
          <div className="flex flex-col gap-6">
            {/* Video Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <VideoIcon className="text-primary h-5 w-5" />
                  Video Details
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div>
                  <Label className="text-sm font-medium">Animation Prompt</Label>
                  <p className="text-muted-foreground mt-1 text-sm">{video.prompt}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-sm font-medium">Duration</Label>
                    <Badge variant="secondary">{video.duration} seconds</Badge>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-sm font-medium">FPS</Label>
                    <Badge variant="outline">{video.fps || 24} fps</Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-sm font-medium">Dimensions</Label>
                    <p className="text-muted-foreground text-sm">
                      {video.width} × {video.height}
                    </p>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-sm font-medium">Model</Label>
                    <Badge variant="outline" className="text-xs">
                      seedance-1-pro
                    </Badge>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Created</Label>
                  <p className="text-muted-foreground mt-1 text-sm">
                    {new Date(video.createdAt).toLocaleDateString()} at{' '}
                    {new Date(video.createdAt).toLocaleTimeString()}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Source Image */}
            {video.sourceImage && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ImageIcon className="text-accent h-5 w-5" />
                    Source Image
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="group cursor-pointer" onClick={handleSourceImageClick}>
                    <div className="bg-muted mb-3 aspect-square overflow-hidden rounded-lg">
                      <img
                        src={video.sourceImage.url ?? ''}
                        alt={video.sourceImage.userPrompt}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <p className="text-muted-foreground line-clamp-2 text-sm">
                        {video.sourceImage.userPrompt}
                      </p>

                      <Button
                        variant="outline"
                        size="sm"
                        className="group-hover:bg-accent/20 w-full"
                      >
                        <ExternalLink className="mr-2 h-4 w-4" />
                        View Source Image
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <Button variant="outline" className="w-full justify-start" onClick={handleDownload}>
                  <Download className="mr-2 h-4 w-4" />
                  Download Video (MP4)
                </Button>

                {video.sourceImage && (
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={handleCreateAnotherAnimation}
                  >
                    <VideoIcon className="mr-2 h-4 w-4" />
                    Create Another Animation
                  </Button>
                )}

                {video.sourceImage && (
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={handleSourceImageClick}
                  >
                    <ImageIcon className="mr-2 h-4 w-4" />
                    Edit Source Image
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </>
  )
}

function LoadingState() {
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <div className="bg-muted aspect-square animate-pulse" />
          </Card>
        </div>
        <div className="flex flex-col gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="bg-muted h-4 w-24 animate-pulse rounded" />
                  <div className="bg-muted h-20 animate-pulse rounded" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </main>
  )
}

function NotFoundState({ characterId }: { characterId?: string }) {
  const navigate = useNavigate()

  return (
    <main className="container mx-auto px-4 py-8">
      <Card className="mx-auto max-w-2xl">
        <CardContent className="py-12 text-center">
          <h2 className="mb-4 text-2xl font-bold">Video Not Found</h2>
          <p className="text-muted-foreground mb-6">
            The video you&apos;re looking for doesn&apos;t exist or has been deleted.
          </p>
          <Button
            onClick={() => navigate(characterId ? `/character/${characterId}` : '/characters')}
          >
            Back to {characterId ? 'Character' : 'Characters'}
          </Button>
        </CardContent>
      </Card>
    </main>
  )
}

function ProcessingState() {
  return (
    <main className="container mx-auto px-4 py-8">
      <Card className="mx-auto max-w-2xl">
        <CardContent className="py-12 text-center">
          <div className="from-primary/20 to-primary/10 mx-auto mb-6 flex h-20 w-20 animate-pulse items-center justify-center rounded-full bg-gradient-to-br">
            <VideoIcon className="text-primary h-10 w-10" />
          </div>

          <h2 className="mb-4 text-2xl font-bold">Processing Video</h2>
          <p className="text-muted-foreground mb-6">
            Your video is still being processed. This usually takes a few minutes...
          </p>

          <div className="flex flex-col gap-3 text-left">
            <div className="flex items-center gap-3">
              <div className="bg-primary h-2 w-2 animate-pulse rounded-full" />
              <span className="text-muted-foreground text-sm">Rendering frames...</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-accent h-2 w-2 animate-pulse rounded-full" />
              <span className="text-muted-foreground text-sm">Applying motion effects...</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-muted-foreground h-2 w-2 animate-pulse rounded-full" />
              <span className="text-muted-foreground text-sm">Finalizing video...</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
