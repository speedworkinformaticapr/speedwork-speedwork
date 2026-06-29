import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { upsertLeadByDiagnostic } from '@/services/leads'
import { calculateLeadScore, getScoreLabel } from '@/lib/lead-scoring'
import { toast } from '@/hooks/use-toast'
import { ArrowLeft, Save, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

const PAIN_POINTS_OPTIONS = [
  'Lentidão na rede',
  'Breach de segurança',
  'Falta de backup',
  'Backup falho',
  'Sem suporte',
  'Suporte lento',
  'Infraestrutura desatualizada',
  'Custo alto',
  'Falta de antivírus',
  'Outro',
]

const BUDGET_OPTIONS = ['Baixo (até R$ 2.000)', 'Médio (R$ 2.000 - R$ 5.000)', 'Alto (R$ 5.000+)']

export default function AdminDiagnosticForm() {
  const navigate = useNavigate()
  const [mode, setMode] = useState<'resumido' | 'completo'>('resumido')
  const [saving, setSaving] = useState(false)

  const [basic, setBasic] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    position: '',
    source: 'Site',
  })

  const [resumido, setResumido] = useState({
    pain_points: [] as string[],
    immediate_need: '',
    budget: '',
  })

  const [completo, setCompleto] = useState({
    num_users: '',
    pain_points: [] as string[],
    budget: '',
    has_backup: false,
    has_antivirus: false,
    current_provider: '',
    infrastructure_notes: '',
    security_notes: '',
    timeline: '',
  })

  const togglePainPoint = (list: string[], point: string) => {
    return list.includes(point) ? list.filter((p) => p !== point) : [...list, point]
  }

  const diagnosticData: Record<string, any> =
    mode === 'resumido'
      ? {
          pain_points: resumido.pain_points,
          immediate_need: resumido.immediate_need,
          budget: resumido.budget,
          diagnostic_mode: 'resumido',
        }
      : {
          num_users: completo.num_users ? parseInt(completo.num_users, 10) : undefined,
          pain_points: completo.pain_points,
          budget: completo.budget,
          has_backup: completo.has_backup,
          has_antivirus: completo.has_antivirus,
          current_provider: completo.current_provider,
          infrastructure_notes: completo.infrastructure_notes,
          security_notes: completo.security_notes,
          timeline: completo.timeline,
          diagnostic_mode: 'completo',
        }

  const previewScore = calculateLeadScore(diagnosticData)
  const scoreInfo = getScoreLabel(previewScore)

  const handleSubmit = async () => {
    if (!basic.name || !basic.email) {
      toast({
        title: 'Erro',
        description: 'Nome e email são obrigatórios.',
        variant: 'destructive',
      })
      return
    }

    setSaving(true)
    try {
      const { lead, created } = await upsertLeadByDiagnostic({
        ...basic,
        diagnostic_data: diagnosticData,
      })
      toast({
        title: created ? 'Lead criado!' : 'Lead atualizado!',
        description: `Score calculado: ${lead.score} pontos.`,
      })
      navigate(`/admin/commercial/leads/${lead.id}`)
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-primary">Diagnóstico de TI</h1>
          <p className="text-sm text-muted-foreground">
            Capture dados do prospect e gere um lead automaticamente.
          </p>
        </div>
      </div>

      <Tabs value={mode} onValueChange={(v) => setMode(v as 'resumido' | 'completo')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="resumido">Resumido</TabsTrigger>
          <TabsTrigger value="completo">Completo</TabsTrigger>
        </TabsList>

        <TabsContent value="resumido" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Dados de Contato</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nome *</Label>
                <Input
                  value={basic.name}
                  onChange={(e) => setBasic({ ...basic, name: e.target.value })}
                  placeholder="João Silva"
                />
              </div>
              <div className="space-y-2">
                <Label>Email *</Label>
                <Input
                  type="email"
                  value={basic.email}
                  onChange={(e) => setBasic({ ...basic, email: e.target.value })}
                  placeholder="joao@empresa.com"
                />
              </div>
              <div className="space-y-2">
                <Label>Telefone</Label>
                <Input
                  value={basic.phone}
                  onChange={(e) => setBasic({ ...basic, phone: e.target.value })}
                  placeholder="(11) 99999-9999"
                />
              </div>
              <div className="space-y-2">
                <Label>Empresa</Label>
                <Input
                  value={basic.company}
                  onChange={(e) => setBasic({ ...basic, company: e.target.value })}
                  placeholder="Empresa Ltda"
                />
              </div>
              <div className="space-y-2">
                <Label>Cargo</Label>
                <Input
                  value={basic.position}
                  onChange={(e) => setBasic({ ...basic, position: e.target.value })}
                  placeholder="Diretor de TI"
                />
              </div>
              <div className="space-y-2">
                <Label>Origem</Label>
                <Select
                  value={basic.source}
                  onValueChange={(v) => setBasic({ ...basic, source: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Site">Site</SelectItem>
                    <SelectItem value="Indicação">Indicação</SelectItem>
                    <SelectItem value="Google Ads">Google Ads</SelectItem>
                    <SelectItem value="Evento">Evento</SelectItem>
                    <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                    <SelectItem value="Outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Dores Imediatas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Pontos de Dor</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {PAIN_POINTS_OPTIONS.map((pt) => (
                    <div key={pt} className="flex items-center gap-2">
                      <Checkbox
                        id={`r-${pt}`}
                        checked={resumido.pain_points.includes(pt)}
                        onCheckedChange={() =>
                          setResumido({
                            ...resumido,
                            pain_points: togglePainPoint(resumido.pain_points, pt),
                          })
                        }
                      />
                      <Label htmlFor={`r-${pt}`} className="text-sm cursor-pointer">
                        {pt}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Necessidade Imediata</Label>
                <Textarea
                  value={resumido.immediate_need}
                  onChange={(e) => setResumido({ ...resumido, immediate_need: e.target.value })}
                  placeholder="Descreva a necessidade imediata do prospect..."
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>Orçamento</Label>
                <Select
                  value={resumido.budget}
                  onValueChange={(v) => setResumido({ ...resumido, budget: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {BUDGET_OPTIONS.map((b) => (
                      <SelectItem key={b} value={b}>
                        {b}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="completo" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Dados de Contato</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nome *</Label>
                <Input
                  value={basic.name}
                  onChange={(e) => setBasic({ ...basic, name: e.target.value })}
                  placeholder="João Silva"
                />
              </div>
              <div className="space-y-2">
                <Label>Email *</Label>
                <Input
                  type="email"
                  value={basic.email}
                  onChange={(e) => setBasic({ ...basic, email: e.target.value })}
                  placeholder="joao@empresa.com"
                />
              </div>
              <div className="space-y-2">
                <Label>Telefone</Label>
                <Input
                  value={basic.phone}
                  onChange={(e) => setBasic({ ...basic, phone: e.target.value })}
                  placeholder="(11) 99999-9999"
                />
              </div>
              <div className="space-y-2">
                <Label>Empresa</Label>
                <Input
                  value={basic.company}
                  onChange={(e) => setBasic({ ...basic, company: e.target.value })}
                  placeholder="Empresa Ltda"
                />
              </div>
              <div className="space-y-2">
                <Label>Cargo</Label>
                <Input
                  value={basic.position}
                  onChange={(e) => setBasic({ ...basic, position: e.target.value })}
                  placeholder="Diretor de TI"
                />
              </div>
              <div className="space-y-2">
                <Label>Origem</Label>
                <Select
                  value={basic.source}
                  onValueChange={(v) => setBasic({ ...basic, source: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Site">Site</SelectItem>
                    <SelectItem value="Indicação">Indicação</SelectItem>
                    <SelectItem value="Google Ads">Google Ads</SelectItem>
                    <SelectItem value="Evento">Evento</SelectItem>
                    <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                    <SelectItem value="Outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Infraestrutura & Segurança</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Número de Usuários</Label>
                  <Input
                    type="number"
                    value={completo.num_users}
                    onChange={(e) => setCompleto({ ...completo, num_users: e.target.value })}
                    placeholder="Ex: 25"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Provedor Atual</Label>
                  <Input
                    value={completo.current_provider}
                    onChange={(e) => setCompleto({ ...completo, current_provider: e.target.value })}
                    placeholder="Ex: Empresa X ou Nenhum"
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-6">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="has_backup"
                    checked={completo.has_backup}
                    onCheckedChange={(c) => setCompleto({ ...completo, has_backup: !!c })}
                  />
                  <Label htmlFor="has_backup" className="cursor-pointer">
                    Possui Backup
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="has_antivirus"
                    checked={completo.has_antivirus}
                    onCheckedChange={(c) => setCompleto({ ...completo, has_antivirus: !!c })}
                  />
                  <Label htmlFor="has_antivirus" className="cursor-pointer">
                    Possui Antivírus
                  </Label>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Notas de Infraestrutura</Label>
                <Textarea
                  value={completo.infrastructure_notes}
                  onChange={(e) =>
                    setCompleto({ ...completo, infrastructure_notes: e.target.value })
                  }
                  placeholder="Servidores, rede, cloud, etc."
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>Notas de Segurança</Label>
                <Textarea
                  value={completo.security_notes}
                  onChange={(e) => setCompleto({ ...completo, security_notes: e.target.value })}
                  placeholder="Firewall, MFA, políticas, etc."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Dores & Orçamento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Pontos de Dor</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {PAIN_POINTS_OPTIONS.map((pt) => (
                    <div key={pt} className="flex items-center gap-2">
                      <Checkbox
                        id={`c-${pt}`}
                        checked={completo.pain_points.includes(pt)}
                        onCheckedChange={() =>
                          setCompleto({
                            ...completo,
                            pain_points: togglePainPoint(completo.pain_points, pt),
                          })
                        }
                      />
                      <Label htmlFor={`c-${pt}`} className="text-sm cursor-pointer">
                        {pt}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Orçamento</Label>
                  <Select
                    value={completo.budget}
                    onValueChange={(v) => setCompleto({ ...completo, budget: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      {BUDGET_OPTIONS.map((b) => (
                        <SelectItem key={b} value={b}>
                          {b}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Prazo Desejado</Label>
                  <Select
                    value={completo.timeline}
                    onValueChange={(v) => setCompleto({ ...completo, timeline: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="imediato">Imediato</SelectItem>
                      <SelectItem value="30dias">30 dias</SelectItem>
                      <SelectItem value="60dias">60 dias</SelectItem>
                      <SelectItem value="90dias">90 dias</SelectItem>
                      <SelectItem value="sem_prazo">Sem prazo definido</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="bg-muted/30">
        <CardContent className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-primary" />
            <div>
              <p className="text-sm font-medium">Score Calculado (Preview)</p>
              <p className="text-xs text-muted-foreground">
                O score é calculado automaticamente com base nos dados do diagnóstico.
              </p>
            </div>
          </div>
          <span
            className={cn(
              'inline-flex items-center px-4 py-2 rounded-full text-lg font-bold',
              scoreInfo.color,
            )}
          >
            {previewScore} - {scoreInfo.label}
          </span>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={() => navigate(-1)}>
          Cancelar
        </Button>
        <Button onClick={handleSubmit} disabled={saving}>
          <Save className="w-4 h-4 mr-2" /> {saving ? 'Salvando...' : 'Salvar Diagnóstico'}
        </Button>
      </div>
    </div>
  )
}
