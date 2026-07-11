import type { SystemData } from '@/hooks/use-system-data'

export interface QuestionReportItem {
  id: string
  label: string
  field_type: string
  options: string[]
  is_required: boolean
  order_index: number
  service_title: string | null
}

const FIELD_LABELS: Record<string, string> = {
  text: 'Texto',
  textarea: 'Texto Longo',
  select: 'Seleção Única',
  multiselect: 'Múltipla Escolha',
  boolean: 'Sim/Não',
}

const formatOptions = (options: string[] | null | undefined, fieldType: string): string => {
  if (!options || options.length === 0) return '-'
  if (fieldType === 'boolean') return 'Sim / Não'
  return options.join('; ')
}

const escapeHtml = (text: string | null | undefined) => {
  if (!text) return ''
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

export function generateQuestionnaireReport(
  items: QuestionReportItem[],
  systemData: SystemData | null,
) {
  const printWindow = window.open('', '_blank')
  if (!printWindow) return

  const logoUrl = systemData?.logo_url || ''
  const razaoSocial = escapeHtml(systemData?.razao_social || systemData?.platform_name || 'Empresa')
  const genDate = new Date().toLocaleString('pt-BR')

  const rows = items
    .map((item, idx) => {
      const rowClass = idx % 2 === 0 ? '' : 'alt'
      return `
        <tr class="${rowClass}">
          <td class="col-num">${idx + 1}</td>
          <td class="col-title">${escapeHtml(item.label)}</td>
          <td class="col-service">${escapeHtml(item.service_title || '-')}</td>
          <td class="col-type"><span class="badge">${escapeHtml(FIELD_LABELS[item.field_type] || item.field_type)}</span></td>
          <td class="col-required">${item.is_required ? 'Sim' : 'Não'}</td>
          <td class="col-order">${item.order_index}</td>
          <td class="col-options">${escapeHtml(formatOptions(item.options, item.field_type))}</td>
        </tr>
      `
    })
    .join('')

  printWindow.document.write(`
    <!DOCTYPE html>
    <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <title>Relatório Geral de Questionários - ${razaoSocial}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: 'Segoe UI', Arial, sans-serif;
            color: #1a1a2e;
            padding: 40px;
            max-width: 1100px;
            margin: 0 auto;
          }
          .report-header {
            display: flex;
            align-items: center;
            gap: 20px;
            border-bottom: 3px solid #1B7D3A;
            padding-bottom: 20px;
            margin-bottom: 24px;
          }
          .report-header img {
            max-height: 70px;
            max-width: 200px;
            object-fit: contain;
          }
          .header-info { flex: 1; }
          .header-info h1 { font-size: 20px; color: #1B7D3A; margin-bottom: 4px; }
          .header-info p { font-size: 12px; color: #555; }
          .report-meta {
            background: #f8faf9;
            border-radius: 8px;
            padding: 12px 16px;
            margin-bottom: 24px;
            font-size: 12px;
            color: #555;
            display: flex;
            justify-content: space-between;
          }
          .report-meta strong { color: #1B7D3A; }
          .section-title {
            font-size: 15px;
            color: #1B7D3A;
            margin-bottom: 12px;
            padding-bottom: 6px;
            border-bottom: 1px solid #e0e0e0;
          }
          .summary-box {
            display: flex;
            gap: 16px;
            margin-bottom: 24px;
          }
          .summary-card {
            flex: 1;
            background: #f0f4f1;
            border: 1px solid #c7d6cc;
            border-radius: 8px;
            padding: 12px 16px;
            text-align: center;
          }
          .summary-card .label { font-size: 11px; color: #666; display: block; margin-bottom: 4px; }
          .summary-card .value { font-size: 22px; font-weight: 700; color: #1B7D3A; }
          table.records-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 11px;
          }
          .records-table th {
            background: #1B7D3A;
            color: #fff;
            padding: 10px 8px;
            text-align: left;
            font-weight: 600;
          }
          .records-table td {
            border: 1px solid #e0e0e0;
            padding: 8px;
            vertical-align: top;
          }
          .records-table tbody tr.alt { background: #f9faf9; }
          .col-num { width: 40px; text-align: center; }
          .col-title { min-width: 180px; }
          .col-service { min-width: 120px; }
          .col-type { width: 110px; }
          .col-required { width: 70px; text-align: center; }
          .col-order { width: 50px; text-align: center; }
          .col-options { min-width: 160px; }
          .badge {
            display: inline-block;
            background: #e8f0ec;
            color: #1B7D3A;
            padding: 2px 8px;
            border-radius: 4px;
            font-size: 10px;
            font-weight: 600;
          }
          .report-footer {
            margin-top: 32px;
            padding-top: 16px;
            border-top: 2px solid #1B7D3A;
            display: flex;
            justify-content: space-between;
            font-size: 10px;
            color: #888;
          }
          .actions { text-align: right; margin-bottom: 20px; }
          .btn {
            background: #1B7D3A;
            color: #fff;
            padding: 10px 20px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 14px;
          }
          @media print {
            body { padding: 20px; max-width: 100%; }
            .actions { display: none !important; }
            .report-header { page-break-after: avoid; }
            .records-table tr { page-break-inside: avoid; }
          }
          @page { margin: 1.5cm; }
        </style>
      </head>
      <body>
        <div class="actions">
          <button class="btn" onclick="window.print()">Imprimir / Salvar como PDF</button>
        </div>

        <div class="report-header">
          ${logoUrl ? `<img src="${escapeHtml(logoUrl)}" alt="Logo" />` : ''}
          <div class="header-info">
            <h1>${razaoSocial}</h1>
            <p><strong>Relatório Geral de Questionários</strong></p>
          </div>
        </div>

        <div class="report-meta">
          <span><strong>Total de Questões:</strong> ${items.length}</span>
          <span><strong>Gerado em:</strong> ${genDate}</span>
        </div>

        <div class="summary-box">
          <div class="summary-card">
            <span class="label">Total de Perguntas</span>
            <span class="value">${items.length}</span>
          </div>
          <div class="summary-card">
            <span class="label">Serviços Distintos</span>
            <span class="value">${new Set(items.map((i) => i.service_title).filter(Boolean)).size}</span>
          </div>
          <div class="summary-card">
            <span class="label">Obrigatórias</span>
            <span class="value">${items.filter((i) => i.is_required).length}</span>
          </div>
        </div>

        <h2 class="section-title">Detalhamento das Perguntas</h2>
        <table class="records-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Título</th>
              <th>Serviço</th>
              <th>Tipo</th>
              <th>Obrigatória</th>
              <th>Ordem</th>
              <th>Opções</th>
            </tr>
          </thead>
          <tbody>
            ${rows || '<tr><td colspan="7" style="text-align:center;color:#999;padding:20px;">Nenhuma pergunta encontrada.</td></tr>'}
          </tbody>
        </table>

        <div class="report-footer">
          <span>${razaoSocial}</span>
          <span>Gerado em ${genDate}</span>
        </div>

        <script>
          window.onload = () => {
            setTimeout(() => { window.print(); }, 600);
          }
        </script>
      </body>
    </html>
  `)
  printWindow.document.close()
}
