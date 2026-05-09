import usePageBuilderStore from '@/stores/use-page-builder-store'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Settings, AlertCircle } from 'lucide-react'
import { useState, useEffect } from 'react'
import { Alert, AlertDescription } from '@/components/ui/alert'

export function BuilderProperties() {
  const { state, setState } = usePageBuilderStore()

  const selectedBlock = state.blocks.find((b) => b.id === state.selectedBlockId)
  const [jsonError, setJsonError] = useState<string | null>(null)
  const [jsonText, setJsonText] = useState('')

  useEffect(() => {
    if (selectedBlock) {
      setJsonText(JSON.stringify(selectedBlock.data, null, 2))
      setJsonError(null)
    }
  }, [selectedBlock?.id])

  const updateBlock = (updates: Partial<typeof selectedBlock>) => {
    if (!selectedBlock) return
    setState((prev) => ({
      blocks: prev.blocks.map((b) => (b.id === selectedBlock.id ? { ...b, ...updates } : b)),
    }))
  }

  const handleJsonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value
    setJsonText(val)
    try {
      const parsed = JSON.parse(val)
      setJsonError(null)
      // Only update block data if it's a valid object
      if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
        updateBlock({ data: parsed })
      }
    } catch (err: any) {
      setJsonError('Formato JSON inválido')
    }
  }

  return (
    <div className="w-full md:w-[300px] bg-muted/20 border-l flex flex-col h-full">
      <div className="p-4 border-b bg-muted/40 font-semibold text-sm uppercase tracking-wider flex items-center gap-2">
        <Settings className="w-4 h-4" />
        Propriedades
      </div>
      <ScrollArea className="flex-1 p-4">
        {!selectedBlock ? (
          <div className="text-center text-muted-foreground text-sm pt-12">
            Selecione uma dobra no canvas para editar suas propriedades.
          </div>
        ) : (
          <div className="space-y-6 animate-fade-in">
            <div className="space-y-2">
              <Label>Nome de Identificação</Label>
              <Input
                value={selectedBlock.name}
                onChange={(e) => updateBlock({ name: e.target.value })}
                placeholder="Ex: Hero Principal"
              />
            </div>

            <div className="space-y-2">
              <Label>Ordem</Label>
              <Input
                type="number"
                value={selectedBlock.order}
                readOnly
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                Reordene usando as setas ou arrastando no canvas.
              </p>
            </div>

            <div className="space-y-2">
              <Label>Conteúdo (JSON)</Label>
              <Textarea
                value={jsonText}
                onChange={handleJsonChange}
                className="font-mono text-xs min-h-[300px] resize-y"
                placeholder="{}"
              />
              {jsonError && (
                <Alert variant="destructive" className="mt-2 py-2 px-3">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-xs">{jsonError}</AlertDescription>
                </Alert>
              )}
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                Edite as propriedades deste bloco em formato JSON. Os campos variam conforme o tipo
                do elemento.
              </p>
            </div>
          </div>
        )}
      </ScrollArea>
    </div>
  )
}
