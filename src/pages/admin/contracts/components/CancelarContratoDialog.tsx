// Diálogo de cancelamento de contrato — gera o termo de cancelamento e o termo
// de responsabilidade pós-cancelamento e os envia à Autentique para assinatura
// (CONTRATADA → CONTRATANTE) via edge function autentique-create-document.
import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { criarDocumentoAutentique } from '@/services/autentique'
import {
  gerarTermoCancelamentoHTML,
  gerarTermoResponsabilidadeHTML,
  type ContratoCancelamento,
} from '@/lib/contract-cancelamento'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertTriangle, Loader2 } from 'lucide-react'

interface CancelarContratoDialogProps {
  contractId: string
  numeroContrato: string | null
  clienteNome: string | null
  motivoInicial?: string
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Chamado após os termos serem criados na Autentique com sucesso. */
  onCanceled?: () => void
}

export function CancelarContratoDialog({
  contractId,
  numeroContrato,
  clienteNome,
  motivoInicial = '',
  open,
  onOpenChange,
  onCanceled,
}: CancelarContratoDialogProps) {
  const { toast } = useToast()
  const [motivo, setMotivo] = useState(motivoInicial)
  const [enviando, setEnviando] = useState(false)

  const handleConfirmar = async () => {
    setEnviando(true)
    try {
      // Dados atuais do contrato + cliente para os termos.
      const { data: contrato, error: cErr } = await supabase
        .from('contratos')
        .select(
          'id, numero_contrato, data_inicio, valor_ciclo, profiles:cliente_id(name, cpf_cnpj)',
        )
        .eq('id', contractId)
        .single()
      if (cErr || !contrato) throw new Error('Contrato não encontrado')

      const cliente = (
        contrato as unknown as {
          profiles: { name?: string | null; cpf_cnpj?: string | null } | null
        }
      ).profiles

      const dados: ContratoCancelamento = {
        id: contractId,
        numero_contrato: contrato.numero_contrato || numeroContrato || '',
        cliente_nome: cliente?.name || clienteNome,
        cliente_cnpj: cliente?.cpf_cnpj || null,
        data_inicio: contrato.data_inicio || null,
        data_cancelamento: new Date().toISOString(),
        motivo_cancelamento: motivo || null,
        valor_ciclo: contrato.valor_ciclo ?? null,
      }

      // 1) Termo de cancelamento → Autentique
      await criarDocumentoAutentique(contractId, 'cancelamento', gerarTermoCancelamentoHTML(dados))
      // 2) Termo de responsabilidade pós-cancelamento → Autentique
      await criarDocumentoAutentique(
        contractId,
        'termo_responsabilidade',
        gerarTermoResponsabilidadeHTML(dados),
      )

      // 3) Marca o contrato como cancelado, com data e motivo.
      const { error: upErr } = await supabase
        .from('contratos')
        .update({
          status: 'cancelado',
          data_cancelamento: new Date().toISOString().split('T')[0],
          motivo_cancelamento: motivo || null,
        })
        .eq('id', contractId)
      if (upErr) throw upErr

      toast({
        title: 'Cancelamento enviado para assinatura',
        description:
          'O Termo de Cancelamento e o Termo de Responsabilidade foram criados na Autentique (CONTRATADA → CONTRATANTE).',
      })
      onOpenChange(false)
      onCanceled?.()
    } catch (e) {
      console.error('Erro no cancelamento:', e)
      toast({
        title: 'Erro no cancelamento',
        description: e instanceof Error ? e.message : 'Tente novamente.',
        variant: 'destructive',
      })
    } finally {
      setEnviando(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" /> Cancelar contrato{' '}
            {numeroContrato || ''}
          </DialogTitle>
          <DialogDescription>
            Esta ação envia o Termo de Cancelamento e o Termo de Responsabilidade Pós-Cancelamento
            para assinatura na Autentique (ordem CONTRATADA → CONTRATANTE) e marca o contrato como
            cancelado.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 py-2">
          <Label htmlFor="motivo-cancelamento">Motivo do cancelamento</Label>
          <Input
            id="motivo-cancelamento"
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            placeholder="Ex.: Encerramento por comum acordo"
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={enviando}>
            Voltar
          </Button>
          <Button variant="destructive" onClick={handleConfirmar} disabled={enviando}>
            {enviando ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Enviando...
              </>
            ) : (
              'Confirmar cancelamento'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
