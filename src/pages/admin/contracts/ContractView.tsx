import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from '@/hooks/use-toast'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { RichTextEditor } from '@/components/ui/rich-text-editor'
import { useSimulatedRole } from './use-simulated-role'
import {
  ArrowLeft,
  Clock,
  FileSignature,
  FileText,
  AlertTriangle,
  Plus,
  Trash2,
} from 'lucide-react'

export default function ContractView() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { role } = useSimulatedRole()

  const [contract, setContract] = useState<any>(null)
  const [signers, setSigners] = useState<any[]>([])
  const [additives, setAdditives] = useState<any[]>([])
  const [profiles, setProfiles] = useState<any[]>([])

  // States for Modals
  const [newSigner, setNewSigner] = useState({ profile_id: '', role: 'Contratado' })
  const [newAdditive, setNewAdditive] = useState({
    title: '',
    description: '',
    content: '',
    start_date: '',
    end_date: '',
  })

  const isReadOnly = role === 'Viewer' || role === 'Commercial'

  useEffect(() => {
    fetchData()
  }, [id])

  const fetchData = async () => {
    if (!id) return
    const { data: cData } = await supabase
      .from('contratos')
      .select('*, profiles:cliente_id(name)')
      .eq('id', id)
      .single()
    if (cData) setContract(cData)

    const { data: sData } = await supabase
      .from('contract_signers')
      .select('*, profiles(name)')
      .eq('contract_id', id)
      .order('order_index')
    if (sData) setSigners(sData)

    const { data: aData } = await supabase
      .from('contract_additives')
      .select('*')
      .eq('contract_id', id)
      .order('created_at', { ascending: false })
    if (aData) setAdditives(aData)

    const { data: pData } = await supabase.from('profiles').select('id, name')
    if (pData) setProfiles(pData)
  }

  const handleUpdateOrderType = async (type: string) => {
    await supabase.from('contratos').update({ signature_order_type: type }).eq('id', id)
    setContract({ ...contract, signature_order_type: type })
    toast({ title: 'Ordem de assinatura atualizada' })
  }

  const handleAddSigner = async () => {
    if (!newSigner.profile_id)
      return toast({ title: 'Selecione uma entidade', variant: 'destructive' })
    const payload = {
      contract_id: id,
      profile_id: newSigner.profile_id,
      role: newSigner.role,
      status: 'Pendente',
      order_index: signers.length + 1,
    }
    await supabase.from('contract_signers').insert(payload)
    toast({ title: 'Signatário adicionado' })
    fetchData()
  }

  const handleRemoveSigner = async (signerId: string) => {
    await supabase.from('contract_signers').delete().eq('id', signerId)
    toast({ title: 'Signatário removido' })
    fetchData()
  }

  const handleSendToSign = async () => {
    if (signers.length === 0)
      return toast({ title: 'Adicione pelo menos um signatário', variant: 'destructive' })
    await supabase.from('contratos').update({ status: 'em assinatura' }).eq('id', id)
    toast({ title: 'Contrato enviado para assinatura!' })
    fetchData()
  }

  const handleSimulateRenewal = async () => {
    if (!contract.data_fim) return
    const currentEnd = new Date(contract.data_fim)
    currentEnd.setFullYear(currentEnd.getFullYear() + 1)
    await supabase
      .from('contratos')
      .update({ data_fim: currentEnd.toISOString().split('T')[0] })
      .eq('id', id)
    toast({ title: 'Vigência renovada com sucesso!' })
    fetchData()
  }

  const handleCreateAdditive = async () => {
    if (!newAdditive.title || !newAdditive.content)
      return toast({ title: 'Preencha título e conteúdo', variant: 'destructive' })
    await supabase
      .from('contract_additives')
      .insert({ ...newAdditive, contract_id: id, status: 'Ativo' })
    toast({ title: 'Aditivo criado com sucesso' })
    fetchData()
  }

  if (!contract) return <div className="p-6">Carregando...</div>

  const getVigencyStats = () => {
    if (!contract.data_inicio || !contract.data_fim) return { progress: 0, daysLeft: 0, alert: '' }
    const start = new Date(contract.data_inicio).getTime()
    const end = new Date(contract.data_fim).getTime()
    const now = new Date().getTime()
    const total = end - start
    const passed = now - start
    const progress = Math.min(100, Math.max(0, (passed / total) * 100))
    const daysLeft = Math.ceil((end - now) / (1000 * 3600 * 24))

    let alert = ''
    if (daysLeft < 0) alert = 'Expirado'
    else if (daysLeft <= 7) alert = 'Vence em 7 dias ou menos!'
    else if (daysLeft <= 30) alert = 'Vence em 30 dias ou menos'

    return { progress, daysLeft, alert }
  }

  const vigency = getVigencyStats()

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold flex items-center gap-3">
              {contract.numero_contrato}
              <Badge variant="outline" className="capitalize">
                {contract.status}
              </Badge>
            </h1>
            <p className="text-muted-foreground">
              {contract.profiles?.name} • Tipo: {contract.tipo_contrato}
            </p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="document">
        <TabsList className="mb-4 overflow-x-auto w-full justify-start">
          <TabsTrigger value="document">
            <FileText className="w-4 h-4 mr-2" /> Documento
          </TabsTrigger>
          <TabsTrigger value="signatures">
            <FileSignature className="w-4 h-4 mr-2" /> Assinaturas
          </TabsTrigger>
          <TabsTrigger value="vigency">
            <Clock className="w-4 h-4 mr-2" /> Vigência e Renovações
          </TabsTrigger>
          <TabsTrigger value="additives">
            <Plus className="w-4 h-4 mr-2" /> Aditivos ({additives.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="document">
          <Card>
            <CardHeader>
              <CardTitle>Conteúdo do Contrato</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className="border rounded-lg p-8 bg-white min-h-[500px] prose max-w-none text-black"
                dangerouslySetInnerHTML={{
                  __html: contract.content || 'Nenhum conteúdo disponível.',
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="signatures">
          <Card>
            <CardHeader className="flex flex-row justify-between items-start">
              <div>
                <CardTitle>Fluxo de Assinaturas</CardTitle>
                <CardDescription>Gerencie quem deve assinar este documento.</CardDescription>
              </div>
              {!isReadOnly && contract.status === 'rascunho' && (
                <Button onClick={handleSendToSign}>Enviar para Assinatura</Button>
              )}
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4 bg-muted/30 p-4 rounded-lg border">
                <Label>Ordem de Assinatura:</Label>
                <Select
                  value={contract.signature_order_type || 'simultaneous'}
                  onValueChange={handleUpdateOrderType}
                  disabled={isReadOnly || contract.status !== 'rascunho'}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="simultaneous">Simultânea (Todos recebem)</SelectItem>
                    <SelectItem value="sequential">Sequencial (Um por vez)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ordem</TableHead>
                      <TableHead>Entidade</TableHead>
                      <TableHead>Papel</TableHead>
                      <TableHead>Status</TableHead>
                      {!isReadOnly && contract.status === 'rascunho' && (
                        <TableHead className="text-right">Ações</TableHead>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {signers.map((s) => (
                      <TableRow key={s.id}>
                        <TableCell>{s.order_index}</TableCell>
                        <TableCell>{s.profiles?.name}</TableCell>
                        <TableCell>{s.role}</TableCell>
                        <TableCell>
                          <Badge variant={s.status === 'Assinado' ? 'default' : 'secondary'}>
                            {s.status}
                          </Badge>
                        </TableCell>
                        {!isReadOnly && contract.status === 'rascunho' && (
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveSigner(s.id)}
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                    {signers.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground py-4">
                          Nenhum signatário adicionado.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {!isReadOnly && contract.status === 'rascunho' && (
                <div className="flex flex-col md:flex-row gap-4 items-end bg-muted/20 p-4 rounded-lg border">
                  <div className="space-y-2 flex-1 w-full">
                    <Label>Entidade</Label>
                    <Select
                      value={newSigner.profile_id}
                      onValueChange={(v) => setNewSigner({ ...newSigner, profile_id: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione..." />
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
                  <div className="space-y-2 flex-1 w-full">
                    <Label>Papel</Label>
                    <Select
                      value={newSigner.role}
                      onValueChange={(v) => setNewSigner({ ...newSigner, role: v })}
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
                  <Button
                    onClick={handleAddSigner}
                    variant="secondary"
                    className="w-full md:w-auto"
                  >
                    Adicionar
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vigency">
          <Card>
            <CardHeader>
              <CardTitle>Controle de Vigência</CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>
                    Início:{' '}
                    {contract.data_inicio
                      ? new Date(contract.data_inicio).toLocaleDateString()
                      : '-'}
                  </span>
                  <span>
                    Fim:{' '}
                    {contract.data_fim ? new Date(contract.data_fim).toLocaleDateString() : '-'}
                  </span>
                </div>
                <Progress value={vigency.progress} className="h-3" />
                <div className="flex justify-between items-center mt-2">
                  <span className="text-sm text-muted-foreground">
                    {vigency.daysLeft} dias restantes
                  </span>
                  {vigency.alert && (
                    <span
                      className={`text-sm font-bold flex items-center gap-1 ${vigency.daysLeft <= 7 ? 'text-red-500' : 'text-yellow-500'}`}
                    >
                      <AlertTriangle className="w-4 h-4" /> {vigency.alert}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-6 bg-muted/20 p-6 rounded-lg border items-start md:items-center justify-between">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="auto_renew" checked={contract.renovacao_automatica} disabled />
                    <Label htmlFor="auto_renew">Renovação Automática</Label>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Ciclo: {contract.duracao_ciclo || '12 meses'}
                  </p>
                </div>
                {!isReadOnly && (
                  <Button onClick={handleSimulateRenewal} variant="outline">
                    Simular Renovação (+1 ano)
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="additives">
          <Card>
            <CardHeader className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <CardTitle>Aditivos Contratuais</CardTitle>
              {!isReadOnly && contract.status === 'ativo' && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" /> Criar Aditivo
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Novo Aditivo Contratual</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>Título do Aditivo</Label>
                        <Input
                          value={newAdditive.title}
                          onChange={(e) =>
                            setNewAdditive({ ...newAdditive, title: e.target.value })
                          }
                          placeholder="Ex: Aditivo de Prazo 01"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Nova Data Fim (Opcional)</Label>
                          <Input
                            type="date"
                            value={newAdditive.end_date}
                            onChange={(e) =>
                              setNewAdditive({ ...newAdditive, end_date: e.target.value })
                            }
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Conteúdo Modificado</Label>
                        <RichTextEditor
                          value={newAdditive.content}
                          onChange={(v: string) => setNewAdditive({ ...newAdditive, content: v })}
                        />
                      </div>
                      <Button onClick={handleCreateAdditive} className="w-full">
                        Salvar Aditivo
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </CardHeader>
            <CardContent>
              {additives.length === 0 ? (
                <div className="text-center p-6 text-muted-foreground bg-muted/20 rounded-lg border">
                  Nenhum aditivo registrado para este contrato.
                </div>
              ) : (
                <div className="space-y-4">
                  {additives.map((add) => (
                    <div key={add.id} className="border p-4 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-bold text-lg">{add.title}</h4>
                          <span className="text-xs text-muted-foreground">
                            Criado em {new Date(add.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <Badge variant="outline">{add.status}</Badge>
                      </div>
                      {add.end_date && (
                        <p className="text-sm font-medium text-blue-600 mb-2">
                          Nova Data Fim: {new Date(add.end_date).toLocaleDateString()}
                        </p>
                      )}
                      <div
                        className="text-sm bg-muted/50 p-3 rounded prose max-w-none"
                        dangerouslySetInnerHTML={{ __html: add.content }}
                      />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
