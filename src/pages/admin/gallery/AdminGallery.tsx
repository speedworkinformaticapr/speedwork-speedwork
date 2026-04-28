import { useState, useEffect } from 'react'
import { getEvents } from '@/services/events'
import { uploadGalleryPhotos, createGalleryEvent } from '@/services/gallery'
import { useTranslation } from '@/hooks/use-translation'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { UploadCloud, Image as ImageIcon } from 'lucide-react'

export default function AdminGallery() {
  const { t } = useTranslation()
  const { toast } = useToast()

  const [events, setEvents] = useState<{ id: string; name: string }[]>([])
  const [selectedEvent, setSelectedEvent] = useState<string>('')

  const [newEvent, setNewEvent] = useState({ name: '', date: '', location: '', description: '' })
  const [files, setFiles] = useState<File[]>([])

  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState({ current: 0, total: 0 })

  useEffect(() => {
    getEvents().then(setEvents).catch(console.error)
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files))
    }
  }

  const handleUpload = async (activeTab: string) => {
    if (files.length === 0) return

    try {
      setUploading(true)
      setProgress({ current: 0, total: files.length })

      let targetEventId = selectedEvent

      if (activeTab === 'new') {
        if (!newEvent.name) throw new Error('Nome do evento é obrigatório')
        const created = await createGalleryEvent(newEvent)
        targetEventId = created.id
      }

      if (!targetEventId) throw new Error('Selecione um evento')

      await uploadGalleryPhotos(targetEventId, files, (current, total) => {
        setProgress({ current, total })
      })

      toast({ title: t('adminGallery.uploadSuccess'), variant: 'default' })
      setFiles([])
      setNewEvent({ name: '', date: '', location: '', description: '' })
    } catch (error: any) {
      toast({
        title: t('adminGallery.uploadError'),
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="container mx-auto py-12 px-4 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{t('adminGallery.title')}</h1>
        <p className="text-gray-600 mt-2">{t('adminGallery.desc')}</p>
      </div>

      <Tabs defaultValue="existing" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="existing">{t('adminGallery.selectEvent')}</TabsTrigger>
          <TabsTrigger value="new">{t('adminGallery.createNewEvent')}</TabsTrigger>
        </TabsList>

        <Card>
          <CardContent className="pt-6 space-y-6">
            <TabsContent value="existing" className="mt-0">
              <div className="space-y-4">
                <Label>{t('adminGallery.selectEvent')}</Label>
                <Select value={selectedEvent} onValueChange={setSelectedEvent}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {events.map((e) => (
                      <SelectItem key={e.id} value={e.id}>
                        {e.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>

            <TabsContent value="new" className="mt-0 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('adminGallery.eventName')}</Label>
                  <Input
                    value={newEvent.name}
                    onChange={(e) => setNewEvent({ ...newEvent, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('adminGallery.eventDate')}</Label>
                  <Input
                    type="date"
                    value={newEvent.date}
                    onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>{t('adminGallery.eventLocation')}</Label>
                  <Input
                    value={newEvent.location}
                    onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>{t('adminGallery.eventDesc')}</Label>
                  <Textarea
                    value={newEvent.description}
                    onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  />
                </div>
              </div>
            </TabsContent>

            <div className="pt-4 border-t">
              <Label className="mb-4 block">{t('adminGallery.selectFiles')}</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:bg-gray-50 transition-colors relative cursor-pointer">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={handleFileChange}
                  disabled={uploading}
                />
                <div className="flex flex-col items-center gap-3 text-gray-500">
                  <UploadCloud className="w-10 h-10 text-primary" />
                  <span className="font-medium">{t('adminGallery.dragDrop')}</span>
                  {files.length > 0 && (
                    <div className="mt-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full flex items-center gap-2 text-sm font-medium">
                      <ImageIcon className="w-4 h-4" />
                      {files.length} arquivos selecionados
                    </div>
                  )}
                </div>
              </div>
            </div>

            {uploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Enviando fotos...</span>
                  <span>
                    {progress.current} / {progress.total}
                  </span>
                </div>
                <Progress value={(progress.current / progress.total) * 100} className="h-2" />
              </div>
            )}

            <Button
              className="w-full bg-primary hover:bg-primary/90 text-white"
              size="lg"
              disabled={files.length === 0 || uploading}
              onClick={() =>
                handleUpload(
                  document.querySelector('[data-state="active"]')?.getAttribute('data-value') ||
                    'existing',
                )
              }
            >
              {uploading ? 'Processando...' : 'Iniciar Upload'}
            </Button>
          </CardContent>
        </Card>
      </Tabs>
    </div>
  )
}
