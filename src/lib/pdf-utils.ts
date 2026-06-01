export const generateFinancialRecordPDF = (master: any, charges: any[]) => {
  const printWindow = window.open('', '_blank')
  if (!printWindow) return

  const formattedTotal = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(master.total_amount || 0)

  let chargesHtml = ''
  if (charges && charges.length > 0) {
    chargesHtml = `
      <h3>Lançamentos (Parcelas)</h3>
      <table>
        <thead>
          <tr>
            <th>Vencimento</th>
            <th>Valor</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${charges
            .map(
              (c) => `
            <tr>
              <td>${new Date(c.due_date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</td>
              <td>${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(c.amount)}</td>
              <td><span class="status ${c.status}">${c.status}</span></td>
            </tr>
          `,
            )
            .join('')}
        </tbody>
      </table>
    `
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <title>Relatório Financeiro - ${master.description}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; color: #333; max-width: 800px; margin: 0 auto; }
          h1 { color: #1B7D3A; border-bottom: 2px solid #1B7D3A; padding-bottom: 10px; margin-bottom: 20px; }
          .info-box { background: #f9f9f9; padding: 20px; border-radius: 8px; margin-bottom: 30px; border: 1px solid #eee; }
          .info-row { margin-bottom: 10px; }
          .label { font-weight: bold; width: 120px; display: inline-block; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
          th { background-color: #f2f2f2; font-weight: bold; }
          .status { padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; text-transform: capitalize; }
          .status.pago, .status.recebido { background-color: #dcfce7; color: #166534; }
          .status.pendente { background-color: #fef9c3; color: #854d0e; }
          .status.atrasado { background-color: #fee2e2; color: #991b1b; }
          @media print {
            body { padding: 0; max-width: 100%; }
            .actions { display: none !important; }
          }
          .actions { text-align: right; margin-bottom: 20px; }
          .btn { background: #1B7D3A; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px; cursor: pointer; border: none; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="actions">
          <button class="btn" onclick="window.print()">Imprimir / Salvar como PDF</button>
        </div>
        <h1>Relatório Financeiro</h1>
        <div class="info-box">
          <div class="info-row"><span class="label">Cliente:</span> ${master.client_name || 'N/A'}</div>
          <div class="info-row"><span class="label">Descrição:</span> ${master.description || 'N/A'}</div>
          <div class="info-row"><span class="label">Tipo:</span> <span style="text-transform: capitalize;">${master.type || 'N/A'}</span></div>
          <div class="info-row"><span class="label">Status:</span> <span class="status ${master.status}">${master.status || 'N/A'}</span></div>
          <div class="info-row"><span class="label">Total:</span> <strong>${formattedTotal}</strong></div>
        </div>
        ${chargesHtml}
        <script>
          window.onload = () => {
            setTimeout(() => {
              window.print();
            }, 500);
          }
        </script>
      </body>
    </html>
  `)
  printWindow.document.close()
}

export const generateTermsPDF = (title: string, content: string) => {
  const printWindow = window.open('', '_blank')
  if (!printWindow) return

  printWindow.document.write(`
    <!DOCTYPE html>
    <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <title>${title}</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            padding: 40px; 
            line-height: 1.6; 
            color: #333; 
            max-width: 800px; 
            margin: 0 auto; 
          }
          h1 { 
            color: #1B7D3A; 
            border-bottom: 2px solid #1B7D3A; 
            padding-bottom: 10px; 
            margin-bottom: 30px; 
            text-align: center; 
          }
          .content { 
            white-space: pre-wrap; 
            text-align: justify; 
          }
          @media print {
            body { padding: 0; max-width: 100%; }
          }
        </style>
      </head>
      <body>
        <h1>${title}</h1>
        <div class="content">${content || 'Nenhum conteúdo definido para este termo.'}</div>
        <script>
          window.onload = () => {
            setTimeout(() => {
              window.print();
            }, 500);
          }
        </script>
      </body>
    </html>
  `)
  printWindow.document.close()
}
