/**
 * ContratoGuiasFields — campos do formulário de contrato extraídos em
 * componentes de seção, para serem renderizados tanto nas guias do
 * AdminContratoForm quanto nas seções compactas/colapsáveis abaixo da área do
 * contrato, quando o usuário está na aba "Contratos e Aditivos".
 *
 * Nenhum handler, payload, geração V6 ou fluxo de status é alterado aqui:
 * cada seção recebe setState puro do formulário e as listas já carregadas.
 */
import { formatCurrencyInput } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus } from 'lucide-react'
import type { ClientInfo, Conta, Servico } from './contrato-form-types'

export type FormState = {
  cliente_id: string
  conta_id: string
  data_inicio: string
  data_fim: string
  duracao_ciclo: string
  renovacao_automatica: boolean
  [key: string]: unknown
}

export interface SectionBase {
  update: (patch: Record<string, unknown>) => void
}

/* ── Guia Cliente ─────────────────────────────────────────────────────────── */

export function ClienteSectionFields({
  form,
  update,
  clientes,
  onAddCliente,
}: SectionBase & {
  form: FormState
  clientes: ClientInfo[]
  onAddCliente: () => void
}) {
  return (
    <div className="space-y-4">
      <fieldset className="space-y-4">
        <legend className="text-sm font-medium mb-2">Contratante</legend>
        <div className="space-y-2">
          <Label htmlFor="contrato-cliente">Cliente *</Label>
          <div className="flex gap-2">
            <Select value={form.cliente_id} onValueChange={(v) => update({ cliente_id: v })}>
              <SelectTrigger id="contrato-cliente" className="flex-1">
                <SelectValue placeholder="Selecione o cliente" />
              </SelectTrigger>
              <SelectContent>
                {clientes.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="Adicionar novo cliente"
              onClick={onAddCliente}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </fieldset>
      <p className="text-xs text-muted-foreground">
        O conteúdo do documento é gerado a partir do modelo V6 da Speedwork — os dados do
        representante da CONTRATANTE ficam na área de Signatários, junto da pessoa selecionada.
      </p>
    </div>
  )
}

/* ── Guia Faturamento ─────────────────────────────────────────────────────── */

export function FaturamentoSectionFields({
  form,
  update,
  totalServicos,
  descontoPercentual,
  setDescontoPercentual,
  setValorManual,
  planoContas,
  onAddConta,
}: SectionBase & {
  form: FormState & { valor_ciclo: number }
  totalServicos: number
  descontoPercentual: number
  setDescontoPercentual: (v: number) => void
  setValorManual: (v: boolean) => void
  planoContas: Conta[]
  onAddConta: () => void
}) {
  const brl = (v: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

  return (
    <div className="space-y-6">
      <fieldset className="space-y-4">
        <legend className="text-sm font-medium mb-2">Vigência e ciclo</legend>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="contrato-data-inicio">Data Início</Label>
            <Input
              id="contrato-data-inicio"
              type="date"
              value={form.data_inicio}
              onChange={(e) => update({ data_inicio: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contrato-data-fim">Data Fim</Label>
            <Input
              id="contrato-data-fim"
              type="date"
              value={form.data_fim || ''}
              onChange={(e) => update({ data_fim: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contrato-ciclo">Duração do Ciclo</Label>
            <Select
              value={form.duracao_ciclo}
              onValueChange={(v) => {
                setValorManual(false)
                update({ duracao_ciclo: v })
              }}
            >
              <SelectTrigger id="contrato-ciclo">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mensal">Mensal</SelectItem>
                <SelectItem value="trimestral">Trimestral</SelectItem>
                <SelectItem value="semestral">Semestral</SelectItem>
                <SelectItem value="anual">Anual</SelectItem>
                <SelectItem value="avulso">Avulso</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="text-sm font-medium mb-2">Valores</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="contrato-desconto">% Desconto Adicional</Label>
            <Input
              id="contrato-desconto"
              type="number"
              inputMode="decimal"
              min={0}
              max={100}
              step={0.5}
              value={descontoPercentual === 0 ? '' : descontoPercentual}
              placeholder="0"
              onChange={(e) => {
                const v = e.target.value === '' ? 0 : Number(e.target.value)
                setValorManual(false)
                setDescontoPercentual(Number.isNaN(v) ? 0 : v)
              }}
            />
            <p className="text-xs text-muted-foreground">
              Desconto aplicado sobre a soma dos serviços do ciclo.
            </p>
          </div>
          <div className="space-y-2">
            <Label>Valor do Contrato (por ciclo)</Label>
            <p className="text-2xl font-bold tabular-nums" aria-live="polite">
              {brl(Number(form.valor_ciclo ?? 0))}
            </p>
            <p className="text-xs text-muted-foreground">
              {descontoPercentual > 0
                ? `Total dos serviços (${formatCurrencyInput(totalServicos)}) − ${descontoPercentual}% de desconto`
                : 'Soma dos serviços selecionados para o ciclo.'}
            </p>
          </div>
        </div>
        <div className="rounded-lg border bg-muted/20 p-3 flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-xs font-medium text-muted-foreground">Total dos Serviços</p>
            <p className="text-sm font-semibold tabular-nums">{brl(totalServicos)}</p>
          </div>
          <p className="text-xs text-muted-foreground">
            Soma dos serviços selecionados conforme o ciclo. O valor do contrato (e das parcelas do
            financeiro) é essa soma menos o % de desconto adicional.
          </p>
        </div>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="text-sm font-medium mb-2">Renovação</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 max-w-md">
            <Label htmlFor="contrato-renovacao">Renovação automática</Label>
            <Select
              value={form.renovacao_automatica ? 'sim' : 'nao'}
              onValueChange={(v) => update({ renovacao_automatica: v === 'sim' })}
            >
              <SelectTrigger id="contrato-renovacao">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sim">Sim</SelectItem>
                <SelectItem value="nao">Não</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="text-sm font-medium mb-2">Financeiro</legend>
        <div className="space-y-2 max-w-md">
          <Label htmlFor="contrato-conta">Conta Financeira (DRE)</Label>
          <div className="flex gap-2">
            <Select value={form.conta_id || ''} onValueChange={(v) => update({ conta_id: v })}>
              <SelectTrigger id="contrato-conta" className="flex-1">
                <SelectValue placeholder="Selecione a conta" />
              </SelectTrigger>
              <SelectContent>
                {planoContas.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.codigo_estrutural} - {c.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="Adicionar nova conta financeira"
              onClick={onAddConta}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </fieldset>
    </div>
  )
}

/* ── Guia Serviços ────────────────────────────────────────────────────────── */

export function ServicosSectionFields({
  form,
  services,
  selectedServices,
  setSelectedServices,
  setValorManual,
  totalServicos,
}: {
  form: { duracao_ciclo: string }
  services: Servico[]
  selectedServices: string[]
  setSelectedServices: (v: string[]) => void
  setValorManual: (v: boolean) => void
  totalServicos: number
}) {
  const valorCampoPorCiclo = (svc: Servico, ciclo: string): number => {
    switch (ciclo) {
      case 'semestral':
        return Number(svc.semiannual_value ?? 0)
      case 'anual':
        return Number(svc.annual_value ?? 0)
      case 'avulso':
        return Number(svc.avulso_value ?? 0)
      default:
        return Number(svc.monthly_value ?? 0)
    }
  }

  return (
    <fieldset className="space-y-2">
      <legend className="text-sm font-medium mb-2">Serviços Vinculados</legend>
      <p className="text-sm text-muted-foreground">
        Selecione os serviços comerciais que fazem parte deste contrato. A ficha de limites do plano
        (Anexo I) vem do serviço selecionado. Os preços somados na guia Faturamento seguem o ciclo
        escolhido lá.
      </p>
      <div className="border rounded-md divide-y max-h-[300px] overflow-y-auto">
        {services.length === 0 ? (
          <p className="p-4 text-sm text-muted-foreground text-center">
            Nenhum serviço cadastrado. Cadastre serviços em Serviços (/admin/services).
          </p>
        ) : (
          services.map((svc) => (
            <label
              key={svc.id}
              className="flex items-center gap-3 p-3 hover:bg-muted/50 cursor-pointer transition-colors"
            >
              <input
                type="checkbox"
                checked={selectedServices.includes(svc.id)}
                onChange={(e) => {
                  setValorManual(false)
                  if (e.target.checked) {
                    setSelectedServices([...selectedServices, svc.id])
                  } else {
                    setSelectedServices(selectedServices.filter((s) => s !== svc.id))
                  }
                }}
                className="size-4 rounded border-border"
              />
              <div className="flex-1">
                <span className="font-medium text-sm">{svc.title}</span>
              </div>
              <span className="text-xs text-muted-foreground">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                }).format(valorCampoPorCiclo(svc, form.duracao_ciclo))}
                /{form.duracao_ciclo}
              </span>
            </label>
          ))
        )}
      </div>
      {selectedServices.length > 0 && (
        <p className="text-sm text-right tabular-nums">
          {selectedServices.length} serviço(s) · Total:{' '}
          <span className="font-semibold">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
              totalServicos,
            )}
          </span>{' '}
          <span className="text-xs text-muted-foreground">
            (ciclo {form.duracao_ciclo}, antes do desconto da guia Faturamento)
          </span>
        </p>
      )}
    </fieldset>
  )
}
