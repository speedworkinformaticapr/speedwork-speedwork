import React, { useState, useCallback, useEffect } from 'react'
import {
  Eye,
  Save,
  Image as ImageIcon,
  ArrowUp,
  ArrowDown,
  Undo2,
  Redo2,
  Search,
  ShoppingCart,
  AlertCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from '@/components/ui/sheet'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

interface StoreState {
  bannerLink: string
  description: string
  policies: string
  sections: string[]
}

const INITIAL_STATE: StoreState = {
  bannerLink: '',
  description:
    '<h2>Bem-vindo à Loja Oficial</h2><p>Encontre os equipamentos essenciais para a prática de Footgolf com alta performance e qualidade.</p>',
  policies:
    '<h3>Política de Devolução</h3><ul><li>Trocas grátis em até 30 dias</li><li>Frete nacional via Correios/Loggi</li></ul>',
  sections: [
    'Banner Destaque',
    'Produtos Lançamentos',
    'Produtos Mais Vendidos',
    'Ofertas Especiais',
  ],
}

function useHistory<T>(initialPresent: T) {
  const [state, setState] = useState({
    past: [] as T[],
    present: initialPresent,
    future: [] as T[],
  })

  const canUndo = state.past.length !== 0
  const canRedo = state.future.length !== 0

  const undo = useCallback(() => {
    setState((c) => {
      if (c.past.length === 0) return c
      const previous = c.past[c.past.length - 1]
      const newPast = c.past.slice(0, c.past.length - 1)
      return { past: newPast, present: previous, future: [c.present, ...c.future] }
    })
  }, [])

  const redo = useCallback(() => {
    setState((c) => {
      if (c.future.length === 0) return c
      const next = c.future[0]
      const newFuture = c.future.slice(1)
      return { past: [...c.past, c.present], present: next, future: newFuture }
    })
  }, [])

  const setPresent = useCallback((newPresent: T) => {
    setState((c) => ({
      past: [...c.past, c.present],
      present: newPresent,
      future: [],
    }))
  }, [])

  return { state: state.present, setPresent, undo, redo, canUndo, canRedo }
}

const validate = (s: StoreState) => {
  const errs: Partial<Record<keyof StoreState, string>> = {}
  if (s.bannerLink && !s.bannerLink.startsWith('/'))
    errs.bannerLink = 'O link deve ser uma rota relativa (ex: /store)'
  if (!s.description || s.description.length < 20)
    errs.description = 'A descrição deve ter pelo menos 20 caracteres.'
  if (!s.policies || s.policies.length < 20)
    errs.policies = 'As políticas devem ter pelo menos 20 caracteres.'
  return errs
}

export default function AdminStoreEditor() {
  const { toast } = useToast()
  const {
    state: historyState,
    setPresent,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useHistory<StoreState>(INITIAL_STATE)
  const [localState, setLocalState] = useState<StoreState>(INITIAL_STATE)

  // Sync local state when history changes (Undo/Redo)
  useEffect(() => {
    setLocalState(historyState)
  }, [historyState])

  const errors = validate(localState)
  const hasErrors = Object.keys(errors).length > 0

  const handleChange = (field: keyof StoreState, value: any) => {
    setLocalState((prev) => ({ ...prev, [field]: value }))
  }

  const handleCommit = (field: keyof StoreState, value: any) => {
    if (historyState[field] !== value) {
      setPresent({ ...historyState, [field]: value })
    }
  }

  const moveSection = (index: number, direction: 'up' | 'down') => {
    const newSections = [...localState.sections]
    if (direction === 'up' && index > 0) {
      ;[newSections[index - 1], newSections[index]] = [newSections[index], newSections[index - 1]]
    } else if (direction === 'down' && index < newSections.length - 1) {
      ;[newSections[index + 1], newSections[index]] = [newSections[index], newSections[index + 1]]
    } else {
      return
    }
    const newState = { ...historyState, sections: newSections }
    setPresent(newState)
  }

  const handleSave = () => {
    if (hasErrors) return
    toast({
      title: 'Loja Atualizada',
      description: 'A nova vitrine foi publicada e já está online.',
    })
  }

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Editor da Vitrine</h1>
          <p className="text-muted-foreground">
            Construa e personalize a página inicial da sua loja.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <div className="flex gap-1 mr-2 bg-muted/50 p-1 rounded-md">
            <Button variant="ghost" size="icon" onClick={undo} disabled={!canUndo} title="Desfazer">
              <Undo2 className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={redo} disabled={!canRedo} title="Refazer">
              <Redo2 className="w-4 h-4" />
            </Button>
          </div>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="flex-1 sm:flex-none">
                <Eye className="w-4 h-4 mr-2" /> Preview Real-time
              </Button>
            </SheetTrigger>
            <SheetContent className="w-full sm:max-w-3xl overflow-y-auto p-0">
              <div className="p-6 border-b sticky top-0 bg-background/95 backdrop-blur z-10">
                <SheetTitle>Preview da Vitrine</SheetTitle>
                <SheetDescription>
                  Como seus clientes verão a loja com as alterações atuais.
                </SheetDescription>
              </div>
              <div className="bg-background m-6 border rounded-xl overflow-hidden shadow-2xl">
                {/* Mock Storefront */}
                <div className="h-16 bg-primary text-primary-foreground flex items-center px-6 justify-between">
                  <div className="font-bold text-lg tracking-tight">Footgolf Store</div>
                  <div className="flex gap-4 opacity-80">
                    <Search className="w-5 h-5" />
                    <ShoppingCart className="w-5 h-5" />
                  </div>
                </div>
                <div className="h-64 bg-muted relative flex items-center justify-center border-b">
                  <ImageIcon className="w-16 h-16 text-muted-foreground/30 absolute" />
                  {localState.bannerLink && (
                    <Badge variant="secondary" className="relative z-10 shadow-sm">
                      Destino: {localState.bannerLink}
                    </Badge>
                  )}
                </div>
                <div className="p-8 space-y-10">
                  {localState.sections.map((sec) => (
                    <div key={sec}>
                      <h3 className="text-2xl font-bold tracking-tight mb-6">{sec}</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map((i) => (
                          <div key={i} className="h-40 bg-muted/50 rounded-lg animate-pulse"></div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="bg-muted/30 p-8 grid md:grid-cols-2 gap-12 border-t text-sm">
                  <div>
                    <h4 className="font-bold text-lg mb-4">Sobre Nós</h4>
                    <div
                      className="prose prose-sm max-w-none text-muted-foreground"
                      dangerouslySetInnerHTML={{ __html: localState.description }}
                    />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg mb-4">Políticas e Ajuda</h4>
                    <div
                      className="prose prose-sm max-w-none text-muted-foreground"
                      dangerouslySetInnerHTML={{ __html: localState.policies }}
                    />
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          <Button onClick={handleSave} disabled={hasErrors} className="flex-1 sm:flex-none">
            <Save className="w-4 h-4 mr-2" /> Publicar Loja
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Banner Promocional</CardTitle>
            <CardDescription>A imagem de grande destaque no topo da loja.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed rounded-lg p-10 flex flex-col items-center justify-center text-muted-foreground hover:bg-accent/50 cursor-pointer transition-colors bg-muted/10">
              <ImageIcon className="w-12 h-12 mb-3 text-muted-foreground/50" />
              <span className="font-medium text-foreground">Upload do Banner Principal</span>
              <span className="text-xs mt-1">Recomendado: 1920x600 pixels (JPG/PNG)</span>
            </div>
            <div className="space-y-2">
              <Label>Link de Destino do Banner</Label>
              <Input
                placeholder="Ex: /store?category=lancamentos"
                value={localState.bannerLink}
                onChange={(e) => handleChange('bannerLink', e.target.value)}
                onBlur={(e) => handleCommit('bannerLink', e.target.value)}
                className={cn({
                  'border-destructive focus-visible:ring-destructive': errors.bannerLink,
                })}
              />
              {errors.bannerLink && (
                <p className="text-xs text-destructive flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3 h-3" /> {errors.bannerLink}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Organização de Prateleiras</CardTitle>
            <CardDescription>Ordene os blocos de exibição da vitrine.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {localState.sections.map((sec, idx) => (
              <div
                key={sec}
                className="flex items-center gap-3 p-3 bg-background border rounded-md shadow-sm group hover:border-primary/50 transition-colors"
              >
                <span className="font-medium flex-1">{sec}</span>
                <div className="flex gap-1 opacity-50 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => moveSection(idx, 'up')}
                    disabled={idx === 0}
                  >
                    <ArrowUp className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => moveSection(idx, 'down')}
                    disabled={idx === localState.sections.length - 1}
                  >
                    <ArrowDown className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 shadow-sm">
          <CardHeader>
            <CardTitle>Textos Institucionais e Políticas</CardTitle>
            <CardDescription>Edite usando formato rico para maior destaque.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <div className="flex justify-between items-center mb-1">
                <Label>Descrição da Loja</Label>
                <Badge variant="secondary">HTML Suportado</Badge>
              </div>
              <Textarea
                className={cn('min-h-[220px] font-mono text-sm bg-muted/10', {
                  'border-destructive focus-visible:ring-destructive': errors.description,
                })}
                placeholder="Escreva sobre a história..."
                value={localState.description}
                onChange={(e) => handleChange('description', e.target.value)}
                onBlur={(e) => handleCommit('description', e.target.value)}
              />
              {errors.description && (
                <p className="text-xs text-destructive flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3 h-3" /> {errors.description}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center mb-1">
                <Label>Política de Trocas e Frete</Label>
                <Badge variant="secondary">HTML Suportado</Badge>
              </div>
              <Textarea
                className={cn('min-h-[220px] font-mono text-sm bg-muted/10', {
                  'border-destructive focus-visible:ring-destructive': errors.policies,
                })}
                placeholder="Defina regras..."
                value={localState.policies}
                onChange={(e) => handleChange('policies', e.target.value)}
                onBlur={(e) => handleCommit('policies', e.target.value)}
              />
              {errors.policies && (
                <p className="text-xs text-destructive flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3 h-3" /> {errors.policies}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
