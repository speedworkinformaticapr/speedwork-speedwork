import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Pencil, Plus, Trash2, Loader2, Image as ImageIcon, Video, Library } from 'lucide-react'
import { toast } from 'sonner'
import { getMedia, uploadMedia, type MediaItem } from '@/services/media'

export default function AdminHeroCarousel() {
  const [slides, setSlides] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingSlide, setEditingSlide] = useState<any>(null)
  const [itemToDelete, setItemToDelete] = useState<string | null>(null)

  const [mediaItems, setMediaItems] = useState<MediaItem[]>([])
  const [isMediaSelectorOpen, setIsMediaSelectorOpen] = useState(false)
  const [loadingMedia, setLoadingMedia] = useState(false)

  const defaultForm = {
    title: '',
    subtitle: '',
    media_type: 'image',
    image_url: '',
    link_url: '',
    button_text: '',
    order_index: 0,
    is_active: true,
  }
  const [form, setForm] = useState(defaultForm)

  const fetchSlides = async () => {
    setLoading(true)
    const { data } = await supabase.from('hero_carousel').select('*').order('order_index')
    setSlides(data || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchSlides()
  }, [])

  const handleOpenModal = (slide?: any) => {
    setEditingSlide(slide)
    setForm(slide || defaultForm)
    setIsModalOpen(true)
  }

  const handleSave = async () => {
    if (!form.image_url) return toast.error('A URL da mídia é obrigatória.')
    setLoading(true)
    try {
      if (editingSlide) {
        await supabase
          .from('hero_carousel')
          .update({ ...form, updated_at: new Date().toISOString() })
          .eq('id', editingSlide.id)
        toast.success('Slide atualizado com sucesso!')
      } else {
        await supabase.from('hero_carousel').insert([form])
        toast.success('Slide criado com sucesso!')
      }
      setIsModalOpen(false)
      fetchSlides()
    } catch (error) {
      toast.error('Erro ao salvar slide.')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = (id: string) => {
    setItemToDelete(id)
  }

  const confirmDelete = async () => {
    if (!itemToDelete) return
    await supabase.from('hero_carousel').delete().eq('id', itemToDelete)
    toast.success('Slide excluído com sucesso!')
    fetchSlides()
    setItemToDelete(null)
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const mediaItem = await uploadMedia(file)
      const isVideo = file.type.startsWith('video/')
      setForm({ ...form, image_url: mediaItem.url, media_type: isVideo ? 'local_video' : 'image' })
      toast.success('Arquivo enviado com sucesso!')
    } catch (error: any) {
      toast.error(error.message || 'Erro ao enviar arquivo')
    } finally {
      setUploading(false)
    }
  }

  const handleOpenMediaSelector = async () => {
    setLoadingMedia(true)
    setIsMediaSelectorOpen(true)
    try {
      const items = await getMedia()
      setMediaItems(items)
    } catch (error) {
      toast.error('Erro ao carregar mídias')
    } finally {
      setLoadingMedia(false)
    }
  }

  const handleSelectMedia = (item: MediaItem) => {
    const isVideo = item.type.startsWith('video/')
    setForm({
      ...form,
      image_url: item.url,
      media_type: isVideo ? 'local_video' : 'image',
    })
    setIsMediaSelectorOpen(false)
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Carrossel Principal (Hero)</h1>
          <p className="text-muted-foreground">
            Gerencie as imagens e vídeos de destaque da página inicial.
          </p>
        </div>
        <Button onClick={() => handleOpenModal()} className="gap-2">
          <Plus className="h-4 w-4" /> Novo Slide
        </Button>
      </div>

      <div className="border rounded-lg bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ordem</TableHead>
              <TableHead>Mídia</TableHead>
              <TableHead>Título</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {slides.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-6">
                  Nenhum slide encontrado.
                </TableCell>
              </TableRow>
            ) : (
              slides.map((slide) => (
                <TableRow key={slide.id}>
                  <TableCell>{slide.order_index}</TableCell>
                  <TableCell>
                    {slide.media_type === 'image' ? (
                      <img
                        src={slide.image_url}
                        alt="Preview"
                        className="w-20 h-12 object-cover rounded shadow-sm"
                      />
                    ) : slide.media_type === 'local_video' ? (
                      <video
                        src={slide.image_url}
                        className="w-20 h-12 object-cover rounded shadow-sm"
                        muted
                      />
                    ) : (
                      <div className="w-20 h-12 bg-muted rounded flex items-center justify-center shadow-sm">
                        <Video className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{slide.title || 'Sem título'}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${slide.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}
                    >
                      {slide.is_active ? 'Ativo' : 'Oculto'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleOpenModal(slide)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-500 hover:text-red-700"
                      onClick={() => handleDelete(slide.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingSlide ? 'Editar Slide' : 'Novo Slide'}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="col-span-2 md:col-span-1 space-y-2">
              <Label>Tipo de Mídia</Label>
              <Select
                value={form.media_type}
                onValueChange={(val) => setForm({ ...form, media_type: val })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="image">
                    <span className="flex items-center gap-2">
                      <ImageIcon className="h-4 w-4" /> Imagem
                    </span>
                  </SelectItem>
                  <SelectItem value="local_video">
                    <span className="flex items-center gap-2">
                      <Video className="h-4 w-4" /> Vídeo Local
                    </span>
                  </SelectItem>
                  <SelectItem value="youtube">
                    <span className="flex items-center gap-2">
                      <Video className="h-4 w-4" /> YouTube
                    </span>
                  </SelectItem>
                  <SelectItem value="vimeo">
                    <span className="flex items-center gap-2">
                      <Video className="h-4 w-4" /> Vimeo
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2 md:col-span-1 space-y-2">
              <Label>Ordem de Exibição</Label>
              <Input
                type="number"
                value={form.order_index}
                onChange={(e) => setForm({ ...form, order_index: Number(e.target.value) })}
              />
            </div>

            {form.media_type === 'image' || form.media_type === 'local_video' ? (
              <div className="col-span-2 space-y-2 border-2 border-dashed p-4 rounded-lg text-center">
                <div className="flex flex-col md:flex-row gap-2 justify-center mb-4">
                  <Button type="button" variant="outline" onClick={handleOpenMediaSelector}>
                    <Library className="h-4 w-4 mr-2" />
                    Selecionar da Biblioteca
                  </Button>
                  <Label className="cursor-pointer">
                    <div className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 w-full md:w-auto">
                      {uploading ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Plus className="h-4 w-4 mr-2" />
                      )}
                      Fazer Upload
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept={form.media_type === 'image' ? 'image/*' : 'video/*'}
                      onChange={handleFileUpload}
                      disabled={uploading}
                    />
                  </Label>
                </div>
                <Input
                  placeholder="Ou cole a URL..."
                  value={form.image_url}
                  onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                />
                {form.image_url &&
                  (form.media_type === 'image' ? (
                    <img
                      src={form.image_url}
                      alt="Preview"
                      className="h-32 object-cover mx-auto mt-2 rounded"
                    />
                  ) : (
                    <video
                      src={form.image_url}
                      className="h-32 object-cover mx-auto mt-2 rounded"
                      controls
                    />
                  ))}
              </div>
            ) : (
              <div className="col-span-2 space-y-2">
                <Label>URL do Vídeo ({form.media_type === 'youtube' ? 'YouTube' : 'Vimeo'})</Label>
                <Input
                  placeholder="https://..."
                  value={form.image_url}
                  onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                />
              </div>
            )}

            <div className="col-span-2 space-y-2">
              <Label>Título</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>
            <div className="col-span-2 space-y-2">
              <Label>Subtítulo</Label>
              <Input
                value={form.subtitle || ''}
                onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
              />
            </div>
            <div className="col-span-2 md:col-span-1 space-y-2">
              <Label>Texto do Botão</Label>
              <Input
                placeholder="Ex: Saiba Mais"
                value={form.button_text}
                onChange={(e) => setForm({ ...form, button_text: e.target.value })}
              />
            </div>
            <div className="col-span-2 md:col-span-1 space-y-2">
              <Label>URL do Link</Label>
              <Input
                placeholder="/tournaments"
                value={form.link_url}
                onChange={(e) => setForm({ ...form, link_url: e.target.value })}
              />
            </div>
            <div className="col-span-2 flex items-center justify-between border p-3 rounded-lg mt-2">
              <div className="space-y-0.5">
                <Label className="text-base">Publicado</Label>
                <p className="text-sm text-muted-foreground">Exibir slide na página inicial</p>
              </div>
              <Switch
                checked={form.is_active}
                onCheckedChange={(val) => setForm({ ...form, is_active: val })}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={loading || uploading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar Slide
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isMediaSelectorOpen} onOpenChange={setIsMediaSelectorOpen}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Selecionar Mídia da Biblioteca</DialogTitle>
          </DialogHeader>
          {loadingMedia ? (
            <div className="flex justify-center p-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4">
              {mediaItems.map((item) => (
                <div
                  key={item.id}
                  className="group relative border rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary transition-all aspect-video bg-muted flex items-center justify-center"
                  onClick={() => handleSelectMedia(item)}
                >
                  {item.type.startsWith('video/') ? (
                    <>
                      <video src={item.url} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors flex items-center justify-center">
                        <Video className="h-8 w-8 text-white drop-shadow-md" />
                      </div>
                    </>
                  ) : (
                    <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
                  )}
                  <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-2 transform translate-y-full group-hover:translate-y-0 transition-transform">
                    <p className="text-xs text-white truncate" title={item.name}>
                      {item.name}
                    </p>
                  </div>
                </div>
              ))}
              {mediaItems.length === 0 && (
                <div className="col-span-full text-center p-12 text-muted-foreground border-2 border-dashed rounded-lg">
                  Nenhuma mídia encontrada na biblioteca.
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!itemToDelete} onOpenChange={(open) => !open && setItemToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza que deseja excluir?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O slide será removido do carrossel.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
