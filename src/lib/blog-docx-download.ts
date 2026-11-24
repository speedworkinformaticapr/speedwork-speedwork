// Download do .docx "Módulo Blog (Postagens)" via serviço validado
// (src/lib/docx-download.ts). Prefere o arquivo estático de public/documentos
// quando é um Word real; caso contrário gera em runtime com a lib docx.
import { BLOG_DOCX_URL, BLOG_DOCX_FILENAME, buildBlogDocxBlob } from './blog-docx-build'
import { downloadValidatedDocx } from './docx-download'

export { BLOG_DOCX_FILENAME }

export function downloadBlogDocx(): Promise<void> {
  return downloadValidatedDocx(BLOG_DOCX_URL, BLOG_DOCX_FILENAME, buildBlogDocxBlob)
}
