import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { SYSTEM_DATA_ID } from '@/hooks/use-system-data'
import { useToast } from '@/hooks/use-toast'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  FileSignature,
  Loader2,
  RefreshCw,
  Save,
  CheckCircle2,
  XCircle,
  Copy,
  AlertTriangle,
} from 'lucide-react'

/** Tipos de documento que podem exigir assinatura via Autentique. */
const TIPOS_DOCUMENTO = [
  {
    key: 'contrato',
    label: 'Contrato',
    field: 'autentique_templates_contrato',
    ordem: 'CONTRATADA → CONTRATANTE',
  },
  {
    key: 'cancelamento',
    label: 'Termo de Cancelamento',
    field: 'autentique_templates_cancelamento',
    ordem: 'CONTRATADA → CONTRATANTE',
  },
  {
    key: 'responsabilidade',
    label: 'Termo de Responsabilidade',
    field: 'autentique_templates_responsabilidade',
    ordem: 'CONTRATADA → CONTRATANTE',
  },
] as const

type TipoKey = (typeof TIPOS_DOCUMENTO)[number]['key']

interface AssinaturaConfig {
  autentique_signer_name: string
  autentique_signer_cpf_cnpj: string
  autentique_signer_email: string
  autentique_templates: Record<TipoKey, string>
}

const DEFAULT_CONFIG: AssinaturaConfig = {
  autentique_signer_name: '',
  autentique_signer_cpf_cnpj: '',
  autentique_signer_email: '',
  autentique_templates: { contrato: '', cancelamento: '', responsabilidade: '' },
}

interface AutentiqueEventRow {
  id: string
  event_id: string | null
  event_type: string | null
  contract_id: string | null
  documento_nome: string | null
  status: string | null
  created_at: string
}

interface ContratoLite {
  id: string
  numero_contrato: string | null
}

