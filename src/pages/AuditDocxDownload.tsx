// Rota /documentos/prompts-auditoria-speedwork.docx
// Serve o arquivo estático de public/documentos quando existir (gerado por
// scripts/generate-docx.mjs); caso contrário, gera o .docx em runtime com a
// biblioteca docx e dispara o download.
import { useEffect, useState } from 'react'
import { AUDIT_DOCX_URL, buildAuditDocxBlob } from '@/lib/audit-docx-build'
import { Button } from '@/components/ui/button'
import { FileDown } from 'lucide-react'

export default function AuditDocxDownload() {
  const [status, setStatus] = useState<'baixando' | 'erro'>('baixando')

  useEffect(() => {
    let cancelled = false

    const trigger = (blob: Blob) => {
      if (cancelled) return
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'prompts-auditoria-speedwork.docx'
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    }

    fetch(AUDIT_DOCX_URL)
      .then((res) => (res.ok ? res.blob() : Promise.reject(new Error('404'))))
      .then(trigger)
      .catch(() => {
        buildAuditDocxBlob()
          .then(trigger)
          .catch(() => {
            if (!cancelled) setStatus('erro')
          })
      })

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 p-6 text-center">
      {status === 'baixando' ? (
        <>
          <FileDown className="size-8 text-primary" />
          <p className="text-sm text-muted-foreground">
            Preparando o download de prompts-auditoria-speedwork.docx…
          </p>
        </>
      ) : (
        <>
          <p className="text-sm text-destructive">
            Não foi possível gerar o documento automaticamente.
          </p>
          <Button
            onClick={() => {
              setStatus('baixando')
              buildAuditDocxBlob()
                .then((blob) => {
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = 'prompts-auditoria-speedwork.docx'
                  document.body.appendChild(a)
                  a.click()
                  a.remove()
                  URL.revokeObjectURL(url)
                })
                .catch(() => setStatus('erro'))
            }}
          >
            <FileDown className="size-4" />
            Tentar novamente
          </Button>
        </>
      )}
    </div>
  )
}
