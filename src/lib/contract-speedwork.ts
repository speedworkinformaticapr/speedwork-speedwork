// Dados da CONTRATADA (Speedwork), das testemunhas padrão e os prazos padrão
// do modelo de contrato V6. Os dados cadastrais da empresa NÃO são mais
// constantes: vêm da tabela system_data (carregarContratada). As constantes
// CONTRATADA/CONTRATO_PADROES permanecem exportadas como fallback para quando
// o banco não responde (mesma aparência do documento em telas offline).
import { supabase } from '@/lib/supabase/client'

export const CONTRATADA_FALLBACK = {
  razao: 'SPEEDWORK INFORMÁTICA LTDA',
  endereco: 'Rua Benedito Soares Pinto, nº 610, Centro, Campo Largo, PR',
  cnpj: '00.589.106/0001-72',
  representante: 'Iverson Antonio de Souza',
  cpf: '807.616.159-20',
  email: 'contato@speedworkinformatica.com',
  testemunhas: [
    { nome: 'Willian Figueiredo de Andrade', cpf: '330.660.318-02' },
    { nome: 'Renato Manfredini de Souza', cpf: '351.710.718-29' },
  ],
}

/** Linha de system_data com os campos usados no contrato. */
export interface ContratadaData {
  razao: string
  endereco: string
  cnpj: string
  representante: string
  cpf: string
  email: string
  testemunhas: { nome: string; cpf: string }[]
}

/**
 * Carrega os dados da CONTRATADA de system_data (razão social, CNPJ,
 * endereço montado, responsável/Iverson, e-mail e telefone). Cai para o
 * fallback quando o banco falha ou não tem razão social.
 */
export async function carregarContratada(): Promise<ContratadaData> {
  try {
    const { data } = await supabase.from('system_data').select('*').limit(1).maybeSingle()
    if (data?.razao_social) {
      const endereco = [
        data.address_street,
        data.address_number ? `nº ${data.address_number}` : '',
        data.address_complement,
        data.address_city,
        data.address_state,
      ]
        .filter(Boolean)
        .join(', ')
      return {
        razao: String(data.razao_social).toUpperCase(),
        endereco: endereco || CONTRATADA_FALLBACK.endereco,
        cnpj: data.cnpj || CONTRATADA_FALLBACK.cnpj,
        representante: data.responsible_name || CONTRATADA_FALLBACK.representante,
        cpf: data.responsible_cpf || CONTRATADA_FALLBACK.cpf,
        email: data.responsible_email || data.email || CONTRATADA_FALLBACK.email,
        testemunhas: CONTRATADA_FALLBACK.testemunhas,
      }
    }
  } catch {
    // fallback abaixo
  }
  return { ...CONTRATADA_FALLBACK, testemunhas: [...CONTRATADA_FALLBACK.testemunhas] }
}

/**
 * CONTRATADA síncrona (fallback do banco). Os geradores docx/print usam
 * carregarContratada(); quem precisa de valor imediato usa isto aqui.
 */
export const CONTRATADA: ContratadaData = CONTRATADA_FALLBACK

/** Valores padrão do modelo V6 (prazos/valores que não dependem do banco). */
export const CONTRATO_PADROES = {
  implantacao_dias: '15',
  treino_horas: '4',
  treino_participantes: '5',
  homologacao_dias: '10',
  manutencao_horas: '8',
  seguro_cibernetico: '50.000,00',
  rodadas_ajuste: '2',
  franquia_chamados: '10',
  sla_resposta_horas: '8',
  sla_resolucao_horas: '24',
  sla_resolucao_nao_critico_dias: '5',
}
