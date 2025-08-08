import { Doc } from '@convex/_generated/dataModel'
import { AlertCircle, ArrowLeft, Home, Settings } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface HeaderProps {
  onSettingsClick: () => void
  currentUser: Doc<'users'>
}

export function Header({ onSettingsClick, currentUser }: HeaderProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const hasApiKey = !!currentUser.apiKey

  // Determine if we should show back button
  // Don't show on root characters page
  const showBack = location.pathname !== '/characters' && location.pathname !== '/'

  const handleBack = () => {
    void navigate(-1)
  }

  const handleHomeClick = () => {
    void navigate('/characters')
  }

  return (
    <header className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            {showBack && (
              <Button variant="ghost" size="sm" onClick={handleBack} className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            )}

            {/* Portal target for page title and subtitle */}
            <div id="header-title-portal" className="flex flex-col justify-center" />
          </div>

          <div className="flex items-center gap-2">
            {/* Portal target for page-specific actions */}
            <div id="header-actions-portal" className="flex items-center gap-2" />

            {/* Show warning if no API key */}
            {!hasApiKey && (
              <Badge
                variant="destructive"
                className="cursor-pointer gap-1"
                onClick={onSettingsClick}
              >
                <AlertCircle className="h-3 w-3" />
                API Key Required
              </Badge>
            )}

            {/* Home button - only show if not on characters page */}
            {location.pathname !== '/characters' && location.pathname !== '/' && (
              <Button variant="ghost" size="sm" onClick={handleHomeClick} className="gap-2">
                <Home className="h-4 w-4" />
                Characters
              </Button>
            )}

            <Button
              variant="ghost"
              size="icon"
              onClick={onSettingsClick}
              className={cn('relative', !hasApiKey && 'text-destructive hover:text-destructive')}
            >
              <Settings className="h-4 w-4" />
              {!hasApiKey && (
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="bg-destructive absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"></span>
                  <span className="bg-destructive relative inline-flex h-3 w-3 rounded-full"></span>
                </span>
              )}
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
