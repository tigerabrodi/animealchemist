import { api } from '@convex/_generated/api'
import { useConvexAuth, useQuery } from 'convex/react'
import { Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { generatePath, Outlet, useNavigate } from 'react-router'

import { Header } from './components/Header'
import { SettingsDialog } from './components/SettingsDialog'

import { ROUTES } from '@/lib/constants'

export function AuthenticatedLayout() {
  const user = useQuery(api.users.queries.getCurrentUser)
  const state = useConvexAuth()
  const isLoading = user === undefined || state.isLoading
  const navigate = useNavigate()
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  useEffect(() => {
    if (!isLoading && !user) {
      void navigate(generatePath(ROUTES.login))
    }
  }, [isLoading, user, navigate])

  if (isLoading || !user) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="size-10 animate-spin" />
      </div>
    )
  }

  return (
    <>
      <Header onSettingsClick={() => setIsSettingsOpen(true)} currentUser={user} />
      <Outlet context={{ currentUser: user }} />
      <SettingsDialog isOpen={isSettingsOpen} setIsOpen={setIsSettingsOpen} />
    </>
  )
}
