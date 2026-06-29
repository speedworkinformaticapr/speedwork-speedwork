import { Loader2, Trash2, ImagePlus, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { MediaPicker } from '@/components/MediaPicker'
import { blogService, StepImage } from '@/services/blog'
import { useState } from 'react'

interface StepImageRepeaterProps {
  images: StepImage[]
  onChange: (images: StepImage[]) => void
  postTitle: string
}

export function StepImageRepeater({ images, onChange, postTitle }: StepImageRepeaterProps) {
  const [generatingIdx, setGeneratingIdx] = useState<number | null>(null)

  const add = () => onChange([...images, { url: '', description: '' }])
  const remove = (i: number) => onChange(images.filter((_, idx) => idx !== i))
  const update = (i: number, field: keyof StepImage, value: string) =>
    onChange(images.map((img, idx) => (idx === i ? { ...img, [field]: value } : img)))

  const handleAiGenerate = async (i: number) => {
    setGeneratingIdx(i)
    try {
      const url = await blogService.generateImage(
        `Imagem ilustrativa para o post: ${postTitle}. Descrição: ${images[i].description || 'geral'}`,
        '1:1',
      )
      update(i, 'url', url)
    } catch {
      console.error('Failed to generate image')
    } finally {
      setGeneratingIdx(null)
    }
  }

  return (
    <div className="space-y-4">
      {images.map((img, i) => (
        <div key={i} className="flex gap-4 items-start p-4 rounded-lg border bg-muted/30">
          <div className="w-28 h-28 rounded-lg overflow-hidden bg-muted flex-shrink-0 flex items-center justify-center">
            {img.url ? (
              <img src={img.url} alt={img.description} className="w-full h-full object-cover" />
            ) : (
              <ImagePlus className="w-8 h-8 text-muted-foreground" />
            )}
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex gap-2">
              <MediaPicker
                onSelect={(url) => update(i, 'url', url)}
                trigger={
                  <Button type="button" variant="outline" size="sm">
                    <ImagePlus className="w-3 h-3 mr-1" /> Galeria
                  </Button>
                }
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleAiGenerate(i)}
                disabled={generatingIdx === i}
              >
                {generatingIdx === i ? (
                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                ) : (
                  <Sparkles className="w-3 h-3 mr-1" />
                )}
                IA
              </Button>
            </div>
            <Input
              placeholder="URL da imagem"
              value={img.url}
              onChange={(e) => update(i, 'url', e.target.value)}
              className="h-8 text-sm"
            />
            <Textarea
              placeholder="Descrição da imagem (alt text)..."
              value={img.description}
              onChange={(e) => update(i, 'description', e.target.value)}
              rows={2}
              className="text-sm"
            />
          </div>
          <Button type="button" variant="ghost" size="icon" onClick={() => remove(i)}>
            <Trash2 className="w-4 h-4 text-destructive" />
          </Button>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={add}>
        <ImagePlus className="w-4 h-4 mr-2" /> Adicionar Imagem
      </Button>
    </div>
  )
}
