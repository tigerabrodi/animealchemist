import { ErrorWithCode } from '../errors'

export const videoErrors = {
  VIDEO_NOT_FOUND: new ErrorWithCode({
    code: 'VIDEO_NOT_FOUND',
    message: 'Video not found',
  }),
  SOURCE_IMAGE_NOT_FOUND: new ErrorWithCode({
    code: 'SOURCE_IMAGE_NOT_FOUND',
    message: 'Source image not found',
  }),
  GENERATION_FAILED: new ErrorWithCode({
    code: 'VIDEO_GENERATION_FAILED',
    message: 'Failed to generate video',
  }),
  INVALID_DURATION: new ErrorWithCode({
    code: 'INVALID_DURATION',
    message: 'Video duration must be either 5 or 10 seconds',
  }),
} as const
