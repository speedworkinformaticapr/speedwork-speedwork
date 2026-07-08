import type { SystemData } from '@/hooks/use-system-data'

interface ReportStats {
  receivablePrevisto: number
  receivableRealizado: number
  payablePrevisto: number
  payableRealizado: number
  saldoAtual: number
}

interface ReportParams {
  records: any[]
  stats: ReportStats
  systemData: SystemData | null
  dateRangeLabel: string
  typeLabel: string
  statusLabel: string
}

const formatBRL = (val: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0)

const formatDate = (d: string | null | undefined) => {
  if (!d) return '-'
  try {
    return new Date(d).toLocaleDateString('pt-BR', { timeZone: 'UTC' })
  } catch {
    return '-'
  }
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

function buildChartHtml(stats: ReportStats): string {
  const maxVal = Math.max(
    stats.receivableRealizado,
    stats.payableRealizado,
    stats.receivablePrevisto,
    stats.payablePrevisto,
    1,
  )
  const incomeHeight = Math.round((stats.receivableRealizado / maxVal) * 200)
  const expenseHeight = Math.round((stats.payableRealizado / maxVal) * 200)
  const incomePrevHeight = Math.round((stats.receivablePrevisto / maxVal) * 200)
  const expensePrevHeight = Math.round((stats.payablePrevisto / maxVal) * 200)

  return `
    <div class="chart-container">
      <h2 class="section-title">Resumo Financeiro do Período</h2>
      <div class="chart-wrapper">
        <div class="chart-bars">
          <div class="chart-group">
            <div class="bar-pair">
              <div class="bar bar-prev" style="height: ${incomePrevHeight}px;" title="Previsto: ${formatBRL(stats.receivablePrevisto)}">
                <span class="bar-label">${formatBRL(stats.receivablePrevisto)}</span>
              </div>
              <div class="bar bar-income" style="height: ${incomeHeight}px;" title="Realizado: ${formatBRL(stats.receivableRealizado)}">
                <span class="bar-label">${formatBRL(stats.receivableRealizado)}</span>
              </div>
            </div>
            <span class="bar-title">Entradas</span>
          </div>
          <div class="chart-group">
            <div class="bar-pair">
              <div class="bar bar-prev" style="height: ${expensePrevHeight}px;" title="Previsto: ${formatBRL(stats.payablePrevisto)}">
                <span class="bar-label">${formatBRL(stats.payablePrevisto)}</span>
              </div>
              <div class="bar bar-expense" style="height: ${expenseHeight}px;" title="Realizado: ${formatBRL(stats.payableRealizado)}">
                <span class="bar-label">${formatBRL(stats.payableRealizado)}</span>
              </div>
            </div>
            <span class="bar-title">Saídas</span>
          </div>
        </div>
        <div class="chart-legend">
          <div class="legend-item"><span class="legend-color legend-prev"></span> Previsto</div>
          <div class="legend-item"><span class="legend-color legend-income"></span> Realizado (Entradas)</div>
          <div class="legend-item"><span class="legend-color legend-expense"></span> Realizado (Saídas)</div>
        </div>
      </div>
      <div class="summary-cards">
        <div class="summary-card card-saldo">
          <span class="summary-label">Saldo Atual</span>
          <span class="summary-value ${stats.saldoAtual >= 0 ? 'positive' : 'negative'}">${formatBRL(stats.saldoAtual)}</span>
        </div>
      </div>
    </div>
  `
}

function buildRecordsTableHtml(records: any[]): string {
  const rows: string[] = []

  records.forEach((r) => {
    const charges = r.financial_charges || []
    if (charges.length > 0) {
      charges.forEach((c: any) => {
        const statusClass = (c.status || 'pendente').toLowerCase()
        rows.push(`
          <tr>
            <td>${formatDate(c.due_date)}</td>
            <td>${escapeHtml(r.description || '-')}</td>
            <td>${escapeHtml(r.client_name || '-')}</td>
            <td class="text-right">${formatBRL(Number(c.amount) || 0)}</td>
            <td><span class="status ${statusClass}">${escapeHtml(c.status || 'Pendente')}</span></td>
          </tr>
        `)
      })
    } else {
      const statusClass = (r.status || 'pendente').toLowerCase()
      rows.push(`
        <tr>
          <td>${formatDate(r.entry_date || r.created_at)}</td>
          <td>${escapeHtml(r.description || '-')}</td>
          <td>${escapeHtml(r.client_name || '-')}</td>
          <td class="text-right">${formatBRL(Number(r.total_amount) || 0)}</td>
          <td><span class="status ${statusClass}">${escapeHtml(r.status || 'Pendente')}</span></td>
        </tr>
      `)
    }
  })

  return `
    <h2 class="section-title">Detalhamento de Lançamentos</h2>
    <table class="records-table">
      <thead>
        <tr>
          <th>Vencimento</th>
          <th>Descrição</th>
          <th>Cliente / Parceiro</th>
          <th class="text-right">Valor</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        ${rows.join('') || '<tr><td colspan="5" class="empty">Nenhum registro encontrado para o período.</td></tr>'}
      </tbody>
    </table>
  `
}

export function generateCashFlowReport({
  records,
  stats,
  systemData,
  dateRangeLabel,
  typeLabel,
  statusLabel,
}: ReportParams) {
  const printWindow = window.open('', '_blank')
  if (!printWindow) return

  const logoUrl = systemData?.logo_url || ''
  const razaoSocial = escapeHtml(systemData?.razao_social || systemData?.platform_name || 'Empresa')
  const cnpj = escapeHtml(systemData?.cnpj || '')
  const phone = escapeHtml(systemData?.phone || '')
  const email = escapeHtml(systemData?.email || '')
  const genDate = new Date().toLocaleString('pt-BR')

  printWindow.document.write(`
    <!DOCTYPE html>
    <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <title>Relatório de Fluxo de Caixa - ${razaoSocial}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: 'Segoe UI', Arial, sans-serif;
            color: #1a1a2e;
            padding: 40px;
            max-width: 900px;
            margin: 0 auto;
          }
          .report-header {
            display: flex;
            align-items: center;
            gap: 20px;
            border-bottom: 3px solid #1B7D3A;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .report-header img {
            max-height: 70px;
            max-width: 200px;
            object-fit: contain;
          }
          .header-info { flex: 1; }
          .header-info h1 { font-size: 20px; color: #1B7D3A; margin-bottom: 4px; }
          .header-info p { font-size: 12px; color: #555; line-height: 1.5; }
          .report-meta {
            background: #f8faf9;
            border-radius: 8px;
            padding: 12px 16px;
            margin-bottom: 24px;
            font-size: 12px;
            color: #555;
          }
          .report-meta strong { color: #1B7D3A; }
          .section-title {
            font-size: 16px;
            color: #1B7D3A;
            margin-bottom: 16px;
            padding-bottom: 8px;
            border-bottom: 1px solid #e0e0e0;
          }
          .chart-container { margin-bottom: 30px; }
          .chart-wrapper { display: flex; flex-direction: column; align-items: center; gap: 16px; }
          .chart-bars {
            display: flex;
            gap: 60px;
            align-items: flex-end;
            height: 240px;
            padding: 20px;
            background: #fafafa;
            border-radius: 8px;
            border: 1px solid #e8e8e8;
          }
          .chart-group { display: flex; flex-direction: column; align-items: center; gap: 8px; }
          .bar-pair { display: flex; gap: 8px; align-items: flex-end; height: 200px; }
          .bar {
            width: 50px;
            border-radius: 6px 6px 0 0;
            display: flex;
            align-items: flex-start;
            justify-content: center;
            position: relative;
            transition: height 0.3s ease;
            min-height: 4px;
          }
          .bar-prev { background: #c7d6cc; }
          .bar-income { background: #1B7D3A; }
          .bar-expense { background: #c0392b; }
          .bar-label {
            font-size: 9px;
            color: #333;
            position: absolute;
            top: -18px;
            white-space: nowrap;
            font-weight: 600;
          }
          .bar-title { font-size: 13px; font-weight: 600; color: #444; }
          .chart-legend { display: flex; gap: 20px; flex-wrap: wrap; }
          .legend-item { display: flex; align-items: center; gap: 6px; font-size: 12px; color: #555; }
          .legend-color { width: 14px; height: 14px; border-radius: 3px; display: inline-block; }
          .legend-prev { background: #c7d6ccc; }
          .legend-income { background: #1B7D3A; }
          .legend-expense { background: #c0392b; }
          .summary-cards { display: flex; gap: 16px; margin-top: 16px; justify-content: center; }
          .summary-card {
            padding: 16px 32px;
            border-radius: 8px;
            text-align: center;
            min-width: 200px;
          }
          .card-saldo { background: #f0f4f1; border: 1px solid #c7d6cc; }
          .summary-label { display: block; font-size: 12px; color: #666; margin-bottom: 4px; }
          .summary-value { display: block; font-size: 22px; font-weight: 700; }
          .summary-value.positive { color: #1B7D3A; }
          .summary-value.negative { color: #c0392b; }
          .records-table {
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
          }
          .records-table tbody tr:nth-child(even) { background: #f9faf9; }
          .text-right { text-align: right; }
          .empty { text-align: center; color: #999; padding: 20px; }
          .status {
            padding: 3px 8px;
            border-radius: 4px;
            font-size: 10px;
            font-weight: 600;
            text-transform: capitalize;
            white-space: nowrap;
          }
          .status.pago, .status.recebido, .status.finalizado { background: #dcfce7; color: #166534; }
          .status.pendente, .status.a vencer { background: #fef9c3; color: #854d0e; }
          .status.atrasado { background: #fee2e2; color: #991b1b; }
          .status.parcial { background: #dbeafe; color: #1e40af; }
          .report-footer {
            margin-top: 40px;
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
            .chart-container { page-break-after: avoid; }
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
            ${cnpj ? `<p><strong>CNPJ:</strong> ${cnpj}</p>` : ''}
            ${phone || email ? `<p>${phone ? '📞 ' + phone : ''}${phone && email ? ' | ' : ''}${email ? '✉ ' + email : ''}</p>` : ''}
            <p><strong>Relatório de Fluxo de Caixa</strong></p>
          </div>
        </div>

        <div class="report-meta">
          <strong>Período:</strong> ${escapeHtml(dateRangeLabel)} &nbsp;|&nbsp;
          <strong>Tipo:</strong> ${escapeHtml(typeLabel)} &nbsp;|&nbsp;
          <strong>Status:</strong> ${escapeHtml(statusLabel)} &nbsp;|&nbsp;
          <strong>Gerado em:</strong> ${genDate}
        </div>

        ${buildChartHtml(stats)}

        ${buildRecordsTableHtml(records)}

        <div class="report-footer">
          <span>${razaoSocial}${cnpj ? ' — CNPJ: ' + cnpj : ''}</span>
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
