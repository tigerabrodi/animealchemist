import { BrowserRouter, Navigate, Route, Routes } from 'react-router'

import { Toaster } from './components/ui/sonner'
import { AuthenticatedLayout } from './layouts/authenticated'
import { ROUTES } from './lib/constants'
import { CharacterCreate } from './pages/character-create'
import { CharacterDetail } from './pages/character-detail'
import { CharacterEdit } from './pages/character-edit'
import { ImageDetail } from './pages/character-image-detail'
import { VideoDetail } from './pages/character-video-detail'
import { CharactersGrid } from './pages/characters'
import { LoginPage } from './pages/login'

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={ROUTES.login} element={<LoginPage />} />
        <Route element={<AuthenticatedLayout />}>
          <Route path="/" element={<Navigate to={ROUTES.characters} replace />} />
          <Route path={ROUTES.characters} element={<CharactersGrid />} />
          <Route path={ROUTES.characterEdit} element={<CharacterEdit />} />
          <Route path={ROUTES.characterCreate} element={<CharacterCreate />} />
          <Route path={ROUTES.characterDetail} element={<CharacterDetail />} />
          <Route path={ROUTES.characterImageDetail} element={<ImageDetail />} />
          <Route path={ROUTES.characterVideoDetail} element={<VideoDetail />} />
        </Route>
      </Routes>
      <Toaster />
    </BrowserRouter>
  )
}
