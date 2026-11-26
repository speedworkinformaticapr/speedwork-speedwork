// Tela Editar Modelo (contrato): nome + descrição, guias (Contrato) (Anexo 1)
// (Anexo 2)... com editor WYSIWYG (RichTextEditor) e painel de variáveis em
// cada aba, botão "Adicionar Anexo" e remoção de anexo. Persistência: o corpo
// fica em contract_templates.content; os anexos, em contract_annexes
// (contract_id = id do modelo, annex_type = título, version = "vN").
import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2, Plus, Trash2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { ContractSectionEditor } from '@/components/contracts/ContractSectionEditor'
import {
  fetchContractAnnexes,
  saveContractAnnexes,
  tituloAbaAnexo,
} from '@/lib/contract-annex-sections'

interface AnexoLocal {
  title: string
  html: string
}

const ANEXOS_MAX = 20

export default function AdminTemplateForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [isEditing] = useState<boolean>(!!id)

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [contratoHtml, setContratoHtml] = useState('')
  const [anexos, setAnexos] = useState<AnexoLocal[]>([])
  const [aba, setAba] = useState('contrato')
  const [confirmAnexo, setConfirmAnexo] = useState<number | null>(null)
  const editorRef = useRef<{ insertHtml: (html: string) => void } | null>(null)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    ;(async () => {
      try {
        const { data, error } = await supabase
          .from('contract_templates')
          .select('*')
          .eq('id', id)
          .single()
        if (error) throw error
        if (data) {
          setName(data.name || '')
          setDescription(data.description || '')
          setContratoHtml(data.content || '')
          // Anexos persistidos na própria tabela de anexos do modelo (mesma
          // estrutura de contract_annexes, com contract_id = id do modelo).
          const linhas = await fetchContractAnnexes(id)
          setAnexos(
            linhas.map((r) => ({
              title: r.annex_type || '',
              html: r.content || '',
            })),
          )
        }
      } catch (error: any) {
        toast({
          title: 'Erro ao carregar modelo',
          description: error?.message || 'Tente novamente.',
          variant: 'destructive',
        })
      } finally {
        setLoading(false)
      }
    })()
  }, [id])

  const adicionarAnexo = () => {
    if (anexos.length >= ANEXOS_MAX) {
      toast({ title: `Limite de ${ANEXOS_MAX} anexos atingido`, variant: 'destructive' })
      return
    }
    setAnexos((prev) => [...prev, { title: tituloAbaAnexo(prev.length + 1), html: '' }])
    setAba(`anexo:${anexos.length + 1}`)
  }

  const removerAnexo = (indice: number) => {
    setAnexos((prev) => prev.filter((_, i) => i !== indice))
    setAba(indice === 0 ? 'contrato' : `anexo:${Math.max(1, indice)}`)
  }

  const atualizarAnexo = (indice: number, html: string) => {
    setAnexos((prev) => prev.map((a, i) => (i === indice ? { ...a, html } : a)))
  }

  const salvar = useCallback(async () => {
    if (!name.trim()) {
      toast({ title: 'Informe o nome do modelo', variant: 'destructive' })
      return
    }
    setSaving(true)
    try {
      let templateId = id
      if (isEditing && id) {
        const { error } = await supabase
          .from('contract_templates')
          .update({ name, description, content: contratoHtml })
          .eq('id', id)
        if (error) throw error
      } else {
        const { data, error } = await supabase
          .from('contract_templates')
          .insert([{ name, description, content: contratoHtml }])
          .select('id')
          .single()
        if (error) throw error
        templateId = data?.id
      }
      // Anexos: persiste na tabela de anexos do modelo (mesma estrutura de
      // contract_annexes, com contract_id = id do modelo).
      if (templateId) {
        await saveContractAnnexes(
          templateId,
          anexos.map((a, i) => ({
            title: a.title || tituloAbaAnexo(i + 1),
            html: a.html,
          })),
        )
      }
      toast({ title: `Modelo ${isEditing ? 'atualizado' : 'criado'} com sucesso` })
      navigate('/admin/contracts/templates')
    } catch (error: any) {
      toast({
        title: 'Erro ao salvar modelo',
        description: error?.message || 'Tente novamente.',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }, [anexos, contratoHtml, description, id, isEditing, name, navigate, toast])

  const abaAtiva = aba.startsWith('anexo:') ? Number(aba.split(':')[1]) : null

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          {isEditing ? 'Editar Modelo' : 'Novo Modelo de Contrato'}
        </h1>
        <p className="text-muted-foreground">
          Crie ou edite um modelo de contrato com variáveis dinâmicas e anexos.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          <Card>
            <CardHeader className="pb-4">
              <CardTitle>Identificação do Modelo</CardTitle>
              <CardDescription>Nome e descrição exibidos na lista de modelos.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="template-name">Nome do Modelo</Label>
                <Input
                  id="template-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Contrato de Prestação de Serviços..."
                  autoComplete="off"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="template-description">Descrição Breve</Label>
                <Input
                  id="template-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Para que serve este modelo?"
                  autoComplete="off"
                />
              </div>
            </CardContent>
          </Card>

          <Tabs value={aba} onValueChange={setAba} className="w-full">
            <div className="flex flex-wrap items-center gap-2">
              <TabsList className="flex-wrap h-auto">
                <TabsTrigger value="contrato">Contrato</TabsTrigger>
                {anexos.map((a, i) => (
                  <TabsTrigger key={i} value={`anexo:${i + 1}`}>
                    {a.title || tituloAbaAnexo(i + 1)}
                  </TabsTrigger>
                ))}
              </TabsList>
              <Button type="button" variant="outline" size="sm" onClick={adicionarAnexo}>
                <Plus className="h-4 w-4 mr-1" />
                Adicionar Anexo
              </Button>
            </div>
          </Tabs>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <CardTitle id="conteudo-titulo">
                    {abaAtiva != null
                      ? `Conteúdo do ${anexos[abaAtiva - 1]?.title || tituloAbaAnexo(abaAtiva)}`
                      : 'Conteúdo do Contrato'}
                  </CardTitle>
                  <CardDescription>
                    {abaAtiva != null
                      ? 'Este anexo é gerado como página separada no .docx.'
                      : 'Corpo principal do contrato — gerado com os placeholders substituídos.'}
                  </CardDescription>
                </div>
                {abaAtiva != null && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => setConfirmAnexo(abaAtiva - 1)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Remover anexo
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {abaAtiva != null ? (
                <ContractSectionEditor
                  ref={editorRef}
                  value={anexos[abaAtiva - 1]?.html || ''}
                  onChange={(html) => atualizarAnexo(abaAtiva - 1, html)}
                  minHeight="500px"
                  label={`Conteúdo do ${anexos[abaAtiva - 1]?.title || tituloAbaAnexo(abaAtiva)}`}
                  labelId="conteudo-titulo"
                />
              ) : (
                <ContractSectionEditor
                  ref={editorRef}
                  value={contratoHtml}
                  onChange={setContratoHtml}
                  minHeight="500px"
                  label="Conteúdo do Contrato"
                  labelId="conteudo-titulo"
                />
              )}
            </CardContent>
          </Card>

          <div className="flex items-center justify-end gap-3 pt-2 pb-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/admin/contracts/templates')}
              disabled={saving}
            >
              Cancelar
            </Button>
            <Button type="button" onClick={salvar} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                'Salvar Modelo'
              )}
            </Button>
          </div>
        </>
      )}

      <ConfirmDialog
        open={confirmAnexo !== null}
        onOpenChange={(open) => !open && setConfirmAnexo(null)}
        title="Remover anexo"
        description={`Remover o ${
          confirmAnexo != null
            ? anexos[confirmAnexo]?.title || tituloAbaAnexo(confirmAnexo + 1)
            : ''
        } deste modelo? A remoção é efetivada ao salvar o modelo.`}
        confirmLabel="Remover"
        destructive
        onConfirm={() => {
          if (confirmAnexo != null) removerAnexo(confirmAnexo)
          setConfirmAnexo(null)
        }}
      />
    </div>
  )
}
