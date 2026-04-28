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
