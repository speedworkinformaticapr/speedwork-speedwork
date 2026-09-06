import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from '@/hooks/use-toast'
import {
  Printer,
  FileSignature,
  RefreshCcw,
  Plus,
  Users,
  Clock,
  History,
  Trash2,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ContractsNav } from './contracts/ContractsNav'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'

export default function AdminContratoView() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [contrato, setContrato] = useState<any>(null)
  const [signatories, setSignatories] = useState<any[]>([])
  const [addendums, setAddendums] = useState<any[]>([])
  const [profiles, setProfiles] = useState<any[]>([])

  const [sigOpen, setSigOpen] = useState(false)
  const [sigForm, setSigForm] = useState({ profile_id: '', role: 'Testemunha' })

  const [simOpen, setSimOpen] = useState(false)
  const [simDate, setSimDate] = useState('')

  const isUuidValid = (uuid?: string) => {
    if (!uuid) return false
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(uuid)
  }

  useEffect(() => {
    if (id === 'wizard') {
      navigate('/admin/contracts/wizard', { replace: true })
      return
    }

    if (isUuidValid(id)) {
      load()
    }
  }, [id, navigate])

  const load = async () => {
    if (!id || !isUuidValid(id)) return

    const { data } = await supabase
      .from('contratos')
      .select('*, profiles!cliente_id(name), usuarios(nome)')
      .eq('id', id)
      .single()
    setContrato(data)

    if (data) {
      const { data: sigs } = await (supabase.from as any)('contract_signatories')
        .select('*, profiles(name, email)')
        .eq('contract_id', id)
        .order('created_at')
      setSignatories(sigs || [])

      const { data: adds } = await supabase
        .from('contratos')
        .select('*')
        .eq('parent_contract_id', id)
      setAddendums(adds || [])

      const { data: profs } = await supabase.from('profiles').select('id, name')
      setProfiles(profs || [])
    }
  }

  const changeStatus = async (status: string) => {
    await supabase.from('contratos').update({ status }).eq('id', id)
    toast({ title: 'Status Atualizado' })
    load()
  }

  const addSignatory = async () => {
    if (!sigForm.profile_id) return
    await (supabase.from as any)('contract_signatories').insert([{ contract_id: id, ...sigForm }])
    toast({ title: 'Signatário adicionado' })
    setSigOpen(false)
    load()
  }

  const removeSignatory = async (sigId: string) => {
    await (supabase.from as any)('contract_signatories').delete().eq('id', sigId)
    load()
  }

  if (!contrato) return <div className="p-10 text-center">Carregando...</div>

  const start = new Date(contrato.data_inicio).getTime()
  const end = contrato.data_fim ? new Date(contrato.data_fim).getTime() : null
  const now = new Date().getTime()
  let progress = 0
  let isExpired = false
  if (end && start < end) {
    progress = Math.min(100, Math.max(0, ((now - start) / (end - start)) * 100))
    if (now > end) isExpired = true
  }

  const simulateRenewal = () => {
    if (!contrato.data_fim) return
    const d = new Date(contrato.data_fim)
    d.setFullYear(d.getFullYear() + 1)
    setSimDate(d.toLocaleDateString('pt-BR'))
    setSimOpen(true)
  }

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <ContractsNav />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            {contrato.numero_contrato}
            <Badge
              variant={
                contrato.status === 'ativo'
                  ? 'default'
                  : contrato.status === 'Em Assinatura'
                    ? 'secondary'
                    : 'outline'
              }
            >
              {contrato.status}
            </Badge>
          </h1>
          <p className="text-muted-foreground mt-1">
            Cliente/Contratante: {contrato.profiles?.name || 'N/A'}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 print:hidden">
          {contrato.status === 'rascunho' && (
            <Button onClick={() => changeStatus('Em Assinatura')}>
              <FileSignature className="w-4 h-4 mr-2" /> Enviar para Assinatura
            </Button>
          )}
          {contrato.status === 'Em Assinatura' && (
            <Button onClick={() => changeStatus('ativo')}>Marcar como Ativo</Button>
          )}
          {contrato.status === 'ativo' && (
            <>
              <Button variant="secondary" asChild>
                <Link to="/admin/contracts/wizard">
                  <Plus className="w-4 h-4 mr-2" /> Criar Aditivo
                </Link>
              </Button>
              <Button variant="outline" onClick={simulateRenewal}>
                <RefreshCcw className="w-4 h-4 mr-2" /> Simular Renovação
              </Button>
            </>
          )}
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="w-4 h-4 mr-2" /> Imprimir
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Detalhes do Contrato</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-muted-foreground block">Tipo</span>
                <span className="font-medium capitalize">{contrato.tipo_contrato}</span>
              </div>
              <div>
                <span className="text-sm text-muted-foreground block">Valor do Ciclo</span>
                <span className="font-medium text-green-600 text-lg">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                    contrato.valor_ciclo || 0,
                  )}
                </span>
              </div>
            </div>

            <div className="space-y-2 border-t pt-4">
              <h4 className="font-semibold flex items-center gap-2">
                <Clock className="w-4 h-4" /> Vigência
              </h4>
              <div className="flex justify-between text-sm">
                <span>Início: {new Date(contrato.data_inicio).toLocaleDateString('pt-BR')}</span>
                <span>
                  Fim:{' '}
                  {contrato.data_fim
                    ? new Date(contrato.data_fim).toLocaleDateString('pt-BR')
                    : 'Indeterminado'}
                </span>
              </div>
              {contrato.data_fim && (
                <div className="relative pt-1">
                  <Progress
                    value={progress}
                    className={`h-2 ${isExpired ? 'bg-red-100 [&>div]:bg-red-500' : ''}`}
                  />
                  {isExpired && <p className="text-xs text-red-500 mt-1">Contrato Expirado</p>}
                </div>
              )}
              {contrato.renovacao_automatica && (
                <Badge variant="outline" className="mt-2 bg-blue-50">
                  Renovação Automática Ativa
                </Badge>
              )}
            </div>

            {contrato.observacoes && (
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-2">Conteúdo / Cláusulas</h4>
                <div
                  className="bg-muted/20 p-4 rounded-md text-sm prose dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: contrato.observacoes }}
                ></div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row justify-between items-center pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="w-5 h-5" /> Signatários
              </CardTitle>
              {['rascunho', 'Em Assinatura'].includes(contrato.status) && (
                <Button variant="ghost" size="icon" onClick={() => setSigOpen(true)}>
                  <Plus className="w-4 h-4" />
                </Button>
              )}
            </CardHeader>
            <CardContent>
              <div className="space-y-4 mt-2">
                {signatories.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nenhum signatário adicionado.</p>
                ) : null}
                {signatories.map((sig) => (
                  <div
                    key={sig.id}
                    className="flex justify-between items-center bg-muted/30 p-2 rounded-md"
                  >
                    <div>
                      <p className="font-medium text-sm">{sig.profiles?.name}</p>
                      <p className="text-xs text-muted-foreground">{sig.role}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={sig.status === 'Assinado' ? 'default' : 'secondary'}
                        className="text-[10px]"
                      >
                        {sig.status}
                      </Badge>
                      {['rascunho', 'Em Assinatura'].includes(contrato.status) && (
                        <button
                          onClick={() => removeSignatory(sig.id)}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <History className="w-5 h-5" /> Aditivos Vinculados
              </CardTitle>
            </CardHeader>
            <CardContent>
              {addendums.length === 0 ? (
                <p className="text-sm text-muted-foreground mt-2">Nenhum aditivo registrado.</p>
              ) : (
                <div className="space-y-2 mt-2">
                  {addendums.map((add) => (
                    <Link
                      key={add.id}
                      to={`/admin/commercial/contracts/${add.id}`}
                      className="block border p-2 rounded-md hover:bg-muted transition-colors"
                    >
                      <div className="flex justify-between">
                        <span className="font-medium text-sm">{add.numero_contrato}</span>
                        <Badge variant="outline" className="text-[10px]">
                          {add.status}
                        </Badge>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(add.data_inicio).toLocaleDateString()}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={sigOpen} onOpenChange={setSigOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Signatário</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Perfil (Usuário/Entidade)</Label>
              <Select
                value={sigForm.profile_id}
                onValueChange={(v) => setSigForm({ ...sigForm, profile_id: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {profiles.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Papel na Assinatura</Label>
              <Select
                value={sigForm.role}
                onValueChange={(v) => setSigForm({ ...sigForm, role: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Contratante">Contratante</SelectItem>
                  <SelectItem value="Contratado">Contratado</SelectItem>
                  <SelectItem value="Interveniente Anuente">Interveniente Anuente</SelectItem>
                  <SelectItem value="Testemunha">Testemunha</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSigOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={addSignatory}>Adicionar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={simOpen} onOpenChange={setSimOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Simulação de Renovação</DialogTitle>
          </DialogHeader>
          <div className="py-6 text-center space-y-4">
            <RefreshCcw className="w-12 h-12 mx-auto text-muted-foreground" />
            <p>
              Se a renovação automática for executada com +12 meses, a nova data de vencimento será:
            </p>
            <p className="text-2xl font-bold text-primary">{simDate}</p>
          </div>
          <DialogFooter>
            <Button onClick={() => setSimOpen(false)}>Fechar Simulação</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
