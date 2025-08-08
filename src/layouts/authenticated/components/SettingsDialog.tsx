import { api } from '@convex/_generated/api'
import { useAction } from 'convex/react'
import { ExternalLink, Eye, EyeOff } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getErrorMessage, handlePromise } from '@/lib/utils'

interface SettingsDialogProps {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
}

export function SettingsDialog({ isOpen, setIsOpen }: SettingsDialogProps) {
  const [apiKey, setApiKey] = useState('')
  const [showApiKey, setShowApiKey] = useState(false)
  const [isLoadingApiKey, setIsLoadingApiKey] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const storeApiKey = useAction(api.users.actions.storeApiKey)
  const getApiKey = useAction(api.users.actions.getApiKey)

  useEffect(() => {
    if (isOpen) {
      // Reset state when opening
      setApiKey('')
      setShowApiKey(false)
      setIsLoadingApiKey(true)

      // Fetch existing API key
      getApiKey()
        .then((key) => {
          if (key) {
            // Mask the key for display (show first 3 and last 4 characters)
            const maskedKey = `${key.slice(0, 3)}${'*'.repeat(Math.max(0, key.length - 7))}${key.slice(-4)}`
            setApiKey(maskedKey)
          }
        })
        .catch((error) => {
          console.error('Failed to fetch API key:', error)
        })
        .finally(() => {
          setIsLoadingApiKey(false)
        })
    }
  }, [isOpen, getApiKey])

  const handleSave = async () => {
    // Don't save if it's the masked key (contains asterisks)
    if (!apiKey || apiKey.includes('*')) {
      toast.error('Please enter a valid API key')
      return
    }

    // Basic validation for Replicate API key format
    if (!apiKey.startsWith('r8_') && !apiKey.startsWith('r_')) {
      toast.error('Invalid Replicate API key format')
      return
    }

    setIsSaving(true)

    const [error] = await handlePromise(storeApiKey({ apiKey }))

    if (error) {
      toast.error(getErrorMessage({ error }))
    } else {
      toast.success('API key saved successfully')
      setIsOpen(false)
    }

    setIsSaving(false)
  }

  const handleKeyChange = (value: string) => {
    // If user is typing, replace the masked value
    if (apiKey.includes('*') && value.length > 0) {
      setApiKey(value)
    } else {
      setApiKey(value)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Configure your Replicate API key to enable image and video generation
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-6 py-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Replicate API Key</CardTitle>
              <CardDescription>
                Required for AI-powered image generation and animation
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="api-key">API Key</Label>
                <div className="relative">
                  <Input
                    id="api-key"
                    type={showApiKey ? 'text' : 'password'}
                    value={apiKey}
                    onChange={(e) => handleKeyChange(e.target.value)}
                    placeholder="r8_..."
                    disabled={isLoadingApiKey}
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute top-0 right-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowApiKey((prev) => !prev)}
                    disabled={isLoadingApiKey}
                  >
                    {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    <span className="sr-only">{showApiKey ? 'Hide' : 'Show'} API Key</span>
                  </Button>
                </div>
                <p className="text-muted-foreground text-xs">
                  Your API key is encrypted and stored securely
                </p>
              </div>

              <div className="bg-muted/50 rounded-lg border p-3">
                <h4 className="mb-2 text-sm font-medium">How to get your API key:</h4>
                <ol className="text-muted-foreground flex flex-col gap-1 text-sm">
                  <li>1. Sign up or log in to Replicate</li>
                  <li>2. Go to your Account Settings</li>
                  <li>3. Navigate to API tokens</li>
                  <li>4. Create a new token or copy an existing one</li>
                </ol>
                <Button
                  variant="link"
                  size="sm"
                  className="mt-2 h-auto p-0 text-xs"
                  onClick={() => window.open('https://replicate.com/account/api-tokens', '_blank')}
                >
                  Open Replicate API Tokens
                  <ExternalLink className="ml-1 h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isSaving}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving || isLoadingApiKey || !apiKey || apiKey.includes('*')}
              isLoading={isSaving}
              loadingText="Saving..."
            >
              Save API Key
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
