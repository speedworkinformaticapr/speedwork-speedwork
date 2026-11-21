// Integração Autentique (contratos): GraphQL + helpers compartilhados pelas
// edge functions autentique-create-document e autentique-webhook.

export interface AutentiqueSignerInput {
  id?: string
  action?: 'SIGN' | 'AGREE'
  name?: string
  email?: string
  docs?: { number: string }[]
}

export interface AutentiqueMutationResult {
  data?: {
    createDocument?: {
      id: string
      publicId: string
      name: string
      signatures: {
        publicId?: string
        status?: string
        link?: { shortLink?: string }
      }[]
    }
  }
  errors?: { message: string }[]
}

const AUTENTIQUE_API_URL = 'https://api.autentique.com.br/v2/graphql'

export async function autentiqueGraphQL<T = AutentiqueMutationResult>(
  apiKey: string,
  query: string,
  variables: Record<string, unknown> = {},
): Promise<T> {
  const res = await fetch(AUTENTIQUE_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ query, variables }),
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Autentique HTTP ${res.status}: ${text.slice(0, 300)}`)
  }
  return (await res.json()) as T
}

/** Busca signatário existente na Autentique por CPF/CNPJ (evita duplicidade). */
export async function findSignerByDocument(
  apiKey: string,
  docNumber: string,
): Promise<{ id: string; name?: string } | null> {
  const number = cleanDoc(docNumber)
  if (!number) return null
  const res = await autentiqueGraphQL<{
    data?: { signers?: { nodes?: { id: string; name?: string }[] } }
    errors?: { message: string }[]
  }>(
    apiKey,
    `query ($where: SignerWhereInput) {
      signers(where: $where, limit: 1) {
        nodes { id name }
      }
    }`,
    { where: { docs: { number } } },
  )
  if (res.errors?.length) return null
  return res.data?.signers?.nodes?.[0] || null
}

export function cleanDoc(doc: string | null | undefined): string {
  return String(doc || '').replace(/\D/g, '')
}

/** Pega o ID do evento do webhook em qualquer formato de payload. */
export function extractEventId(payload: any): string | null {
  return payload?.event_id || payload?.eventId || payload?.id || payload?.webhook?.id || null
}

/** Tipos de evento que nos interessam: cada assinatura e a finalização. */
export const SIGNATURE_SIGNED_TYPES = ['SIGNATURE_SIGNED', 'DOCUMENT_SIGNED', 'SIGN_SIGNED']

export function isDocumentFinished(eventType: string): boolean {
  return eventType === 'DOCUMENT_FINISHED'
}
