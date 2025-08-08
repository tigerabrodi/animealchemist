export const ROUTES = {
  login: '/',
  characters: '/characters',
  characterDetail: '/characters/:characterId',
  characterCreate: '/character/create',
  characterEdit: '/character/:characterId/edit',
  characterImageDetail: '/character/:characterId/image/:imageId',
  characterVideoDetail: '/character/:characterId/video/:videoId',
} as const

export const TAB_VALUES = {
  LOGIN: 'login',
  REGISTER: 'register',
} as const
