import { useState } from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import { Button } from '@/components/ui/button'
import { ChevronsUpDown, Check, Plus, Globe, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface PageOption {
  id: string
  title: string
  slug: string
  is_published?: boolean
}

interface PageListboxProps {
  pages: PageOption[]
  selectedPageId: string | null
  onSelectPage: (pageId: string) => void
  onNewPage: () => void
  isLoading?: boolean
}

export function PageListbox({
  pages,
  selectedPageId,
  onSelectPage,
  onNewPage,
  isLoading,
}: PageListboxProps) {
  const [open, setOpen] = useState(false)

  const selectedPage = pages.find((p) => p.id === selectedPageId)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full sm:w-[320px] md:w-[380px] justify-between h-10 bg-card border-border shadow-sm text-left font-normal"
          disabled={isLoading}
        >
          <div className="flex items-center gap-2 truncate flex-1 min-w-0">
            <FileText className="w-4 h-4 text-primary shrink-0" />
            {selectedPage ? (
              <div className="flex items-center gap-2 truncate">
                <span className="font-semibold text-sm truncate">{selectedPage.title}</span>
                <span className="text-xs text-muted-foreground font-mono truncate">
                  /{selectedPage.slug}
                </span>
              </div>
            ) : selectedPageId === 'new' ? (
              <span className="font-medium text-sm text-primary">+ Nova Página (em criação)</span>
            ) : (
              <span className="text-muted-foreground text-sm">Selecione uma página...</span>
            )}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[320px] sm:w-[380px] p-0 shadow-lg" align="start">
        <Command>
          <CommandInput placeholder="Buscar por título ou slug..." className="h-9" />
          <CommandList className="max-h-[300px] overflow-y-auto">
            <CommandEmpty className="py-4 text-center text-xs text-muted-foreground">
              Nenhuma página encontrada.
            </CommandEmpty>

            <CommandGroup heading="Ações Rápidas">
              <CommandItem
                onSelect={() => {
                  setOpen(false)
                  onNewPage()
                }}
                className="cursor-pointer font-medium text-primary flex items-center gap-2"
              >
                <div className="w-5 h-5 rounded bg-primary/10 flex items-center justify-center text-primary">
                  <Plus className="w-3.5 h-3.5" />
                </div>
                <span>Nova Página</span>
              </CommandItem>
            </CommandGroup>

            <CommandSeparator />

            <CommandGroup heading={`Páginas Existentes (${pages.length})`}>
              {pages.map((page) => {
                const isSelected = page.id === selectedPageId
                return (
                  <CommandItem
                    key={page.id}
                    value={`${page.title} ${page.slug}`}
                    onSelect={() => {
                      setOpen(false)
                      onSelectPage(page.id)
                    }}
                    className="cursor-pointer flex items-center justify-between py-2"
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <div
                        className={cn(
                          'w-2 h-2 rounded-full shrink-0',
                          page.is_published ? 'bg-emerald-500' : 'bg-muted-foreground/40',
                        )}
                        title={page.is_published ? 'Publicada' : 'Rascunho'}
                      />
                      <div className="flex flex-col min-w-0 flex-1">
                        <span
                          className={cn(
                            'text-sm truncate',
                            isSelected ? 'font-bold text-primary' : 'font-medium',
                          )}
                        >
                          {page.title}
                        </span>
                        <span className="text-[11px] text-muted-foreground font-mono truncate">
                          /{page.slug}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0 ml-2">
                      {page.is_published ? (
                        <span className="text-[10px] bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 font-medium px-1.5 py-0.5 rounded">
                          Publicada
                        </span>
                      ) : (
                        <span className="text-[10px] bg-muted text-muted-foreground font-medium px-1.5 py-0.5 rounded">
                          Rascunho
                        </span>
                      )}
                      {isSelected && <Check className="h-4 w-4 text-primary ml-1 shrink-0" />}
                    </div>
                  </CommandItem>
                )
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
