import { useState, useEffect, useRef } from 'react'
import { getMedia, uploadMedia, deleteMedia, MediaItem } from '@/services/media'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import { useToast } from '@/hooks/use-toast'
import {
  Loader2,
  Upload,
  Trash2,
  Copy,
  Image as ImageIcon,
  Film,
  Music,
  FileText,
} from 'lucide-react'

export default function AdminMedia() {
  const [media, setMedia] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('image')
  const [uploadDialog, setUploadDialog] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [metadata, setMetadata] = useState({ title: '', description: '', tags: '' })
  const [uploading, setUploading] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<{ id: string; name: string } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  useEffect(() => {
    loadMedia(activeTab)
  }, [activeTab])

  const loadMedia = async (type: string) => {
    setLoading(true)
    try {
      const data = await getMedia(type === 'pdf' ? 'application/pdf' : type)
      setMedia(data)
    } catch (error) {
      toast({ title: 'Erro', description: 'Falha ao carregar as mídias.', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validations
    const isImage = file.type.startsWith('image')
    const isVideo = file.type.startsWith('video')
    const isAudio = file.type.startsWith('audio')
    const isPDF = file.type === 'application/pdf'

    if (!isImage && !isVideo && !isAudio && !isPDF) {
      toast({
        title: 'Formato inválido',
        description: 'Envie apenas Imagens, Vídeos, Áudios ou PDFs.',
        variant: 'destructive',
      })
      return
    }

    if (
      (isImage && file.size > 5 * 1024 * 1024) ||
      (isVideo && file.size > 50 * 1024 * 1024) ||
      (isAudio && file.size > 10 * 1024 * 1024) ||
      (isPDF && file.size > 10 * 1024 * 1024)
    ) {
      toast({
        title: 'Arquivo muito grande',
        description: 'O arquivo excede o limite de tamanho permitido.',
        variant: 'destructive',
      })
      return
    }

    setSelectedFile(file)
    setMetadata({ title: file.name.split('.')[0], description: '', tags: '' })
    setUploadDialog(true)
  }

  const handleUploadConfirm = async () => {
    if (!selectedFile) return
    setUploading(true)
    try {
      const tagsArray = metadata.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean)
      await uploadMedia(selectedFile, {
        ...metadata,
        name: metadata.title || selectedFile.name,
        file_name: selectedFile.name,
        tags: tagsArray,
      } as any)
      toast({ title: 'Sucesso', description: 'Mídia enviada com sucesso.' })
      setUploadDialog(false)
      loadMedia(activeTab)
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Falha ao enviar mídia.',
        variant: 'destructive',
      })
    } finally {
      setUploading(false)
      setSelectedFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleDelete = (id: string, name: string) => {
    setItemToDelete({ id, name })
  }

  const confirmDelete = async () => {
    if (!itemToDelete) return
    try {
      await deleteMedia(itemToDelete.id, itemToDelete.name)
      setMedia((prev) => prev.filter((item) => item.id !== itemToDelete.id))
      toast({ title: 'Sucesso', description: 'Mídia excluída.' })
    } catch (error) {
      toast({ title: 'Erro', description: 'Falha ao excluir.', variant: 'destructive' })
    } finally {
      setItemToDelete(null)
    }
  }

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url)
    toast({ title: 'Copiado', description: 'URL copiada para a área de transferência.' })
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary">Biblioteca de Mídias</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie imagens, vídeos, áudios e documentos.
          </p>
        </div>
        <div>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*,video/*,audio/*,application/pdf"
            onChange={handleFileSelect}
          />
          <Button onClick={() => fileInputRef.current?.click()}>
            <Upload className="w-4 h-4 mr-2" /> Novo Arquivo
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="image">
            <ImageIcon className="w-4 h-4 mr-2" /> Imagens
          </TabsTrigger>
          <TabsTrigger value="video">
            <Film className="w-4 h-4 mr-2" /> Vídeos
          </TabsTrigger>
          <TabsTrigger value="audio">
            <Music className="w-4 h-4 mr-2" /> Áudios
          </TabsTrigger>
          <TabsTrigger value="pdf">
            <FileText className="w-4 h-4 mr-2" /> PDFs
          </TabsTrigger>
        </TabsList>

        <div className="min-h-[400px]">
          {loading ? (
            <div className="flex justify-center p-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : media.length === 0 ? (
            <Card className="border-dashed bg-transparent">
              <CardContent className="p-12 text-center text-muted-foreground">
                Nenhuma mídia encontrada nesta categoria.
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {media.map((item) => (
                <Card key={item.id} className="overflow-hidden group relative flex flex-col">
                  <div className="aspect-square bg-muted relative flex items-center justify-center border-b">
                    {item.type.startsWith('image') ? (
                      <img
                        src={item.url}
                        className="object-cover w-full h-full"
                        alt={item.title}
                        loading="lazy"
                      />
                    ) : item.type.startsWith('video') ? (
                      <Film className="w-12 h-12 text-muted-foreground opacity-50" />
                    ) : item.type.startsWith('audio') ? (
                      <Music className="w-12 h-12 text-muted-foreground opacity-50" />
                    ) : (
                      <FileText className="w-12 h-12 text-muted-foreground opacity-50" />
                    )}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Button
                        size="icon"
                        variant="secondary"
                        onClick={() => handleCopyUrl(item.url)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="destructive"
                        onClick={() => handleDelete(item.id, item.file_name)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="p-2 bg-card text-xs">
                    <p
                      className="font-semibold truncate"
                      title={item.name || item.title || item.file_name}
                    >
                      {item.name || item.title || item.file_name}
                    </p>
                    <p className="text-muted-foreground truncate" title={item.file_name}>
                      {item.file_name}
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </Tabs>

      <Dialog open={uploadDialog} onOpenChange={setUploadDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalhes do Arquivo</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Título</Label>
              <Input
                value={metadata.title}
                onChange={(e) => setMetadata({ ...metadata, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Input
                value={metadata.description}
                onChange={(e) => setMetadata({ ...metadata, description: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Tags (separadas por vírgula)</Label>
              <Input
                value={metadata.tags}
                onChange={(e) => setMetadata({ ...metadata, tags: e.target.value })}
                placeholder="ex: torneio, 2026, banner"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUploadDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleUploadConfirm} disabled={uploading}>
              {uploading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Upload className="w-4 h-4 mr-2" />
              )}{' '}
              Salvar e Enviar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!itemToDelete} onOpenChange={(open) => !open && setItemToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza que deseja excluir?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O arquivo de mídia será excluído permanentemente do
              servidor.
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
