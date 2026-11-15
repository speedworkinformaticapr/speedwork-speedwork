// Download do .docx "Page Builder — documentação" via serviço validado
// (src/lib/docx-download.ts). Prefere o arquivo estático de public/documentos
// quando é um Word real; caso contrário gera em runtime com a lib docx.
import {
  PAGE_BUILDER_DOCX_URL,
  PAGE_BUILDER_DOCX_FILENAME,
  buildPageBuilderDocxBlob,
} from './page-builder-docx-build'
import { downloadValidatedDocx } from './docx-download'

export { PAGE_BUILDER_DOCX_FILENAME }

export function downloadPageBuilderDocx(): Promise<void> {
  return downloadValidatedDocx(
    PAGE_BUILDER_DOCX_URL,
    PAGE_BUILDER_DOCX_FILENAME,
    buildPageBuilderDocxBlob,
  )
}
