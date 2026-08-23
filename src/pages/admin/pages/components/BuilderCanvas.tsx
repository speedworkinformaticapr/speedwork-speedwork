import { useState } from 'react'
import usePageBuilderStore from '@/stores/use-page-builder-store'
import { cn } from '@/lib/utils'
import {
  Trash2,
  GripVertical,
  Plus,
  ChevronUp,
  ChevronDown,
  Eye,
  EyeOff,
  Edit3,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { toast } from '@/hooks/use-toast'
import { BlockRenderer } from '@/components/blocks/BlockRenderer'
import { ElementPickerModal } from './ElementPickerModal'

export function BuilderCanvas() {
  const { state, setState } = usePageBuilderStore()
  const [isDragOver, setIsDragOver] = useState(false)
  const [isPickerOpen, setIsPickerOpen] = useState(false)
  const [draggedBlockIndex, setDraggedBlockIndex] = useState<number | null>(null)
  const [dragOverBlockIndex, setDragOverBlockIndex] = useState<number | null>(null)

  const handleBlockClick = (blockId: string) => {
    setState({
      selectedBlockId: blockId,
      activeTab: 'block_properties',
    })
  }

  const handleToggleHide = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    setState((prev) => {
      const updated = prev.blocks.map((b) => {
        if (b.id === id) {
          const nextHidden = !b.isHidden
          toast({
            title: nextHidden ? 'Dobra ocultada' : 'Dobra visível',
            description: nextHidden
              ? `"${b.name || b.type}" não será exibida na página pública.`
              : `"${b.name || b.type}" voltará a ser exibida.`,
          })
          return { ...b, isHidden: nextHidden }
        }
        return b
      })
      return { blocks: updated }
    })
  }

  const handleRemove = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    setState((prev) => {
      const newBlocks = prev.blocks.filter((b) => b.id !== id)
      newBlocks.forEach((b, i) => (b.order = i))
      return {
        blocks: newBlocks,
        selectedBlockId: prev.selectedBlockId === id ? null : prev.selectedBlockId,
      }
    })
    toast({
      title: 'Elemento removido',
      description: 'O bloco foi excluído da página.',
    })
  }

  const handleMoveUp = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    const blocks = [...state.blocks]
    const index = blocks.findIndex((b) => b.id === id)
    if (index > 0) {
      const temp = blocks[index]
      blocks[index] = blocks[index - 1]
      blocks[index - 1] = temp
      blocks.forEach((b, i) => (b.order = i))
      setState({ blocks })
    }
  }

  const handleMoveDown = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    const blocks = [...state.blocks]
    const index = blocks.findIndex((b) => b.id === id)
    if (index > -1 && index < blocks.length - 1) {
      const temp = blocks[index]
      blocks[index] = blocks[index + 1]
      blocks[index + 1] = temp
      blocks.forEach((b, i) => (b.order = i))
      setState({ blocks })
    }
  }

  const handleItemDragStart = (e: React.DragEvent, index: number) => {
    setDraggedBlockIndex(index)
    e.dataTransfer.setData('text/plain', String(index))
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleItemDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (dragOverBlockIndex !== index) {
      setDragOverBlockIndex(index)
    }
  }

  const handleItemDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)

    if (draggedBlockIndex === null || draggedBlockIndex === dropIndex) {
      setDraggedBlockIndex(null)
      setDragOverBlockIndex(null)
      return
    }

    const newBlocks = [...state.blocks]
    const [moved] = newBlocks.splice(draggedBlockIndex, 1)
    newBlocks.splice(dropIndex, 0, moved)
    newBlocks.forEach((b, i) => (b.order = i))

    setState({ blocks: newBlocks })
    setDraggedBlockIndex(null)
    setDragOverBlockIndex(null)
  }

  const handleItemDragEnd = () => {
    setDraggedBlockIndex(null)
    setDragOverBlockIndex(null)
  }

  if (state.status === 'loading') {
    return (
      <div className="flex-1 p-8 space-y-4">
        <Skeleton className="w-full h-[200px] rounded-xl" />
        <Skeleton className="w-full h-[300px] rounded-xl" />
      </div>
    )
  }

  return (
    <div className="flex-1 bg-muted/10 overflow-y-auto p-4 md:p-8 flex flex-col transition-colors">
      <ElementPickerModal open={isPickerOpen} onOpenChange={setIsPickerOpen} />

      {/* Top action bar */}
      <div className="max-w-4xl w-full mx-auto mb-6 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-foreground">Canvas de Montagem</h2>
          <p className="text-xs text-muted-foreground">
            Visualize, reordene e gerencie as dobras da sua página.
          </p>
        </div>
        <Button
          onClick={() => setIsPickerOpen(true)}
          className="shadow-sm font-semibold gap-2"
          size="sm"
        >
          <Plus className="w-4 h-4" />+ Elementos
        </Button>
      </div>

      <div
        className={cn(
          'max-w-4xl w-full mx-auto space-y-4 min-h-[400px] flex-1 pb-12',
          isDragOver && 'bg-primary/5 rounded-2xl p-4',
        )}
      >
        {state.blocks.length === 0 ? (
          <div className="h-[400px] flex flex-col items-center justify-center border-2 border-dashed border-muted-foreground/30 rounded-2xl p-12 text-center text-muted-foreground bg-card">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <Plus className="w-8 h-8 text-muted-foreground/50" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">Nenhuma dobra adicionada</h3>
            <p className="max-w-md text-sm mb-6">
              Sua página está vazia. Clique no botão abaixo para escolher entre os 20 elementos
              disponíveis e começar a construir seu conteúdo visual.
            </p>
            <Button onClick={() => setIsPickerOpen(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Adicionar Primeiro Elemento
            </Button>
          </div>
        ) : (
          state.blocks.map((block, index) => {
            const isHidden = !!block.isHidden
            const isSelected = state.selectedBlockId === block.id

            return (
              <div
                key={block.id}
                data-block-id={block.id}
                draggable
                onDragStart={(e) => handleItemDragStart(e, index)}
                onDragOver={(e) => handleItemDragOver(e, index)}
                onDrop={(e) => handleItemDrop(e, index)}
                onDragEnd={handleItemDragEnd}
                onClick={() => handleBlockClick(block.id)}
                className={cn(
                  'group relative bg-card border rounded-xl p-5 cursor-pointer transition-all duration-200',
                  isSelected
                    ? 'ring-2 ring-primary border-primary shadow-lg bg-primary/[0.02]'
                    : 'shadow-sm hover:border-primary/50 hover:shadow-md',
                  isHidden && 'opacity-60 bg-muted/40 border-dashed',
                  draggedBlockIndex === index && 'opacity-30 scale-98',
                  dragOverBlockIndex === index &&
                    draggedBlockIndex !== index &&
                    'border-t-4 border-t-primary bg-primary/10',
                )}
              >
                {/* Drag handle on left */}
                <div
                  className="absolute left-0 top-0 bottom-0 w-8 flex items-center justify-center cursor-grab active:cursor-grabbing opacity-40 group-hover:opacity-100 transition-opacity rounded-l-xl hover:bg-muted"
                  title="Arraste para reordenar"
                >
                  <GripVertical className="w-4 h-4 text-muted-foreground" />
                </div>

                {/* Top Action buttons */}
                <div className="absolute right-4 top-4 flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity z-10 bg-card/80 backdrop-blur-sm rounded-lg p-1 border shadow-sm">
                  {/* Toggle Hide */}
                  <Button
                    variant={isHidden ? 'secondary' : 'ghost'}
                    size="icon"
                    className={cn(
                      'h-7 w-7 rounded-md',
                      isHidden && 'text-amber-600 dark:text-amber-400 font-semibold',
                    )}
                    onClick={(e) => handleToggleHide(e, block.id)}
                    title={isHidden ? 'Mostrar dobra na página pública' : 'Ocultar dobra'}
                  >
                    {isHidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>

                  {/* Move Up */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 rounded-md"
                    onClick={(e) => handleMoveUp(e, block.id)}
                    disabled={index === 0}
                    title="Mover para cima"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </Button>

                  {/* Move Down */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 rounded-md"
                    onClick={(e) => handleMoveDown(e, block.id)}
                    disabled={index === state.blocks.length - 1}
                    title="Mover para baixo"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </Button>

                  {/* Edit properties shortcut */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 rounded-md text-primary"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleBlockClick(block.id)
                    }}
                    title="Editar propriedades deste elemento"
                  >
                    <Edit3 className="w-4 h-4" />
                  </Button>

                  {/* Delete */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 rounded-md text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={(e) => handleRemove(e, block.id)}
                    title="Excluir dobra"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                {/* Content */}
                <div className="pl-6 pr-2 w-full">
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    <span className="bg-primary/10 text-primary text-xs font-bold px-2.5 py-1 rounded-md uppercase tracking-wider">
                      {block.type}
                    </span>
                    <span className="font-semibold text-sm text-foreground">
                      {block.name || block.type}
                    </span>
                    {isHidden && (
                      <Badge
                        variant="outline"
                        className="text-amber-600 border-amber-500/40 bg-amber-500/10 gap-1 text-[11px]"
                      >
                        <EyeOff className="w-3 h-3" />
                        Oculto
                      </Badge>
                    )}
                    {isSelected && (
                      <Badge className="bg-primary text-primary-foreground text-[11px]">
                        Em Edição
                      </Badge>
                    )}
                  </div>

                  <div className="relative rounded-lg overflow-hidden bg-background border shadow-inner max-h-[450px] overflow-y-auto w-full pointer-events-none select-none">
                    <div className="w-full">
                      <BlockRenderer block={{ type: block.type, data: block.data || {} }} />
                    </div>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
