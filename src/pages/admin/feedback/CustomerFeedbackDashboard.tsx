import { useEffect, useState, useCallback } from 'react'
import { TrendingUp, Smile, Zap, Trash2, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { ChartContainer, ChartConfig } from '@/components/ui/chart'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useToast } from '@/hooks/use-toast'
import {
  getFeedback,
  createFeedback,
  deleteFeedback,
  calculateNPS,
  calculateCSAT,
  calculateCES,
  type CustomerFeedback,
  type FeedbackType,
} from '@/services/customer-feedback'

const chartConfig = {
  count: { label: 'Respostas', color: 'hsl(var(--primary))' },
} satisfies ChartConfig

export default function CustomerFeedbackDashboard() {
  const { toast } = useToast()
  const [feedback, setFeedback] = useState<CustomerFeedback[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ type: 'NPS' as FeedbackType, score: 10, comments: '' })

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getFeedback()
      setFeedback(data)
    } catch {
      toast({ title: 'Erro', description: 'Falha ao carregar feedbacks', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    load()
  }, [load])

  const npsScores = feedback.filter((f) => f.type === 'NPS').map((f) => f.score)
  const csatScores = feedback.filter((f) => f.type === 'CSAT').map((f) => f.score)
  const cesScores = feedback.filter((f) => f.type === 'CES').map((f) => f.score)
  const nps = calculateNPS(npsScores)
  const csat = calculateCSAT(csatScores)
  const ces = calculateCES(cesScores)

  const chartData = [
    { label: 'Promotores', count: nps.promoters },
    { label: 'Neutros', count: nps.passives },
    { label: 'Detratores', count: nps.detractors },
  ]

  const handleSubmit = async () => {
    try {
      await createFeedback({ type: form.type, score: Number(form.score), comments: form.comments })
      toast({ title: 'Feedback registrado' })
      setForm({ type: 'NPS', score: 10, comments: '' })
      load()
    } catch (e: any) {
      toast({ title: 'Erro', description: e.message, variant: 'destructive' })
    }
  }

  const handleDelete = async (id: string) => {
    await deleteFeedback(id)
    load()
  }

  const scoreRange = form.type === 'NPS' ? 11 : form.type === 'CSAT' ? 5 : 5

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold">Satisação do Cliente</h1>
        <p className="text-muted-foreground">Métricas de NPS, CSAT e CES</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">NPS</CardTitle>
            <TrendingUp className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{nps.score}</div>
            <p className="text-xs text-muted-foreground mt-1">{npsScores.length} respostas</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">CSAT</CardTitle>
            <Smile className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{csat}%</div>
            <p className="text-xs text-muted-foreground mt-1">{csatScores.length} respostas</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">CES</CardTitle>
            <Zap className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{ces}</div>
            <p className="text-xs text-muted-foreground mt-1">{cesScores.length} respostas</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Distribuição NPS</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={12} />
                  <YAxis tickLine={false} axisLine={false} fontSize={12} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={4} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Novo Feedback</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Select
                value={form.type}
                onValueChange={(v) =>
                  setForm({ ...form, type: v as FeedbackType, score: v === 'NPS' ? 10 : 5 })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NPS">NPS (0-10)</SelectItem>
                  <SelectItem value="CSAT">CSAT (1-5)</SelectItem>
                  <SelectItem value="CES">CES (1-5)</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={String(form.score)}
                onValueChange={(v) => setForm({ ...form, score: Number(v) })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: scoreRange }, (_, i) => (
                    <SelectItem key={i} value={String(form.type === 'NPS' ? i : i + 1)}>
                      {form.type === 'NPS' ? i : i + 1}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Textarea
              placeholder="Comentários (opcional)"
              value={form.comments}
              onChange={(e) => setForm({ ...form, comments: e.target.value })}
              className="min-h-[80px]"
            />
            <Button onClick={handleSubmit} className="w-full">
              <Plus className="size-4 mr-2" /> Registrar Feedback
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Feedbacks Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground text-center py-4">Carregando...</p>
          ) : feedback.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nenhum feedback registrado.
            </p>
          ) : (
            <div className="space-y-2">
              {feedback.slice(0, 20).map((f) => (
                <div key={f.id} className="flex items-center justify-between border rounded-lg p-3">
                  <div className="flex items-center gap-3">
                    <Badge
                      variant={
                        f.type === 'NPS' ? 'default' : f.type === 'CSAT' ? 'secondary' : 'outline'
                      }
                    >
                      {f.type}
                    </Badge>
                    <span className="font-semibold">{f.score}</span>
                    <span className="text-sm text-muted-foreground truncate max-w-[300px]">
                      {f.comments || '—'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {new Date(f.created_at).toLocaleDateString('pt-BR')}
                    </span>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(f.id)}>
                      <Trash2 className="size-3.5 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
