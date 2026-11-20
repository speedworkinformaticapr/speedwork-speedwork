// Download validado do .docx de contratos/aditivos (mesmo padrão dos demais
// documentos do app): o documento é gerado em runtime pela biblioteca `docx`
// e o download passa sempre por isValidDocxBlob — nunca salvar HTML da SPA.
import { downloadValidatedDocx } from './docx-download'
import { buildContractDocxBlob } from './contract-docx'

export async function downloadContractDocx(
  titulo: string,
  conteudo: string,
  filename: string,
  rodapeAssinaturas = true,
): Promise<void> {
  await downloadValidatedDocx(`/documentos/${filename}`, filename, () =>
    buildContractDocxBlob(titulo, conteudo, rodapeAssinaturas),
  )
}
