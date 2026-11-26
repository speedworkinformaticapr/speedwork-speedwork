// Geração do .docx do contrato — página A4, margens de 2,5 cm, parágrafos
// justificados com respiro, títulos de cláusula em negrito, subalíneas
// (a), b), i.)) com recuo e cada anexo começando em página nova (PageBreak).
import {
  Document,
  Packer,
  Paragraph,
  AlignmentType,
  Header,
  Footer,
  PageNumber,
  TextRun,
  PageBreak,
} from 'docx'
import { run, h1, h2, FONT, PRIMARY, ACCENT, DARK, MUTED } from './docx-style'
import { CONTRATADA } from './contract-speedwork'
import { CONTRATO_V6_CORPO } from './contract-v6-corpo'
import { ANEXO_I_V6, ANEXO_II_V6, ANEXO_III_V6 } from './contract-v6-anexos'
import {
  pageProperties,
  ESPACO_APOS_PARAGRAFO,
  ESPACO_APOS_ITEM,
  RECUO_SUBALINEA,
  ehSubalinea,
  quebrarSubalineas,
  dividirLiderItem,
  ehTituloSecao,
  paragrafoDeRuns,
} from './contract-format'

export { CONTRATO_V6_CORPO, ANEXO_I_V6, ANEXO_II_V6, ANEXO_III_V6 }
