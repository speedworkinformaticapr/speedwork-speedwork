/** Tipos compartilhados entre as seções de campos do formulário de contrato. */

export interface ClientInfo {
  id: string
  nome: string
}

export interface Conta {
  id: string
  codigo_estrutural: string
  nome: string
}

export interface Sla {
  id: string
  name: string
}

export interface Servico {
  id: string
  title: string
  monthly_value: number | null
  semiannual_value: number | null
  annual_value: number | null
  avulso_value: number | null
}

export interface SignatarioNovo {
  profile_id: string
  role: string
}
