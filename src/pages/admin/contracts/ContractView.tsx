import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { toast } from '@/hooks/use-toast'
import { ArrowLeft, Edit, FilePlus, Send, Trash2 } from 'lucide-react'
import { useSimulatedRole } from './use-simulated-role'

export default function ContractView() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { role } = useSimulatedRole()

  const [contract, setContract] = useState<any>(null)
  const [signatories, setSignatories] = useState<any[]>([])
  const [addendums, setAddendums] = useState<any[]>([])
  const [profiles, setProfiles] = useState<any[]>([])

  // Add Signatory State
  const [newSig, setNewSig] = useState({ profile_id: '', role: 'Testemunha' })
  const [simulatedDate, setSimulatedDate] = useState<string | null>(null)

  useEffect(() => {
    loadData()
    supabase
      .from('profiles')
      .select('id, name, cpf_cnpj')
      .then(({ data }) => setProfiles(data || []))
  }, [id])

  const loadData = async () => {
    const { data: c } = await supabase
      .from('contratos')
      .select('*, profiles:cliente_id(name)')
      .eq('id', id)
      .single()
    if (c) setContract(c)

    const { data: sigs } = await supabase
      .from('contract_signatories')
      .select('*, profiles(name, email)')
      .eq('contract_id', id)
      .order('signing_order')
    if (sigs) setSignatories(sigs)

    const { data: adds } = await supabase
      .from('contratos')
      .select('id, numero_contrato, status, data_inicio')
      .eq('parent_contract_id', id)
    if (adds) setAddendums(adds)
  }

  const handleAddSignatory = async () => {
    if (!newSig.profile_id) return
    await supabase.from('contract_signatories').insert({
      contract_id: id,
      profile_id: newSig.profile_id,
      role: newSig.role,
      status: 'Pendente',
    })
    setNewSig({ profile_id: '', role: 'Testemunha' })
    loadData()
  }

  const handleSendSignature = async () => {
    await supabase.from('contratos').update({ status: 'em assinatura' }).eq('id', id)
    toast({ title: 'Status atualizado', description: 'O contrato foi movido para Em Assinatura.' })
    loadData()
  }

  const handleSimulate = () => {
    if (!contract.data_fim) return
    const curr = new Date(contract.data_fim)
    curr.setMonth(curr.getMonth() + 12)
    setSimulatedDate(curr.toISOString())
  }

  const createAddendum = async () => {
    const { data, error } = await supabase
      .from('contratos')
      .insert({
        parent_contract_id: contract.id,
        cliente_id: contract.cliente_id,
        status: 'rascunho',
        numero_contrato: `${contract.numero_contrato}-A${addendums.length + 1}`,
        content: contract.content,
      })
      .select()
      .single()
    if (error) return toast({ title: 'Erro ao criar aditivo', variant: 'destructive' })
    toast({ title: 'Aditivo Criado' })
    navigate(`/admin/contracts/${data.id}`)
  }

  const handleDelete = async () => {
    if (addendums.length > 0)
      return toast({
        title: 'Erro',
        description: 'Existem aditivos vinculados. Exclua-os primeiro.',
        variant: 'destructive',
      })
    await supabase.from('contratos').delete().eq('id', id)
    toast({ title: 'Contrato excluído' })
    navigate('/admin/contracts/dashboard')
  }

  if (!contract) return <div className="p-10 text-center">Carregando...</div>

  // Timeline calc
  const start = new Date(contract.data_inicio).getTime()
  const end = new Date(simulatedDate || contract.data_fim).getTime()
  const now = new Date().getTime()
  const progress = contract.data_fim
    ? Math.max(0, Math.min(100, ((now - start) / (end - start)) * 100))
    : 0

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-3">
              {contract.numero_contrato}
              <Badge variant="outline" className="capitalize text-sm">
                {contract.status}
              </Badge>
            </h1>
            <p className="text-muted-foreground">Parte: {contract.profiles?.name}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {contract.status === 'rascunho' && (
            <Button onClick={handleSendSignature}>
              <Send className="w-4 h-4 mr-2" /> Enviar Assinatura
            </Button>
          )}
          {role === 'Admin' && (
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 className="w-4 h-4 mr-2" /> Excluir
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="geral" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="geral">Visão Geral do Documento</TabsTrigger>
          <TabsTrigger value="signatarios">Signatários & Fluxo</TabsTrigger>
          <TabsTrigger value="vigencia">Vigência & Aditivos</TabsTrigger>
        </TabsList>

        <TabsContent value="geral" className="mt-4">
          <Card>
            <CardContent
              className="p-6 prose max-w-none bg-white text-black min-h-[400px]"
              dangerouslySetInnerHTML={{ __html: contract.content || 'Nenhum conteúdo.' }}
            />
          </Card>
        </TabsContent>

        <TabsContent value="signatarios" className="mt-4 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Lista de Assinaturas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {signatories.map((s) => (
                <div key={s.id} className="flex justify-between items-center p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">{s.profiles?.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {s.profiles?.email} • Papel: {s.role}
                    </div>
                  </div>
                  <Badge variant={s.status === 'Assinado' ? 'default' : 'secondary'}>
                    {s.status}
                  </Badge>
                </div>
              ))}
              {signatories.length === 0 && (
                <p className="text-muted-foreground text-center py-4">
                  Nenhum signatário adicionado.
                </p>
              )}
            </CardContent>
          </Card>

          {['rascunho', 'em assinatura'].includes(contract.status) && role !== 'Viewer' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Adicionar Signatário</CardTitle>
              </CardHeader>
              <CardContent className="flex gap-4">
                <Select
                  value={newSig.profile_id}
                  onValueChange={(v) => setNewSig({ ...newSig, profile_id: v })}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Selecione a pessoa/empresa" />
                  </SelectTrigger>
                  <SelectContent>
                    {profiles.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name} ({p.cpf_cnpj})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={newSig.role}
                  onValueChange={(v) => setNewSig({ ...newSig, role: v })}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Contratante">Contratante</SelectItem>
                    <SelectItem value="Contratado">Contratado</SelectItem>
                    <SelectItem value="Interveniente">Interveniente</SelectItem>
                    <SelectItem value="Testemunha">Testemunha</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={handleAddSignatory}>Adicionar</Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="vigencia" className="mt-4 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Linha do Tempo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 mt-4">
                <Progress value={progress} className="h-3" />
                <div className="flex justify-between text-sm text-muted-foreground font-medium">
                  <span>Início: {new Date(contract.data_inicio).toLocaleDateString()}</span>
                  <span className={simulatedDate ? 'text-primary' : ''}>
                    Vencimento:{' '}
                    {contract.data_fim
                      ? new Date(simulatedDate || contract.data_fim).toLocaleDateString()
                      : 'Indeterminado'}
                  </span>
                </div>
              </div>
              <div className="mt-8 flex gap-4">
                <Button variant="outline" onClick={handleSimulate} disabled={!contract.data_fim}>
                  Simular Renovação (+12m)
                </Button>
                {simulatedDate && (
                  <Button variant="ghost" onClick={() => setSimulatedDate(null)}>
                    Limpar Simulação
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row justify-between items-center">
              <CardTitle>Aditivos Vinculados</CardTitle>
              {contract.status === 'ativo' && role !== 'Viewer' && (
                <Button onClick={createAddendum} variant="secondary" size="sm">
                  <FilePlus className="w-4 h-4 mr-2" /> Criar Aditivo
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {addendums.length === 0 ? (
                <p className="text-muted-foreground text-sm">Nenhum aditivo registrado.</p>
              ) : (
                <div className="space-y-3">
                  {addendums.map((add) => (
                    <div
                      key={add.id}
                      className="flex justify-between items-center p-3 border rounded-lg bg-muted/30"
                    >
                      <div>
                        <div className="font-medium">{add.numero_contrato}</div>
                        <div className="text-sm text-muted-foreground">
                          Criado em: {new Date(add.data_inicio).toLocaleDateString()}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/admin/contracts/${add.id}`)}
                      >
                        Acessar
                      </Button>
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
