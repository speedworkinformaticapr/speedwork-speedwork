// Valor monetário por extenso em reais (ex.: 100 → "cem reais"), usado no modelo
// de contrato V6 ("R$ 100,00 (cem reais)"). Cobre valores até 999.999.999,99.

const UNIDADES = [
  '',
  'um',
  'dois',
  'três',
  'quatro',
  'cinco',
  'seis',
  'sete',
  'oito',
  'nove',
  'dez',
  'onze',
  'doze',
  'treze',
  'quatorze',
  'quinze',
  'dezesseis',
  'dezessete',
  'dezoito',
  'dezenove',
]
const DEZENAS = [
  '',
  '',
  'vinte',
  'trinta',
  'quarenta',
  'cinquenta',
  'sessenta',
  'setenta',
  'oitenta',
  'noventa',
]
const CENTENAS = [
  '',
  'cento',
  'duzentos',
  'trezentos',
  'quatrocentos',
  'quinhentos',
  'seiscentos',
  'setecentos',
  'oitocentos',
  'novecentos',
]

function ate999(n: number): string {
  if (n === 0) return ''
  if (n === 100) return 'cem'
  const partes: string[] = []
  const c = Math.floor(n / 100)
  const r = n % 100
  if (c) partes.push(CENTENAS[c])
  if (r < 20) {
    if (r) partes.push(UNIDADES[r])
  } else {
    partes.push(DEZENAS[Math.floor(r / 10)])
    if (r % 10) partes.push(UNIDADES[r % 10])
  }
  return partes.join(' e ')
}

export function valorPorExtenso(valor: number | null | undefined): string {
  if (valor == null || Number.isNaN(valor)) return '[valor a definir]'
  const centavos = Math.round(valor * 100)
  const reais = Math.floor(centavos / 100)
  const cents = centavos % 100

  let texto = ''
  if (reais === 0) {
    texto = 'zero'
  } else {
    const milhoes = Math.floor(reais / 1_000_000)
    const milhares = Math.floor((reais % 1_000_000) / 1000)
    const resto = reais % 1000
    const blocos: string[] = []
    if (milhoes) blocos.push(milhoes === 1 ? 'um milhão' : `${ate999(milhoes)} milhões`)
    if (milhares) blocos.push(milhares === 1 ? 'mil' : `${ate999(milhares)} mil`)
    if (resto) blocos.push(resto < 100 && blocos.length ? `e ${ate999(resto)}` : ate999(resto))
    texto = blocos.join(' ')
    texto += reais === 1 ? ' real' : ' reais'
  }
  if (cents) texto += ` e ${ate999(cents)} ${cents === 1 ? 'centavo' : 'centavos'}`
  return texto
}
