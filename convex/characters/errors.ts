import { ErrorWithCode } from '../errors'

export const characterErrors = {
  CHARACTER_NOT_FOUND: new ErrorWithCode({
    code: 'CHARACTER_NOT_FOUND',
    message: 'Character not found',
  }),
  CHARACTER_NAME_REQUIRED: new ErrorWithCode({
    code: 'CHARACTER_NAME_REQUIRED',
    message: 'Character name is required',
  }),
  CHARACTER_TRAITS_REQUIRED: new ErrorWithCode({
    code: 'CHARACTER_TRAITS_REQUIRED',
    message: 'Character personality and appearance are required',
  }),
  SLUG_ALREADY_EXISTS: new ErrorWithCode({
    code: 'SLUG_ALREADY_EXISTS',
    message: 'A character with this name already exists',
  }),
  NOT_CHARACTER_OWNER: new ErrorWithCode({
    code: 'NOT_CHARACTER_OWNER',
    message: 'You do not have permission to modify this character',
  }),
} as const
