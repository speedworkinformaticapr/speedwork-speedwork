import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Image as ImageIcon, Search, Video } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export function MediaPicker({
  onSelect,
  trigger,
}: {
  onSelect: (url: string) => void
  trigger?: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  const [media, setMedia] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('all')

  useEffect(() => {
    if (open) {
      fetchMedia()
    }
  }, [open])

  const fetchMedia = async () => {
    const { data } = await supabase
      .from('media_items')
      .select('*')
      .order('created_at', { ascending: false })
    if (data) setMedia(data)
  }

  const filtered = media.filter((m) => {
    const matchesSearch =
      m.name?.toLowerCase().includes(search.toLowerCase()) ||
      m.file_name?.toLowerCase().includes(search.toLowerCase())

    if (!matchesSearch) return false

    if (filterType === 'image') return m.type.startsWith('image')
    if (filterType === 'video') return m.type.startsWith('video')
    return true
  })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <ImageIcon className="w-4 h-4 mr-2" /> Buscar na Galeria
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Galeria de Mídias</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col md:flex-row items-center gap-4 py-4 border-b">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar mídias..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Tabs value={filterType} onValueChange={setFilterType} className="w-full md:w-auto">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">Todas</TabsTrigger>
              <TabsTrigger value="image">Imagens</TabsTrigger>
              <TabsTrigger value="video">Vídeos</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <ScrollArea className="flex-1 -mx-6 px-6">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <ImageIcon className="w-12 h-12 mb-4 opacity-20" />
              <p>Nenhuma mídia encontrada.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 py-4">
              {filtered.map((item) => {
                const isVideo = item.type.startsWith('video')
                return (
                  <div
                    key={item.id}
                    className="group relative aspect-square bg-muted rounded-xl overflow-hidden cursor-pointer border-2 border-transparent hover:border-primary transition-all duration-200"
                    onClick={() => {
                      onSelect(item.url)
                      setOpen(false)
                    }}
                  >
                    {isVideo ? (
                      <>
                        <video src={item.url} className="w-full h-full object-cover" />
                        <div className="absolute top-2 right-2 bg-black/60 p-1.5 rounded-md backdrop-blur-md">
                          <Video className="w-3 h-3 text-white" />
                        </div>
                      </>
                    ) : (
                      <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <div className="absolute bottom-0 left-0 right-0 p-3 text-xs text-white truncate font-medium">
                        {item.name || item.file_name}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
