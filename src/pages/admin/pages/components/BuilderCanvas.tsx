import { useState } from 'react'
import usePageBuilderStore from '@/stores/use-page-builder-store'
import { cn } from '@/lib/utils'
import { Trash2, GripVertical, Plus, ChevronUp, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from '@/hooks/use-toast'
import { BlockRenderer } from '@/components/blocks/BlockRenderer'

export function BuilderCanvas() {
  const { state, setState } = usePageBuilderStore()
  const [isDragOver, setIsDragOver] = useState(false)

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const dataStr = e.dataTransfer.getData('application/json')
    if (!dataStr) return

    try {
      const data = JSON.parse(dataStr)
      if (data.action === 'add') {
        const newBlock = {
          id: Math.random().toString(36).substring(2, 9),
          type: data.type,
          name: data.name,
          order: state.blocks.length,
          data: data.defaultData || {},
        }
        setState((prev) => ({
          blocks: [...prev.blocks, newBlock],
          selectedBlockId: newBlock.id,
        }))
        toast({ title: 'Dobra adicionada', description: `${data.name} adicionado com sucesso.` })
      } else if (data.action === 'reorder') {
        const dropTargetId = (e.target as HTMLElement)
          .closest('[data-block-id]')
          ?.getAttribute('data-block-id')
        if (dropTargetId && dropTargetId !== data.id) {
          const blocks = [...state.blocks]
          const fromIndex = blocks.findIndex((b) => b.id === data.id)
          const toIndex = blocks.findIndex((b) => b.id === dropTargetId)

          if (fromIndex !== -1 && toIndex !== -1) {
            const [moved] = blocks.splice(fromIndex, 1)
            blocks.splice(toIndex, 0, moved)
            blocks.forEach((b, i) => (b.order = i))
            setState({ blocks })
          }
        }
      }
    } catch {
      /* intentionally ignored */
    }
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

  if (state.status === 'loading') {
    return (
      <div className="flex-1 p-8 space-y-4">
        <Skeleton className="w-full h-[200px] rounded-xl" />
        <Skeleton className="w-full h-[300px] rounded-xl" />
      </div>
    )
  }

  return (
    <div
      className={cn(
        'flex-1 bg-muted/10 overflow-y-auto p-4 md:p-8 min-h-[600px] transition-colors relative',
        isDragOver && 'bg-primary/5',
      )}
      onDragOver={(e) => {
        e.preventDefault()
        setIsDragOver(true)
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={handleDrop}
    >
      <div className="max-w-4xl mx-auto space-y-4 min-h-[400px]">
        {state.blocks.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-muted-foreground/30 rounded-2xl p-12 text-center text-muted-foreground bg-card">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <Plus className="w-8 h-8 text-muted-foreground/50" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">Nenhuma dobra adicionada</h3>
            <p>Arraste um elemento do painel esquerdo para começar a montar sua página.</p>
          </div>
        ) : (
          state.blocks.map((block) => (
            <div
              key={block.id}
              data-block-id={block.id}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData(
                  'application/json',
                  JSON.stringify({ action: 'reorder', id: block.id }),
                )
                e.dataTransfer.effectAllowed = 'move'
              }}
              onClick={() => setState({ selectedBlockId: block.id })}
              className={cn(
                'group relative bg-card border rounded-xl p-6 cursor-pointer hover:border-primary/50 transition-all',
                state.selectedBlockId === block.id
                  ? 'ring-2 ring-primary border-primary shadow-md'
                  : 'shadow-sm',
              )}
            >
              <div className="absolute left-0 top-0 bottom-0 w-8 flex items-center justify-center cursor-move opacity-0 group-hover:opacity-100 transition-opacity rounded-l-xl bg-muted/50">
                <GripVertical className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="absolute right-4 top-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-full shadow-sm"
                  onClick={(e) => handleMoveUp(e, block.id)}
                  disabled={block.order === 0}
                >
                  <ChevronUp className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-full shadow-sm"
                  onClick={(e) => handleMoveDown(e, block.id)}
                  disabled={block.order === state.blocks.length - 1}
                >
                  <ChevronDown className="w-4 h-4" />
                </Button>
                <Button
                  variant="destructive"
                  size="icon"
                  className="h-8 w-8 rounded-full shadow-sm ml-2"
                  onClick={(e) => handleRemove(e, block.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              <div className="pl-6 w-full">
                <div className="flex items-center gap-2 mb-4">
                  <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-1 rounded uppercase tracking-wider">
                    {block.type}
                  </span>
                  <span className="font-semibold text-foreground">{block.name}</span>
                </div>
                <div className="relative pointer-events-none rounded-lg overflow-hidden bg-background border shadow-inner max-h-[350px] w-full">
                  <div className="w-full">
                    <BlockRenderer block={{ type: block.type, data: block.data || {} }} />
                  </div>
                  <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-card to-transparent pointer-events-none" />
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
