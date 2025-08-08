import { api } from '@convex/_generated/api'
import { Id } from '@convex/_generated/dataModel'
import { FunctionReturnType } from 'convex/server'
import { Clock, Image, Play } from 'lucide-react'
import { generatePath, useNavigate } from 'react-router'

import { Badge } from '@/components/ui/badge'
import { ROUTES } from '@/lib/constants'
import { cn } from '@/lib/utils'

type ImageItem = FunctionReturnType<typeof api.images.queries.getCharacterImages>[0] & {
  type: 'image'
}

type VideoItem = FunctionReturnType<typeof api.videos.queries.getCharacterVideos>[0] & {
  type: 'video'
}

type MediaItem = ImageItem | VideoItem

interface MediaGridProps {
  items: Array<MediaItem>
  characterId: string
  className?: string
  onImageMouseEnter: (imageId: Id<'images'>) => void
  onVideoMouseEnter: (videoId: Id<'videos'>) => void
}

export function MediaGrid({
  items,
  characterId,
  className,
  onImageMouseEnter,
  onVideoMouseEnter,
}: MediaGridProps) {
  const navigate = useNavigate()

  const handleItemClick = (item: MediaItem) => {
    if (item.type === 'image') {
      void navigate(generatePath(ROUTES.characterImageDetail, { characterId, imageId: item._id }))
    } else {
      void navigate(generatePath(ROUTES.characterVideoDetail, { characterId, videoId: item._id }))
    }
  }

  return (
    <div className={cn('grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3', className)}>
      {items.map((item) => (
        <MediaGridItem
          key={item._id}
          item={item}
          onClick={() => handleItemClick(item)}
          onImageMouseEnter={onImageMouseEnter}
          onVideoMouseEnter={onVideoMouseEnter}
        />
      ))}
    </div>
  )
}

interface MediaGridItemProps {
  item: MediaItem
  onClick: () => void
  onImageMouseEnter: (imageId: Id<'images'>) => void
  onVideoMouseEnter: (videoId: Id<'videos'>) => void
}

function MediaGridItem({
  item,
  onClick,
  onImageMouseEnter,
  onVideoMouseEnter,
}: MediaGridItemProps) {
  const isVideo = item.type === 'video'
  const createdDate = new Date(item.createdAt)

  return (
    <div
      className="group bg-card cursor-pointer overflow-hidden rounded-lg border transition-all hover:shadow-lg"
      onClick={onClick}
      onMouseEnter={() => {
        if (item.type === 'image') {
          onImageMouseEnter(item._id)
        } else {
          onVideoMouseEnter(item._id)
        }
      }}
    >
      {/* Thumbnail */}
      <div className="bg-muted relative aspect-square overflow-hidden">
        <img
          src={(isVideo ? item.sourceImageUrl : item.url) ?? ''}
          alt={isVideo ? item.prompt : item.userPrompt}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
        />

        {/* Overlay for videos */}
        {isVideo && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/90">
              <Play className="ml-1 h-8 w-8 text-black" />
            </div>
          </div>
        )}

        {/* Type badge */}
        <div className="absolute top-2 left-2">
          <Badge variant={isVideo ? 'default' : 'secondary'} className="gap-1 backdrop-blur-sm">
            {isVideo ? (
              <>
                <Play className="h-3 w-3" />
                Video
              </>
            ) : (
              <>
                <Image className="h-3 w-3" />
                Image
              </>
            )}
          </Badge>
        </div>

        {/* Duration badge for videos */}
        {isVideo && item.duration && (
          <div className="absolute right-2 bottom-2">
            <Badge variant="secondary" className="gap-1 backdrop-blur-sm">
              <Clock className="h-3 w-3" />
              {item.duration}s
            </Badge>
          </div>
        )}

        {/* Aspect ratio badge for images */}
        {!isVideo && item.aspectRatio && (
          <div className="absolute right-2 bottom-2">
            <Badge variant="secondary" className="backdrop-blur-sm">
              {item.aspectRatio}
            </Badge>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <p className="mb-2 line-clamp-2 text-sm font-medium">
          {isVideo ? item.prompt : item.userPrompt}
        </p>

        {/* Source info for videos */}
        {isVideo && item.sourceImagePrompt && (
          <p className="text-muted-foreground mb-2 line-clamp-1 text-xs">
            From: {item.sourceImagePrompt}
          </p>
        )}

        {/* Generation type for images */}
        {!isVideo && (
          <div className="mb-2">
            <Badge variant="outline" className="text-xs">
              {item.generationType === 'initial'
                ? 'Initial'
                : item.generationType === 'text2img'
                  ? 'Generated'
                  : 'Variation'}
            </Badge>
          </div>
        )}

        {/* Timestamp */}
        <p className="text-muted-foreground text-xs">
          {createdDate.toLocaleDateString()} at {createdDate.toLocaleTimeString()}
        </p>
      </div>
    </div>
  )
}
