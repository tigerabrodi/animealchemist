import { api } from '@convex/_generated/api'
import { Id } from '@convex/_generated/dataModel'
import { useAction, useMutation, useQuery } from 'convex/react'
import {
  Copy,
  Download,
  Image as ImageIcon,
  Palette,
  Play,
  RefreshCw,
  Trash2,
  Video,
  Wand2,
} from 'lucide-react'
import { useState } from 'react'
import { generatePath, useNavigate, useParams } from 'react-router'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Textarea } from '@/components/ui/textarea'
import { HeaderPortal } from '@/layouts/authenticated/components/HeaderPortal'
import { ROUTES } from '@/lib/constants'
import { getErrorMessage, handlePromise } from '@/lib/utils'

export function ImageDetail() {
  const { characterId, imageId } = useParams<{
    characterId: Id<'characters'>
    imageId: Id<'images'>
  }>()
  const navigate = useNavigate()

  // State for generation forms
  const [variationPrompt, setVariationPrompt] = useState('')
  const [variationStrength, setVariationStrength] = useState([0.7])
  const [isGeneratingVariation, setIsGeneratingVariation] = useState(false)

  const [videoPrompt, setVideoPrompt] = useState('')
  const [videoDuration, setVideoDuration] = useState('3')
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false)

  // Get image data
  const image = useQuery(api.images.queries.getImageById, imageId ? { imageId: imageId } : 'skip')

  // Actions
  const generateVariation = useAction(api.images.actions.generateImageVariation)
  const generateVideo = useAction(api.videos.actions.generateVideo)
  const deleteImage = useMutation(api.images.mutations.deleteImage)

  const isLoading = image === undefined
  const isNotFound = image === null

  const handleGenerateVariation = async () => {
    if (!imageId || !variationPrompt.trim()) return

    setIsGeneratingVariation(true)

    const [error] = await handlePromise(
      generateVariation({
        imageId: imageId,
        prompt: variationPrompt,
        strength: variationStrength[0],
      })
    )

    if (error) {
      toast.error(getErrorMessage({ error }))
    } else {
      toast.success('Image variation generated!')
      // Reset form
      setVariationPrompt('')
      setVariationStrength([0.7])
      // Refresh the page or navigate to new image
      void navigate(generatePath(ROUTES.characterDetail, { characterId: characterId! }))
    }

    setIsGeneratingVariation(false)
  }

  const handleGenerateVideo = async () => {
    if (!imageId || !videoPrompt.trim()) return

    setIsGeneratingVideo(true)

    const [error] = await handlePromise(
      generateVideo({
        imageId: imageId,
        prompt: videoPrompt,
        duration: parseInt(videoDuration),
      })
    )

    if (error) {
      toast.error(getErrorMessage({ error }))
    } else {
      toast.success('Video animation started!')
      // Reset form
      setVideoPrompt('')
      setVideoDuration('3')
      // Navigate to character page to see the video
      void navigate(generatePath(ROUTES.characterDetail, { characterId: characterId! }))
    }

    setIsGeneratingVideo(false)
  }

  const handleCopyPrompt = () => {
    if (image) {
      void navigator.clipboard.writeText(image.userPrompt)
      toast.success('Prompt copied to clipboard')
    }
  }

  const handleDownload = async () => {
    if (!image?.url) return

    try {
      // Fetch the image as a blob
      const response = await fetch(image.url)
      if (!response.ok) {
        throw new Error('Failed to fetch image')
      }

      const blob = await response.blob()

      // Create a blob URL
      const blobUrl = window.URL.createObjectURL(blob)

      // Create and trigger download link
      const link = document.createElement('a')
      link.href = blobUrl
      link.download = `${image.character.name}_${image._id}.webp`
      link.style.display = 'none'

      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      // Clean up the blob URL
      window.URL.revokeObjectURL(blobUrl)

      toast.success('Image downloaded successfully')
    } catch (_error) {
      toast.error('Failed to download image')
    }
  }

  const handleDelete = async () => {
    if (!imageId || !confirm('Are you sure you want to delete this image?')) return

    const [error] = await handlePromise(deleteImage({ imageId: imageId }))

    if (error) {
      toast.error(getErrorMessage({ error }))
    } else {
      toast.success('Image deleted')
      void navigate(generatePath(ROUTES.characterDetail, { characterId: characterId! }))
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
        <HeaderPortal title="Image Not Found" />
        <NotFoundState characterId={characterId} />
      </>
    )
  }

  if (isGeneratingVariation) {
    return (
      <>
        <HeaderPortal title="Generating Variation" />
        <GeneratingVariationState characterName={image.character.name} />
      </>
    )
  }

  if (isGeneratingVideo) {
    return (
      <>
        <HeaderPortal title="Creating Animation" />
        <GeneratingVideoState characterName={image.character.name} duration={videoDuration} />
      </>
    )
  }

  return (
    <>
      <HeaderPortal
        title={image.character.name}
        subtitle="Image Details"
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
          {/* Image Display */}
          <div className="lg:col-span-2">
            <Card className="overflow-hidden">
              <div className="bg-muted aspect-square">
                <img
                  src={image.url ?? ''}
                  alt={image.userPrompt}
                  className="h-full w-full object-contain"
                />
              </div>
            </Card>
          </div>

          {/* Controls Sidebar */}
          <div className="flex flex-col gap-6">
            {/* Image Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="text-primary h-5 w-5" />
                  Image Details
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div>
                  <Label className="text-sm font-medium">Original Prompt</Label>
                  <div className="mt-1 flex items-start gap-2">
                    <p className="text-muted-foreground flex-1 text-sm">{image.userPrompt}</p>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={handleCopyPrompt}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Aspect Ratio</Label>
                    <Badge variant="secondary" className="mt-1">
                      {image.aspectRatio}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Type</Label>
                    <Badge variant="outline" className="mt-1">
                      {image.generationType === 'initial'
                        ? 'Initial'
                        : image.generationType === 'text2img'
                          ? 'Generated'
                          : 'Variation'}
                    </Badge>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Created</Label>
                  <p className="text-muted-foreground mt-1 text-sm">
                    {new Date(image.createdAt).toLocaleDateString()} at{' '}
                    {new Date(image.createdAt).toLocaleTimeString()}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Generate Variation */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="text-accent h-5 w-5" />
                  Generate Variation
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div>
                  <Label htmlFor="variation-prompt">Variation Prompt</Label>
                  <Textarea
                    id="variation-prompt"
                    placeholder="How would you like to modify this image?"
                    value={variationPrompt}
                    onChange={(e) => setVariationPrompt(e.target.value)}
                    className="mt-1"
                    rows={3}
                  />
                </div>

                <div>
                  <Label>Variation Strength: {variationStrength[0]}</Label>
                  <Slider
                    value={variationStrength}
                    onValueChange={setVariationStrength}
                    max={1}
                    min={0.1}
                    step={0.1}
                    className="mt-2"
                  />
                  <div className="text-muted-foreground mt-1 flex justify-between text-xs">
                    <span>More Similar</span>
                    <span>More Different</span>
                  </div>
                </div>

                <Button
                  onClick={handleGenerateVariation}
                  disabled={!variationPrompt.trim() || isGeneratingVariation}
                  isLoading={isGeneratingVariation}
                  loadingText="Generating..."
                >
                  <Wand2 className="mr-2 h-4 w-4" />
                  Generate Variation
                </Button>
              </CardContent>
            </Card>

            {/* Generate Video */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Video className="text-warning h-5 w-5" />
                  Animate This Image
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div>
                  <Label htmlFor="video-prompt">
                    Animation Prompt <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="video-prompt"
                    placeholder="Describe what the character should do (e.g., 'waving at the camera', 'walking forward')"
                    value={videoPrompt}
                    onChange={(e) => setVideoPrompt(e.target.value)}
                    className="mt-1"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="video-duration">Duration</Label>
                  <Select value={videoDuration} onValueChange={setVideoDuration}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2">2 seconds</SelectItem>
                      <SelectItem value="3">3 seconds</SelectItem>
                      <SelectItem value="4">4 seconds</SelectItem>
                      <SelectItem value="5">5 seconds</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={handleGenerateVideo}
                  disabled={!videoPrompt.trim() || isGeneratingVideo}
                  isLoading={isGeneratingVideo}
                  loadingText="Creating..."
                >
                  <Video className="mr-2 h-4 w-4" />
                  Create Animation ({videoDuration}s)
                </Button>
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
          <h2 className="mb-4 text-2xl font-bold">Image Not Found</h2>
          <p className="text-muted-foreground mb-6">
            The image you&apos;re looking for doesn&apos;t exist or has been deleted.
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

function GeneratingVariationState({ characterName }: { characterName: string }) {
  return (
    <main className="container mx-auto px-4 py-8">
      <Card className="mx-auto max-w-2xl">
        <CardContent className="py-12 text-center">
          <div className="from-accent/20 to-accent/10 mx-auto mb-6 flex h-20 w-20 animate-pulse items-center justify-center rounded-full bg-gradient-to-br">
            <RefreshCw className="text-accent h-10 w-10 animate-spin" />
          </div>

          <h2 className="mb-4 text-2xl font-bold">Creating Image Variation</h2>
          <p className="text-muted-foreground mb-6">
            Generating a new variation of {characterName}&apos;s image with your custom prompt...
          </p>

          <div className="flex flex-col gap-3 text-left">
            <div className="flex items-center gap-3">
              <div className="bg-accent h-2 w-2 animate-pulse rounded-full" />
              <span className="text-muted-foreground text-sm">Processing original image...</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-primary h-2 w-2 animate-pulse rounded-full" />
              <span className="text-muted-foreground text-sm">Applying variation prompt...</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-muted-foreground h-2 w-2 animate-pulse rounded-full" />
              <span className="text-muted-foreground text-sm">Generating new image...</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}

function GeneratingVideoState({
  characterName,
  duration,
}: {
  characterName: string
  duration: string
}) {
  return (
    <main className="container mx-auto px-4 py-8">
      <Card className="mx-auto max-w-2xl">
        <CardContent className="py-12 text-center">
          <div className="from-primary/20 to-primary/10 mx-auto mb-6 flex h-20 w-20 animate-pulse items-center justify-center rounded-full bg-gradient-to-br">
            <Play className="text-primary h-10 w-10" />
          </div>

          <h2 className="mb-4 text-2xl font-bold">Animating {characterName}</h2>
          <p className="text-muted-foreground mb-6">
            Creating a {duration}-second video animation from this image...
          </p>

          <div className="flex flex-col gap-3 text-left">
            <div className="flex items-center gap-3">
              <div className="bg-primary h-2 w-2 animate-pulse rounded-full" />
              <span className="text-muted-foreground text-sm">Analyzing image composition...</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-accent h-2 w-2 animate-pulse rounded-full" />
              <span className="text-muted-foreground text-sm">Generating motion sequence...</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-warning h-2 w-2 animate-pulse rounded-full" />
              <span className="text-muted-foreground text-sm">Rendering video frames...</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-muted-foreground h-2 w-2 animate-pulse rounded-full" />
              <span className="text-muted-foreground text-sm">Finalizing animation...</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
