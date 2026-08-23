import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Search, Plus } from 'lucide-react'
import { BUILDER_ELEMENTS, type BuilderElementItem } from './builder-elements-data'
import { toast } from '@/hooks/use-toast'
import usePageBuilderStore from '@/stores/use-page-builder-store'

interface ElementPickerModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ElementPickerModal({ open, onOpenChange }: ElementPickerModalProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const { setState } = usePageBuilderStore()

  const filteredElements = BUILDER_ELEMENTS.filter(
    (el) =>
      el.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      el.description.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleSelectElement = (el: BuilderElementItem) => {
    const newBlock = {
      id: Math.random().toString(36).substring(2, 9),
      type: el.type,
      name: el.label,
      order: 0,
      data: el.defaultData || {},
      isHidden: false,
    }

    setState((prev) => {
      const updatedBlocks = [...prev.blocks, { ...newBlock, order: prev.blocks.length }]
      return {
        blocks: updatedBlocks,
        selectedBlockId: newBlock.id,
        activeTab: 'block_properties',
      }
    })

    toast({
      title: 'Elemento adicionado!',
      description: `"${el.label}" foi inserido no final da página.`,
    })

    onOpenChange(false)
    setSearchTerm('')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col p-0 gap-0 overflow-hidden">
        <DialogHeader className="p-6 pb-4 border-b bg-muted/20">
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Plus className="w-5 h-5 text-primary" />
            Adicionar Novo Elemento
          </DialogTitle>
          <DialogDescription>
            Escolha um dos 20 blocos visuais disponíveis para compor sua página institucional.
          </DialogDescription>
          <div className="relative mt-3">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar elementos (ex: Hero, Galeria, Depoimentos, Mapa)..."
              className="pl-9 bg-background"
              autoFocus
            />
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6">
          {filteredElements.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              Nenhum elemento encontrado para a busca "{searchTerm}".
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredElements.map((el) => {
                const Icon = el.icon
                return (
                  <button
                    key={el.type}
                    type="button"
                    onClick={() => handleSelectElement(el)}
                    className="flex flex-col items-start p-4 rounded-xl border bg-card hover:border-primary hover:shadow-md hover:bg-primary/5 transition-all text-left group cursor-pointer"
                  >
                    <div className="flex items-center gap-3 mb-2 w-full">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors shrink-0">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
                        {el.label}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {el.description}
                    </p>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
