// Dados fixos da CONTRATADA (Speedwork), das testemunhas padrão e os prazos
// padrão do modelo de contrato V6. Centralizados aqui para que o gerador de
// contratos e os anexos usem a mesma fonte.

export const CONTRATADA = {
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

/** Valores fixos do modelo V6 que estavam entre colchetes no modelo de referência. */
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
}
