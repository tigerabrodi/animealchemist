import { ErrorWithCode } from '../errors'

export const imageErrors = {
  IMAGE_NOT_FOUND: new ErrorWithCode({
    code: 'IMAGE_NOT_FOUND',
    message: 'Image not found',
  }),
  CHARACTER_NOT_FOUND: new ErrorWithCode({
    code: 'CHARACTER_NOT_FOUND',
    message: 'Character not found',
  }),
  GENERATION_FAILED: new ErrorWithCode({
    code: 'GENERATION_FAILED',
    message: 'Failed to generate image',
  }),
  INVALID_ASPECT_RATIO: new ErrorWithCode({
    code: 'INVALID_ASPECT_RATIO',
    message: 'Invalid aspect ratio specified',
  }),
} as const
