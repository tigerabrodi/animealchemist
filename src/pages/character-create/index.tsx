import { api } from '@convex/_generated/api'
import { useAction, useMutation } from 'convex/react'
import { Wand2 } from 'lucide-react'
import { useState } from 'react'
import { generatePath, useNavigate } from 'react-router'
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

export function CharacterCreate() {
  const navigate = useNavigate()
  const [isGenerating, setIsGenerating] = useState(false)
  const [formData, setFormData] = useState<CharacterFormData>({
    name: '',
    personality: '',
    appearance: '',
    setting: '',
    age: '',
    specialTraits: '',
    description: '',
  })

  const createCharacter = useMutation(api.characters.mutations.createCharacter)
  const generateInitialImage = useAction(api.images.actions.generateTextToImage)

  const handleInputChange = (field: keyof CharacterFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleCreateCharacter = async () => {
    // Validate required fields
    if (!formData.name.trim() || !formData.personality.trim() || !formData.appearance.trim()) {
      toast.error('Please fill in all required fields')
      return
    }

    setIsGenerating(true)

    // Create character
    const [createError, characterId] = await handlePromise(
      createCharacter({
        name: formData.name,
        personality: formData.personality,
        appearance: formData.appearance,
        setting: formData.setting || undefined,
        age: formData.age || undefined,
        specialTraits: formData.specialTraits || undefined,
        description: formData.description || undefined,
      })
    )

    if (createError) {
      setIsGenerating(false)
      toast.error(getErrorMessage({ error: createError }))
      return
    }

    if (!characterId) {
      setIsGenerating(false)
      toast.error('Failed to create character')
      return
    }

    // Generate initial image
    const initialPrompt = `${formData.name} standing in a characteristic pose`
    const [imageError] = await handlePromise(
      generateInitialImage({
        characterId,
        prompt: initialPrompt,
        aspectRatio: '1:1',
        isInitial: true,
      })
    )

    if (imageError) {
      // Still navigate to character page even if image fails
      console.error('Failed to generate initial image:', imageError)
      toast.warning('Character created but initial image generation failed')
    } else {
      toast.success(`${formData.name} has been created!`)
    }

    setIsGenerating(false)
    void navigate(generatePath(ROUTES.characterDetail, { characterId }))
  }

  const isFormValid = formData.name && formData.personality && formData.appearance

  if (isGenerating) {
    return (
      <>
        <HeaderPortal title="Creating Character" />
        <GeneratingState characterName={formData.name} />
      </>
    )
  }

  return (
    <>
      <HeaderPortal
        title="Create New Character"
        subtitle="Define your character's unique traits and appearance"
      />

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
                <Button variant="outline" onClick={() => navigate('/characters')}>
                  Cancel
                </Button>
                <Button onClick={handleCreateCharacter} disabled={!isFormValid}>
                  <Wand2 className="mr-2 h-4 w-4" />
                  Create Character
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  )
}

function GeneratingState({ characterName }: { characterName: string }) {
  return (
    <main className="container mx-auto px-4 py-8">
      <Card className="mx-auto max-w-2xl">
        <CardContent className="py-12 text-center">
          <div className="from-primary/20 to-primary/10 mx-auto mb-6 flex h-20 w-20 animate-pulse items-center justify-center rounded-full bg-gradient-to-br">
            <Wand2 className="text-primary h-10 w-10" />
          </div>

          <h2 className="mb-4 text-2xl font-bold">Bringing {characterName} to Life</h2>
          <p className="text-muted-foreground mb-6">
            Our AI is crafting the perfect image for your character based on their unique traits...
          </p>

          <div className="flex flex-col gap-3 text-left">
            <div className="flex items-center gap-3">
              <div className="bg-primary h-2 w-2 animate-pulse rounded-full" />
              <span className="text-muted-foreground text-sm">Analyzing character traits...</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-primary/70 h-2 w-2 animate-pulse rounded-full" />
              <span className="text-muted-foreground text-sm">Generating initial image...</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-primary/40 h-2 w-2 animate-pulse rounded-full" />
              <span className="text-muted-foreground text-sm">Finalizing character profile...</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
