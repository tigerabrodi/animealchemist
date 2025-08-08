import { api } from '@convex/_generated/api'
import { Id } from '@convex/_generated/dataModel'
import { useMutation, useQuery } from 'convex/react'
import { Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { generatePath, useNavigate, useParams } from 'react-router'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { HeaderPortal } from '@/layouts/authenticated/components/HeaderPortal'
import { ROUTES } from '@/lib/constants'
import { getErrorMessage, handlePromise } from '@/lib/utils'

interface CharacterFormData {
  name: string
  personality: string
  appearance: string
  setting: string
  age: string
  specialTraits: string
  description: string
}

export function CharacterEdit() {
  const { characterId } = useParams<{ characterId: Id<'characters'> }>()
  const navigate = useNavigate()
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState<CharacterFormData>({
    name: '',
    personality: '',
    appearance: '',
    setting: '',
    age: '',
    specialTraits: '',
    description: '',
  })

  // Get character data
  const character = useQuery(
    api.characters.queries.getCharacterById,
    characterId ? { characterId: characterId } : 'skip'
  )
  const updateCharacter = useMutation(api.characters.mutations.updateCharacter)

  // Populate form when character loads
  useEffect(() => {
    if (character) {
      setFormData({
        name: character.name || '',
        personality: character.personality || '',
        appearance: character.appearance || '',
        setting: character.setting || '',
        age: character.age || '',
        specialTraits: character.specialTraits || '',
        description: character.description || '',
      })
    }
  }, [character])

  const handleInputChange = (field: keyof CharacterFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    if (!characterId) return

    // Validate required fields
    if (!formData.name.trim() || !formData.personality.trim() || !formData.appearance.trim()) {
      toast.error('Please fill in all required fields')
      return
    }

    setIsSaving(true)

    const [error] = await handlePromise(
      updateCharacter({
        characterId: characterId,
        name: formData.name,
        personality: formData.personality,
        appearance: formData.appearance,
        setting: formData.setting || undefined,
        age: formData.age || undefined,
        specialTraits: formData.specialTraits || undefined,
        description: formData.description || undefined,
      })
    )

    if (error) {
      toast.error(getErrorMessage({ error }))
    } else {
      toast.success('Character updated successfully')
      void navigate(generatePath(ROUTES.characterDetail, { characterId: characterId }))
    }

    setIsSaving(false)
  }

  // Loading state
  if (character === undefined) {
    return (
      <>
        <HeaderPortal title="Edit Character" />
        <LoadingState />
      </>
    )
  }

  // Not found state
  if (character === null) {
    return (
      <>
        <HeaderPortal title="Character Not Found" />
        <NotFoundState />
      </>
    )
  }

  const isFormValid = formData.name && formData.personality && formData.appearance

  return (
    <>
      <HeaderPortal title="Edit Character" subtitle={`Editing ${character.name}`} />

      <main className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-4xl">
          <Card>
            <CardHeader>
              <CardTitle>Character Details</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-6">
              {/* Basic Info */}
              <div className="grid gap-6 md:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="name">
                    Character Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    placeholder="Enter character name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    placeholder="e.g., 25, Young adult, Ancient"
                    value={formData.age}
                    onChange={(e) => handleInputChange('age', e.target.value)}
                  />
                </div>
              </div>

              {/* Personality */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="personality">
                  Personality <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="personality"
                  placeholder="Describe the character's personality, traits, and behavior..."
                  value={formData.personality}
                  onChange={(e) => handleInputChange('personality', e.target.value)}
                  className="min-h-[100px]"
                />
              </div>

              {/* Appearance */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="appearance">
                  Appearance <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="appearance"
                  placeholder="Describe the character's physical appearance, clothing, and visual style..."
                  value={formData.appearance}
                  onChange={(e) => handleInputChange('appearance', e.target.value)}
                  className="min-h-[100px]"
                />
              </div>

              {/* Setting */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="setting">Setting/Background</Label>
                <Textarea
                  id="setting"
                  placeholder="Describe the world, environment, or context where this character exists..."
                  value={formData.setting}
                  onChange={(e) => handleInputChange('setting', e.target.value)}
                  className="min-h-[80px]"
                />
              </div>

              {/* Special Traits */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="specialTraits">Special Traits</Label>
                <Textarea
                  id="specialTraits"
                  placeholder="Any unique abilities, quirks, or distinctive characteristics..."
                  value={formData.specialTraits}
                  onChange={(e) => handleInputChange('specialTraits', e.target.value)}
                  className="min-h-[80px]"
                />
              </div>

              {/* Description */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="description">Additional Description</Label>
                <Textarea
                  id="description"
                  placeholder="Any additional details about the character..."
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="min-h-[80px]"
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-4 border-t pt-6">
                <Button
                  variant="outline"
                  onClick={() =>
                    navigate(generatePath(ROUTES.characterDetail, { characterId: characterId! }))
                  }
                  disabled={isSaving}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={!isFormValid || isSaving}
                  isLoading={isSaving}
                  loadingText="Saving..."
                >
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  )
}

function NotFoundState() {
  const navigate = useNavigate()

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-4xl">
        <Card>
          <CardContent className="py-12 text-center">
            <h2 className="mb-4 text-2xl font-bold">Character Not Found</h2>
            <p className="text-muted-foreground mb-6">
              The character you&apos;re trying to edit doesn&apos;t exist or you don&apos;t have
              access to it.
            </p>
            <Button onClick={() => navigate('/characters')}>Back to Characters</Button>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}

function LoadingState() {
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-4xl">
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="text-primary h-8 w-8 animate-spin" />
              <p className="text-muted-foreground text-sm">Loading character details...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
