import { useState, useEffect } from 'react'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from '@/components/ui/command'
import { Button } from '@/components/ui/button'
import { Check, ChevronsUpDown } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

interface EntityComboboxProps {
  type: 'receivable' | 'payable'
  entityId: string
  entityName: string
  onSelect: (id: string, name: string) => void
}

export function EntityCombobox({ type, entityId, entityName, onSelect }: EntityComboboxProps) {
  const [open, setOpen] = useState(false)
  const [entities, setEntities] = useState<any[]>([])

  useEffect(() => {
    const filterField = type === 'receivable' ? 'is_client' : 'is_supplier'
    supabase
      .from('profiles')
      .select('id, name, email, cpf_cnpj')
      .eq(filterField, true)
      .order('name')
      .then(({ data }) => {
        if (data && data.length > 0) {
          setEntities(data)
          return
        }
        supabase
          .from('profiles')
          .select('id, name, email, cpf_cnpj')
          .order('name')
          .then(({ data: fallback }) => setEntities(fallback || []))
      })
  }, [type])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" className="w-full justify-between">
          {entityName || 'Buscar cliente/fornecedor...'}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command>
          <CommandInput placeholder="Buscar por nome ou CPF/CNPJ..." />
          <CommandList>
            <CommandEmpty>Nenhuma entidade encontrada.</CommandEmpty>
            <CommandGroup>
              {entities.map((e) => (
                <CommandItem
                  key={e.id}
                  value={`${e.name || ''} ${e.email || ''} ${e.cpf_cnpj || ''}`}
                  onSelect={() => {
                    onSelect(e.id, e.name || e.email || 'Entidade')
                    setOpen(false)
                  }}
                >
                  <Check
                    className={cn('mr-2 h-4 w-4', entityId === e.id ? 'opacity-100' : 'opacity-0')}
                  />
                  <div className="flex flex-col">
                    <span>{e.name || 'Sem nome'}</span>
                    {e.cpf_cnpj && (
                      <span className="text-xs text-muted-foreground">CPF/CNPJ: {e.cpf_cnpj}</span>
                    )}
                    {e.email && <span className="text-xs text-muted-foreground">{e.email}</span>}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
