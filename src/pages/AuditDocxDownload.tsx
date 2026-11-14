// Rota /documentos/prompts-auditoria-speedwork.docx
// Baixa o .docx da auditoria com o mesmo serviço validado do menu "?": só salva
// a resposta do fetch se for um arquivo Word real (não o HTML da SPA que o
// preview devolve com 200 para caminhos inexistentes); caso contrário, gera o
// documento em runtime com a biblioteca docx.
import { useEffect, useState } from 'react'
import { downloadAuditDocx, AUDIT_DOCX_FILENAME } from '@/lib/audit-docx-download'
import { buildAuditDocxBlob } from '@/lib/audit-docx-build'
import { Button } from '@/components/ui/button'
import { FileDown } from 'lucide-react'

export default function AuditDocxDownload() {
  const [status, setStatus] = useState<'baixando' | 'erro'>('baixando')

  useEffect(() => {
    let cancelled = false

    downloadAuditDocx().catch(() => {
      if (!cancelled) setStatus('erro')
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
            Preparando o download de {AUDIT_DOCX_FILENAME}…
          </p>
          <p className="text-xs text-muted-foreground/70">
            Se o navegador bloquear o download automático, abra o link do menu de ajuda "?" em
            qualquer tela administrativa.
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
                  a.download = AUDIT_DOCX_FILENAME
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