export default function AdminAssinaturas() {
  const { toast } = useToast()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [configured, setConfigured] = useState<boolean | null>(null)
  const [config, setConfig] = useState<AssinaturaConfig>(DEFAULT_CONFIG)
  const [events, setEvents] = useState<AutentiqueEventRow[]>([])
  const [contratos, setContratos] = useState<Record<string, string>>({})
  const [copied, setCopied] = useState(false)
  const loadedRef = useRef(false)

  const loadAll = useCallback(async () => {
    setLoading(true)
    try {
      const [sysRes, evRes, ctRes, fnRes] = await Promise.all([
        supabase.from('system_data').select('integrations').eq('id', SYSTEM_DATA_ID).single(),
        supabase
          .from('autentique_events')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(100),
        supabase.from('contratos').select('id, numero_contrato'),
        supabase.functions.invoke('autentique-status'),
      ])

      if (sysRes.error) throw sysRes.error
      const integrations = (sysRes.data?.integrations || {}) as Record<string, any>
      const tpl = (integrations.autentique_templates || {}) as Record<string, any>
      setConfig({
        autentique_signer_name: integrations.autentique_signer_name || '',
        autentique_signer_cpf_cnpj: integrations.autentique_signer_cpf_cnpj || '',
        autentique_signer_email: integrations.autentique_signer_email || '',
        autentique_templates: {
          contrato: tpl.contrato || '',
          cancelamento: tpl.cancelamento || '',
          responsabilidade: tpl.responsabilidade || '',
        },
      })

      if (evRes.error) {
        console.error(evRes.error)
        setEvents([])
      } else {
        setEvents((evRes.data || []) as AutentiqueEventRow[])
      }

      const map: Record<string, string> = {}
      for (const c of (ctRes.data || []) as ContratoLite[]) map[c.id] = c.numero_contrato || ''
      setContratos(map)

      if (fnRes.error) {
        console.warn('autentique-status indisponível:', fnRes.error.message)
        setConfigured(null)
      } else {
        setConfigured(Boolean((fnRes.data as any)?.configured))
      }
    } catch (e: any) {
      console.error(e)
      toast({
        title: 'Erro ao carregar',
        description: e.message || 'Não foi possível carregar a configuração de assinaturas.',
        variant: 'destructive',
      })
    } finally {
      loadedRef.current = true
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    loadAll()
  }, [loadAll])

  const saveConfig = async () => {
    setSaving(true)
    try {
      // Merge seguro: carrega integrations fresco para não sobrescrever outras chaves
      const { data: fresh, error } = await supabase
        .from('system_data')
        .select('integrations')
        .eq('id', SYSTEM_DATA_ID)
        .single()
      if (error) throw error
      const current = (fresh?.integrations || {}) as Record<string, any>
      const merged = {
        ...current,
        autentique_signer_name: config.autentique_signer_name,
        autentique_signer_cpf_cnpj: config.autentique_signer_cpf_cnpj,
        autentique_signer_email: config.autentique_signer_email,
        autentique_templates: config.autentique_templates,
      }
      const { error: upErr } = await supabase
        .from('system_data')
        .update({ integrations: merged })
        .eq('id', SYSTEM_DATA_ID)
      if (upErr) throw upErr
      toast({ title: 'Sucesso', description: 'Configurações de assinatura salvas.' })
    } catch (e: any) {
      console.error(e)
      toast({
        title: 'Erro ao salvar',
        description: e.message || 'Falha ao salvar a configuração.',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const copyWebhook = async () => {
    const url = `${window.location.origin}/functions/v1/autentique-webhook`
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast({ title: 'Não foi possível copiar', variant: 'destructive' })
    }
  }

  const formatDateTime = (iso: string) =>
    new Date(iso).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })

  const eventBadgeVariant = (type: string | null) => {
    if (!type) return 'secondary'
    if (type.toUpperCase().includes('FINISHED') || type.toUpperCase().includes('SIGNED'))
      return 'default'
    if (type.toUpperCase().includes('CANCELED') || type.toUpperCase().includes('REJECTED'))
      return 'destructive'
    return 'secondary'
  }

  if (loading) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto p-4 md:p-6">
        <Skeleton className="h-10 w-72" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  const webhookUrl = `${window.location.origin}/functions/v1/autentique-webhook`

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-4 md:p-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <FileSignature className="w-7 h-7" /> Assinaturas
          </h1>
          <p className="text-muted-foreground">
            Integração com a Autentique para assinatura eletrônica de contratos e termos.
          </p>
        </div>
        <Button variant="outline" onClick={loadAll} disabled={loading}>
          <RefreshCw className="w-4 h-4 mr-2" /> Atualizar
        </Button>
      </div>

      {/* Status da integração */}
      <Card>
        <CardHeader>
          <CardTitle>Status da Integração</CardTitle>
          <CardDescription>
            A chave de API é gerenciada como segredo do servidor e nunca é exibida nesta tela.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            {configured === null ? (
              <>
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                <span className="text-sm text-muted-foreground">
                  Não foi possível verificar o status da integração agora.
                </span>
              </>
            ) : configured ? (
              <>
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-green-700">Conectado</span>
              </>
            ) : (
              <>
                <XCircle className="w-5 h-5 text-red-500" />
                <span className="text-sm font-medium text-red-600">
                  Não configurado — a chave de API (AUTENTIQUE_API_KEY) não está definida no
                  servidor.
                </span>
              </>
            )}
          </div>

          <div className="space-y-2">
            <Label>URL do Webhook</Label>
            <div className="flex items-center gap-2">
              <Input value={webhookUrl} readOnly className="font-mono text-xs" />
              <Button variant="outline" size="sm" onClick={copyWebhook}>
                {copied ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-1 text-green-600" /> Copiado
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-1" /> Copiar
                  </>
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Cadastre esta URL na Autentique. O webhook é autenticado pelo segredo configurado nas
              integrações do sistema (autentique_webhook_secret).
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Signatário padrão da CONTRATADA */}
      <Card>
        <CardHeader>
          <CardTitle>Signatário Padrão — CONTRATADA</CardTitle>
          <CardDescription>
            Dados usados como primeiro signatário (order_index 1) em todos os documentos enviados
            para assinatura.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="signer-name">Nome</Label>
            <Input
              id="signer-name"
              value={config.autentique_signer_name}
              onChange={(e) => setConfig({ ...config, autentique_signer_name: e.target.value })}
              placeholder="Razão social da CONTRATADA"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="signer-cpf-cnpj">CPF/CNPJ</Label>
            <Input
              id="signer-cpf-cnpj"
              value={config.autentique_signer_cpf_cnpj}
              onChange={(e) => setConfig({ ...config, autentique_signer_cpf_cnpj: e.target.value })}
              placeholder="00.000.000/0000-00"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="signer-email">E-mail</Label>
            <Input
              id="signer-email"
              type="email"
              value={config.autentique_signer_email}
              onChange={(e) => setConfig({ ...config, autentique_signer_email: e.target.value })}
              placeholder="contratos@empresa.com.br"
            />
          </div>
        </CardContent>
      </Card>

      {/* Modelos / documentos que exigem assinatura */}
      <Card>
        <CardHeader>
          <CardTitle>Modelos por Tipo de Documento</CardTitle>
          <CardDescription>
            Informe o ID (public_id) do modelo/pasta na Autentique para cada tipo de documento.
            Todos os documentos seguem a ordem de assinatura CONTRATADA → CONTRATANTE.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {TIPOS_DOCUMENTO.map((t) => (
            <div key={t.key} className="grid gap-2 md:grid-cols-[220px_1fr] items-center">
              <div>
                <Label>{t.label}</Label>
                <p className="text-xs text-muted-foreground">Ordem: {t.ordem}</p>
              </div>
              <Input
                value={config.autentique_templates[t.key as TipoKey] || ''}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    autentique_templates: {
                      ...config.autentique_templates,
                      [t.key]: e.target.value,
                    },
                  })
                }
                placeholder="ID do modelo na Autentique (opcional)"
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={saveConfig} disabled={saving}>
          {saving ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          Salvar Alterações
        </Button>
      </div>

      {/* Histórico de eventos */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Eventos (Autentique)</CardTitle>
          <CardDescription>Últimos 100 eventos recebidos via webhook.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Evento</TableHead>
                  <TableHead>Contrato</TableHead>
                  <TableHead>Documento</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      Nenhum evento recebido ainda.
                    </TableCell>
                  </TableRow>
                ) : (
                  events.map((ev) => (
                    <TableRow key={ev.id}>
                      <TableCell className="whitespace-nowrap">
                        {formatDateTime(ev.created_at)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={eventBadgeVariant(ev.event_type)}>
                          {ev.event_type || '—'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {ev.contract_id
                          ? contratos[ev.contract_id] || ev.contract_id.slice(0, 8)
                          : '—'}
                      </TableCell>
                      <TableCell>{ev.documento_nome || '—'}</TableCell>
                      <TableCell>{ev.status || '—'}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
