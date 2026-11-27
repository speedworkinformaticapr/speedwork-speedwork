/**
 * SignatariosSectionFields — campos da guia Signatários extraídos para
 * componente, reutilizado tanto na guia quanto na seção compacta abaixo da
 * área do contrato (AdminContratoForm, aba "Contratos e Aditivos").
 *
 * Nenhum handler, payload ou fluxo de status é alterado aqui: recebe setState
 * puro do formulário, as listas já carregadas e os handlers de add/remove.
 */
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { maskDocument } from '@/lib/cpf-cnpj'
import { Plus, Trash2 } from 'lucide-react'
import { SIGNER_ROLES, type SignerRow } from '@/lib/contract-signers'
import type { ClientInfo, SignatarioNovo } from './contrato-form-types'

export function SignatariosSectionFields({
  clientes,
  novoSig,
  setNovoSig,
  signatarios,
  addSignatario,
  removeSignatario,
  update,
  form,
  compacta = false,
}: {
  clientes: ClientInfo[]
  novoSig: SignatarioNovo
  setNovoSig: (v: SignatarioNovo) => void
  signatarios: SignerRow[]
  addSignatario: () => void
  removeSignatario: (pid: string) => void
  update: (patch: {
    cliente_representante_nome?: string
    cliente_representante_cpf?: string
    cliente_email_notificacao?: string
  }) => void
  form: {
    cliente_representante_nome?: string
    cliente_representante_cpf?: string
    cliente_email_notificacao?: string
  }
  compacta?: boolean
}) {
  const nomeSignatario = (s: SignerRow) =>
    s.profiles?.name || clientes.find((c) => c.id === s.profile_id)?.nome || '—'

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Signatários do Contrato</Label>
        {!compacta && (
          <p className="text-sm text-muted-foreground">
            Adicione quem assina o documento (CONTRATANTE, CONTRATADA, testemunhas). A ordem define
            a sequência de assinatura. Em contrato novo, o contrato é salvo na hora (status CRIADO)
            quando o primeiro signatário é adicionado.
          </p>
        )}
        <div className="flex gap-2 items-end">
          <div className="flex-1 space-y-1">
            <Label className="text-xs">Perfil</Label>
            <Select
              value={novoSig.profile_id}
              onValueChange={(v) => setNovoSig({ ...novoSig, profile_id: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o perfil" />
              </SelectTrigger>
              <SelectContent>
                {clientes.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="w-48 space-y-1">
            <Label className="text-xs">Papel</Label>
            <Select value={novoSig.role} onValueChange={(v) => setNovoSig({ ...novoSig, role: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SIGNER_ROLES.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button type="button" variant="outline" onClick={addSignatario}>
            <Plus className="w-4 h-4 mr-1" /> Adicionar
          </Button>
        </div>
        {novoSig.profile_id && (
          <div className="rounded-md border bg-muted/20 px-3 py-2 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground">
                Representa no contrato:
              </span>
              <Badge
                variant="outline"
                className={
                  novoSig.role === 'Contratante'
                    ? 'bg-blue-500/10 text-blue-600 border-blue-500/30'
                    : novoSig.role === 'Contratado'
                      ? 'bg-purple-500/10 text-purple-600 border-purple-500/30'
                      : ''
                }
              >
                {novoSig.role}
              </Badge>
            </div>
            {novoSig.role === 'Contratante' && (
              <div className="grid gap-2 sm:grid-cols-3">
                <div className="space-y-1">
                  <Label className="text-xs">Representante da CONTRATANTE</Label>
                  <Input
                    placeholder="Nome do representante legal"
                    autoComplete="off"
                    className="h-8 text-xs"
                    value={form.cliente_representante_nome || ''}
                    onChange={(e) => update({ cliente_representante_nome: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">CPF do representante</Label>
                  <Input
                    inputMode="numeric"
                    placeholder="000.000.000-00"
                    autoComplete="off"
                    className="h-8 text-xs"
                    value={form.cliente_representante_cpf || ''}
                    onChange={(e) =>
                      update({ cliente_representante_cpf: maskDocument(e.target.value) })
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">E-mail de notificação</Label>
                  <Input
                    type="email"
                    placeholder="notificacoes@cliente.com.br"
                    autoComplete="off"
                    className="h-8 text-xs"
                    value={form.cliente_email_notificacao || ''}
                    onChange={(e) => update({ cliente_email_notificacao: e.target.value })}
                  />
                </div>
              </div>
            )}
          </div>
        )}
        <div className="space-y-2 mt-2">
          {signatarios.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum signatário adicionado.</p>
          ) : (
            signatarios.map((s) => (
              <div
                key={s.profile_id}
                className="flex items-center justify-between gap-2 bg-muted/30 p-2 rounded-md"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-sm truncate">{nomeSignatario(s)}</p>
                    <Badge variant="outline">{s.role}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Ordem {(s.order_index ?? 0) + 1} ·{' '}
                    <Badge
                      variant="outline"
                      className={
                        s.status === 'Assinado' || s.status === 'signed'
                          ? 'bg-green-500/10 text-green-600 border-green-500/30'
                          : 'bg-amber-500/10 text-amber-600 border-amber-500/30'
                      }
                    >
                      {s.status === 'Assinado' || s.status === 'signed' ? 'Assinado' : 'Pendente'}
                    </Badge>
                  </p>
                </div>
                {s.status === 'Assinado' || s.status === 'signed' ? null : (
                  <button
                    type="button"
                    aria-label={`Remover signatário ${nomeSignatario(s)}`}
                    onClick={() => removeSignatario(s.profile_id)}
                    className="text-red-500 hover:text-red-700 p-1 shrink-0"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
