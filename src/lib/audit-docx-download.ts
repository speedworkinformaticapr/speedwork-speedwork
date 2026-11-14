// Serviço único de download do .docx da auditoria (usado pela rota
// /documentos/prompts-auditoria-speedwork.docx e pelo link no menu "?").
//
// O servidor do preview responde 200 com o HTML da SPA para QUALQUER caminho
// inexistente — inclusive /documentos/*.docx — por isso a resposta do fetch é
// sempre validada antes de salvar: só é aceita se for um arquivo Word real
// (Content-Type wordprocessingml e/ou assinatura ZIP "PK"). Caso contrário, o
// documento é gerado em runtime com a biblioteca docx e baixado normalmente,
// nunca salvando HTML renomeado como .docx.
import { AUDIT_DOCX_URL, buildAuditDocxBlob } from './audit-docx-build'

export const AUDIT_DOCX_FILENAME = 'prompts-auditoria-speedwork.docx'

/** Um .docx é um arquivo ZIP: sempre começa com os bytes "PK\x03\x04". */
async function hasZipSignature(blob: Blob): Promise<boolean> {
  if (blob.size < 4) return false
  const head = new Uint8Array(await blob.slice(0, 4).arrayBuffer())
  return head[0] === 0x50 && head[1] === 0x4b // "PK"
}

/**
 * Valida que o blob é realmente um arquivo Word (.docx = ZIP OOXML) e não o
 * HTML da SPA devolvido com status 200 pelo servidor de preview.
 */
export async function isValidDocxBlob(blob: Blob): Promise<boolean> {
  if (blob.size < 4) return false

  const contentType = (blob.type || '').toLowerCase()
  if (contentType.includes('text/html')) return false

  const zipOk = await hasZipSignature(blob)
  if (zipOk) return true

  // Sem assinatura ZIP só aceita se o Content-Type for claramente OOXML/ZIP.
  return (
    contentType.includes('wordprocessingml') ||
    contentType === 'application/docx' ||
    contentType === 'application/zip' ||
    contentType === 'application/x-zip-compressed'
  )
}

function triggerDownload(blob: Blob, filename = AUDIT_DOCX_FILENAME): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

/**
 * Prefere o arquivo estático de public/documentos quando ele é um .docx real;
 * caso contrário (HTML da SPA, 404, rede) gera o documento em runtime com a
 * mesma biblioteca e conteúdo, e dispara o download.
 */
export async function downloadAuditDocx(): Promise<void> {
  let staticBlob: Blob | null = null
  try {
    const res = await fetch(AUDIT_DOCX_URL)
    if (res.ok) {
      const blob = await res.blob()
      if (await isValidDocxBlob(blob)) staticBlob = blob
    }
  } catch {
    // Falha de rede/404: cai para a geração em runtime.
  }

  const blob = staticBlob ?? (await buildAuditDocxBlob())
  triggerDownload(blob)
}
