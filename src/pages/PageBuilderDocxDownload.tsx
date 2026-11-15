// Rota /documentos/page-builder.docx — mesmo padrão da rota da auditoria
// (AuditDocxDownload): baixa o .docx com o serviço validado; só salva a
// resposta do fetch se for um arquivo Word real (não o HTML da SPA que o
// preview devolve com 200 para caminhos inexistentes); caso contrário, gera o
// documento em runtime com a biblioteca docx.
import { useEffect, useState } from 'react'
import {
  downloadPageBuilderDocx,
  PAGE_BUILDER_DOCX_FILENAME,
} from '@/lib/page-builder-docx-download'
import {
  buildPageBuilderDocxBlob,
  PAGE_BUILDER_DOCX_FILENAME as FILENAME,
} from '@/lib/page-builder-docx-build'
import { triggerDocxDownload } from '@/lib/docx-download'
import { Button } from '@/components/ui/button'
import { FileDown } from 'lucide-react'

export default function PageBuilderDocxDownload() {
  const [status, setStatus] = useState<'baixando' | 'erro'>('baixando')

  useEffect(() => {
    let cancelled = false

    downloadPageBuilderDocx().catch(() => {
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
            Preparando o download de {PAGE_BUILDER_DOCX_FILENAME}…
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
              buildPageBuilderDocxBlob()
                .then((blob) => triggerDocxDownload(blob, FILENAME))
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
