import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Button } from '@/components/ui/button'

export function GlobalSearch() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<{ clubs: any[]; athletes: any[]; events: any[] }>({
    clubs: [],
    athletes: [],
    events: [],
  })
  const navigate = useNavigate()

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  useEffect(() => {
    const searchData = async () => {
      if (query.length < 2) {
        setResults({ clubs: [], athletes: [], events: [] })
        return
      }

      const [{ data: clubs }, { data: athletes }, { data: events }] = await Promise.all([
        supabase.from('clubs').select('id, name').ilike('name', `%${query}%`).limit(5),
        supabase.from('athletes').select('id, name').ilike('name', `%${query}%`).limit(5),
        supabase.from('events').select('id, name').ilike('name', `%${query}%`).limit(5),
      ])

      setResults({
        clubs: clubs || [],
        athletes: athletes || [],
        events: events || [],
      })
    }

    const debounce = setTimeout(searchData, 300)
    return () => clearTimeout(debounce)
  }, [query])

  const handleSelect = (path: string) => {
    setOpen(false)
    setQuery('')
    navigate(path)
  }

  return (
    <>
      <Button
        variant="outline"
        className="relative h-9 w-full justify-start rounded-[0.5rem] bg-muted/50 text-sm font-normal text-muted-foreground shadow-none sm:pr-12 md:w-40 lg:w-64"
        onClick={() => setOpen(true)}
      >
        <Search className="mr-2 h-4 w-4" />
        <span className="hidden lg:inline-flex">Buscar...</span>
        <span className="inline-flex lg:hidden">Buscar...</span>
        <kbd className="pointer-events-none absolute right-[0.3rem] top-[0.3rem] hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>
      <CommandDialog
        open={open}
        onOpenChange={(isOpen) => {
          setOpen(isOpen)
          if (!isOpen) setQuery('')
        }}
      >
        <CommandInput
          placeholder="Buscar clubes, atletas, eventos..."
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          {query.length >= 2 &&
            results.clubs.length === 0 &&
            results.athletes.length === 0 &&
            results.events.length === 0 && (
              <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
            )}
          {query.length < 2 && (
            <CommandEmpty>Digite pelo menos 2 caracteres para buscar...</CommandEmpty>
          )}

          {results.clubs.length > 0 && (
            <CommandGroup heading="Clubes">
              {results.clubs.map((club) => (
                <CommandItem
                  key={`club-${club.id}`}
                  value={`club-${club.name}`}
                  onSelect={() => handleSelect(`/admin/clubs/${club.id}`)}
                >
                  {club.name}
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {results.athletes.length > 0 && (
            <CommandGroup heading="Atletas">
              {results.athletes.map((athlete) => (
                <CommandItem
                  key={`athlete-${athlete.id}`}
                  value={`athlete-${athlete.name}`}
                  onSelect={() => handleSelect(`/admin/athletes/${athlete.id}`)}
                >
                  {athlete.name}
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {results.events.length > 0 && (
            <CommandGroup heading="Eventos">
              {results.events.map((event) => (
                <CommandItem
                  key={`event-${event.id}`}
                  value={`event-${event.name}`}
                  onSelect={() => handleSelect(`/admin/events/${event.id}`)}
                >
                  {event.name}
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  )
}
