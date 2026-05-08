import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Trash2,
  GripVertical,
  Image as ImageIcon,
  Type,
  Video,
  LayoutGrid,
  Megaphone,
  UploadCloud,
  ArrowUp,
  ArrowDown,
} from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'

export function BlockEditor({ block, onChange, onRemove }: any) {
  const { toast } = useToast()
  const updateData = (data: any) => onChange({ ...block, data: { ...block.data, ...data } })

  const icons: any = {
    text: <Type className="w-4 h-4" />,
    image: <ImageIcon className="w-4 h-4" />,
    video: <Video className="w-4 h-4" />,
    gallery: <LayoutGrid className="w-4 h-4" />,
    cta: <Megaphone className="w-4 h-4" />,
    hero: <LayoutGrid className="w-4 h-4" />,
    text_image: <LayoutGrid className="w-4 h-4" />,
    features: <LayoutGrid className="w-4 h-4" />,
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '')}`
      const { error } = await supabase.storage.from('pages').upload(filename, file)
      if (error) throw error
      const {
        data: { publicUrl },
      } = supabase.storage.from('pages').getPublicUrl(filename)
      updateData({ url: publicUrl })
      toast({ title: 'Upload concluído com sucesso!' })
    } catch (err: any) {
      toast({ title: 'Erro no upload', description: err.message, variant: 'destructive' })
    }
  }

  return (
    <Card className="mb-6 shadow-sm border-muted transition-shadow hover:shadow-md">
      <CardHeader className="flex flex-row items-center justify-between py-3 bg-muted/20 border-b border-muted">
        <CardTitle className="text-sm font-semibold uppercase text-foreground flex items-center gap-2">
          <GripVertical className="w-4 h-4 cursor-move text-muted-foreground/50 hover:text-foreground transition-colors" />
          {icons[block.type] || <LayoutGrid className="w-4 h-4" />}
          {block.type} Block
        </CardTitle>
        <Button
          variant="ghost"
          size="icon"
          onClick={onRemove}
          className="text-destructive h-8 w-8 hover:bg-destructive/10"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </CardHeader>
      <CardContent className="pt-6">
        {block.type === 'hero' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Título da Página (Hero)</Label>
              <Input
                value={block.data.title || ''}
                onChange={(e) => updateData({ title: e.target.value })}
                placeholder="Ex: Sobre Nós"
              />
            </div>
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Textarea
                value={block.data.description || ''}
                onChange={(e) => updateData({ description: e.target.value })}
                placeholder="Texto de apoio..."
              />
            </div>
            <div className="space-y-2">
              <Label>Ícone</Label>
              <Select
                value={block.data.icon || 'Users'}
                onValueChange={(v) => updateData({ icon: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Users">Usuários (Users)</SelectItem>
                  <SelectItem value="Target">Alvo (Target)</SelectItem>
                  <SelectItem value="Shield">Escudo (Shield)</SelectItem>
                  <SelectItem value="Trophy">Troféu (Trophy)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {block.type === 'text_image' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Título</Label>
              <Input
                value={block.data.title || ''}
                onChange={(e) => updateData({ title: e.target.value })}
                placeholder="Ex: Nossa História"
              />
            </div>
            <div className="space-y-2">
              <Label>Conteúdo (Rich Text / HTML Suportado)</Label>
              <Textarea
                value={block.data.content || ''}
                onChange={(e) => updateData({ content: e.target.value })}
                className="min-h-[150px] font-mono text-sm"
                placeholder="<p>Escreva seu conteúdo aqui...</p>"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>URL da Imagem</Label>
                <Input
                  value={block.data.imageUrl || ''}
                  onChange={(e) => updateData({ imageUrl: e.target.value })}
                  placeholder="https://..."
                />
                {block.data.imageUrl && (
                  <div className="mt-2 border rounded-xl overflow-hidden bg-black/5 w-full h-32">
                    <img
                      src={block.data.imageUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label>Posição da Imagem</Label>
                <Select
                  value={block.data.imagePosition || 'right'}
                  onValueChange={(v) => updateData({ imagePosition: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="left">Esquerda do texto</SelectItem>
                    <SelectItem value="right">Direita do texto</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}

        {block.type === 'features' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label>Cards de Funcionalidades/Valores</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const newItems = [
                    ...(block.data.items || []),
                    { title: '', description: '', icon: 'Target' },
                  ]
                  updateData({ items: newItems })
                }}
              >
                + Adicionar Card
              </Button>
            </div>
            <div className="space-y-3">
              {(block.data.items || []).map((item: any, idx: number) => (
                <div key={idx} className="p-4 border rounded-xl relative space-y-4 bg-muted/20">
                  <div className="absolute top-2 right-2 flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      disabled={idx === 0}
                      onClick={() => {
                        const newItems = [...block.data.items]
                        ;[newItems[idx - 1], newItems[idx]] = [newItems[idx], newItems[idx - 1]]
                        updateData({ items: newItems })
                      }}
                    >
                      <ArrowUp className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      disabled={idx === block.data.items.length - 1}
                      onClick={() => {
                        const newItems = [...block.data.items]
                        ;[newItems[idx + 1], newItems[idx]] = [newItems[idx], newItems[idx + 1]]
                        updateData({ items: newItems })
                      }}
                    >
                      <ArrowDown className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive"
                      onClick={() => {
                        const newItems = [...block.data.items]
                        newItems.splice(idx, 1)
                        updateData({ items: newItems })
                      }}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                    <div className="space-y-2">
                      <Label className="text-xs">Título do Card</Label>
                      <Input
                        placeholder="Ex: Missão"
                        value={item.title || ''}
                        onChange={(e) => {
                          const newItems = [...block.data.items]
                          newItems[idx].title = e.target.value
                          updateData({ items: newItems })
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Ícone</Label>
                      <Select
                        value={item.icon || 'Target'}
                        onValueChange={(v) => {
                          const newItems = [...block.data.items]
                          newItems[idx].icon = v
                          updateData({ items: newItems })
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Target">Alvo (Missão)</SelectItem>
                          <SelectItem value="Shield">Escudo (Visão)</SelectItem>
                          <SelectItem value="Trophy">Troféu (Valores)</SelectItem>
                          <SelectItem value="Users">Pessoas (Equipe)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Descrição Curta</Label>
                    <Textarea
                      placeholder="Descreva aqui..."
                      value={item.description || ''}
                      onChange={(e) => {
                        const newItems = [...block.data.items]
                        newItems[idx].description = e.target.value
                        updateData({ items: newItems })
                      }}
                      className="h-20"
                    />
                  </div>
                </div>
              ))}
              {(!block.data.items || block.data.items.length === 0) && (
                <div className="text-center py-6 border border-dashed rounded-xl text-muted-foreground text-sm">
                  Nenhum card adicionado. Clique no botão acima para começar.
                </div>
              )}
            </div>
          </div>
        )}

        {block.type === 'text' && (
          <div className="space-y-2">
            <Label>Conteúdo (Rich Text / HTML Suportado)</Label>
            <Textarea
              value={block.data.content || ''}
              onChange={(e) => updateData({ content: e.target.value })}
              className="min-h-[180px] font-mono text-sm leading-relaxed"
              placeholder="<p>Escreva seu conteúdo aqui. Tags HTML como <strong>, <em>, <a> são suportadas...</p>"
            />
          </div>
        )}

        {block.type === 'image' && (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Imagem da Mídia (Upload ou URL Externa)</Label>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="w-[250px] pr-10"
                  />
                  <UploadCloud className="w-4 h-4 absolute right-3 top-3 text-muted-foreground pointer-events-none" />
                </div>
                <Input
                  value={block.data.url || ''}
                  onChange={(e) => updateData({ url: e.target.value })}
                  placeholder="Ou cole a URL direta aqui..."
                  className="flex-1"
                />
              </div>
              {block.data.url && (
                <div className="mt-4 border rounded-xl overflow-hidden bg-black/5 w-fit">
                  <img src={block.data.url} alt="Preview" className="h-32 object-contain" />
                </div>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Texto Alternativo (Alt) - Para Acessibilidade</Label>
                <Input
                  value={block.data.alt || ''}
                  onChange={(e) => updateData({ alt: e.target.value })}
                  placeholder="Descrição curta da imagem"
                />
              </div>
              <div className="space-y-2">
                <Label>Legenda (Opcional)</Label>
                <Input
                  value={block.data.caption || ''}
                  onChange={(e) => updateData({ caption: e.target.value })}
                  placeholder="Ex: Foto por João Silva"
                />
              </div>
            </div>
          </div>
        )}

        {block.type === 'video' && (
          <div className="space-y-2">
            <Label>Link de Incorporação do Vídeo (Embed URL)</Label>
            <Input
              value={block.data.url || ''}
              onChange={(e) => updateData({ url: e.target.value })}
              placeholder="Ex: https://www.youtube.com/embed/dQw4w9WgXcQ"
            />
            <p className="text-xs text-muted-foreground">
              Importante: Utilize a URL de "incorporação" (embed) disponibilizada pela plataforma.
            </p>
          </div>
        )}

        {block.type === 'gallery' && (
          <div className="space-y-4">
            <Label>Imagens da Galeria (Uma URL por linha)</Label>
            <Textarea
              value={block.data.images?.map((i: any) => i.url).join('\n') || ''}
              onChange={(e) => {
                const urls = e.target.value.split('\n').filter((u) => u.trim() !== '')
                updateData({ images: urls.map((url) => ({ url, alt: 'Imagem da galeria' })) })
              }}
              className="min-h-[140px] font-mono text-sm leading-relaxed"
              placeholder="https://img.usecurling.com/p/400/400?q=sports&#10;https://img.usecurling.com/p/400/400?q=nature"
            />
          </div>
        )}

        {block.type === 'cta' && (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Texto de Destaque (Heading)</Label>
              <Input
                value={block.data.text || ''}
                onChange={(e) => updateData({ text: e.target.value })}
                placeholder="Ex: Prepare-se para o próximo torneio!"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Link do Botão</Label>
                <Input
                  value={block.data.link || ''}
                  onChange={(e) => updateData({ link: e.target.value })}
                  placeholder="/tournaments"
                />
              </div>
              <div className="space-y-2">
                <Label>Rótulo do Botão</Label>
                <Input
                  value={block.data.buttonText || ''}
                  onChange={(e) => updateData({ buttonText: e.target.value })}
                  placeholder="Inscreva-se Agora"
                />
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
