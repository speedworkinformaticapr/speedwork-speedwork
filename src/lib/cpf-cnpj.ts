export function maskDocument(v: string): string {
  v = v.replace(/\D/g, '')
  if (v.length <= 11) {
    return v
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
  }
  return v
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2')
    .slice(0, 18)
}

export function maskPhone(v: string): string {
  v = v.replace(/\D/g, '')
  if (v.length <= 2) return `(${v}`
  if (v.length <= 7) return `(${v.slice(0, 2)}) ${v.slice(2)}`
  return `(${v.slice(0, 2)}) ${v.slice(2, 7)}-${v.slice(7, 11)}`
}

export function getDocumentType(value: string): 'cpf' | 'cnpj' | null {
  const clean = value.replace(/\D/g, '')
  if (clean.length === 11) return 'cpf'
  if (clean.length === 14) return 'cnpj'
  return null
}

export function validateCPF(cpf: string): boolean {
  const clean = cpf.replace(/\D/g, '')
  if (clean.length !== 11) return false
  if (/^(\d)\1{10}$/.test(clean)) return false
  let sum = 0
  for (let i = 0; i < 9; i++) sum += parseInt(clean[i]) * (10 - i)
  let r = (sum * 10) % 11
  if (r === 10) r = 0
  if (r !== parseInt(clean[9])) return false
  sum = 0
  for (let i = 0; i < 10; i++) sum += parseInt(clean[i]) * (11 - i)
  r = (sum * 10) % 11
  if (r === 10) r = 0
  return r === parseInt(clean[10])
}

export function validateCNPJ(cnpj: string): boolean {
  const clean = cnpj.replace(/\D/g, '')
  if (clean.length !== 14) return false
  if (/^(\d)\1{13}$/.test(clean)) return false
  const w1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
  const w2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
  let sum = 0
  for (let i = 0; i < 12; i++) sum += parseInt(clean[i]) * w1[i]
  let r = sum % 11
  const d1 = r < 2 ? 0 : 11 - r
  if (d1 !== parseInt(clean[12])) return false
  sum = 0
  for (let i = 0; i < 13; i++) sum += parseInt(clean[i]) * w2[i]
  r = sum % 11
  const d2 = r < 2 ? 0 : 11 - r
  return d2 === parseInt(clean[13])
}

export function validateCpfCnpj(value: string): boolean {
  const clean = value.replace(/\D/g, '')
  if (clean.length === 11) return validateCPF(clean)
  if (clean.length === 14) return validateCNPJ(clean)
  return false
}
