// Fidelidade do documento no navegador e no PDF: o conteúdo de um contrato pode
// vir como texto puro (gerador V6, parágrafos separados por linha em branco,
// valores em **negrito**) ou como HTML do RichTextEditor. Em ambos os casos a
// exibição/impressão usa SEMPRE HTML — nunca injetar o texto cru em innerHTML.
import { contractTextoParaHtml } from './contract-docx'

export function contractConteudoParaHtml(conteudo: string): string {
  if (!conteudo) return ''
  const temTag = /<[a-z][\s\S]*>/i.test(conteudo)
  return temTag ? conteudo : contractTextoParaHtml(conteudo)
}

/**
 * Abre a janela de impressão do navegador com o conteúdo do contrato formatado
 * ("Salvar como PDF" é a saída do próprio diálogo de impressão). A fidelidade
 * do PDF pode variar levemente em relação ao .docx — comunicado na UI.
 */
export function imprimirContrato(titulo: string, conteudo: string): void {
  const janela = window.open('', '_blank', 'width=900,height=1000')
  if (!janela) {
    alert('Permita as janelas de pop-up do navegador para imprimir o contrato.')
    return
  }
  const corpo = contractConteudoParaHtml(conteudo)
  janela.document.write(`<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8" />
<title>${esc(titulo)}</title>
<style>
  @page { size: A4; margin: 2.5cm; }
  body { font-family: 'Segoe UI', Arial, sans-serif; color: #1F2937; font-size: 11pt; line-height: 1.5; }
  h1 { font-size: 14pt; text-align: center; margin: 0 0 16px; }
  p { margin: 0 0 10px; text-align: justify; }
  ul, ol { margin: 0 0 10px; padding-left: 28px; }
  li { margin-bottom: 4px; text-align: justify; }
  /* Padrão visual do .docx (contract-format): títulos com respiro e anexos em página nova. */
  .titulo-clausula, .titulo-secao { font-weight: bold; margin-top: 18px; }
  h2 { font-size: 12.5pt; font-weight: bold; margin: 20px 0 10px; }
  h2:first-of-type { page-break-before: avoid; }
  p[data-contract-section^="anexo:"]:not(:first-child) { page-break-before: always; }
  [data-page-break] { page-break-before: always; }
</style>
</head>
<body>
<h1>${esc(titulo)}</h1>
${corpo}
</body>
</html>`)
  janela.document.close()
  janela.focus()
  janela.onload = () => {
    janela.print()
  }
  // Impressão imediata: quando o onload não dispara (doc.write), imprime direto.
  setTimeout(() => {
    try {
      janela.print()
    } catch {
      /* janela fechada pelo usuário */
    }
  }, 250)
}

function esc(texto: string): string {
  return texto
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
