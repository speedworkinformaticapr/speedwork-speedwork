import { useState, useEffect } from 'react'
import { useSystemData } from '@/hooks/use-system-data'
import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import { RichTextEditor } from '@/components/ui/rich-text-editor'

export default function LGPDSettings() {
  const { data, updateData } = useSystemData()
  const { user } = useAuth()
  const [terms, setTerms] = useState({
    lgpd: '',
    uso: '',
    cookies: '',
  })
  const [activeTab, setActiveTab] = useState('lgpd')

  useEffect(() => {
    if (data?.terms) setTerms(data.terms as any)
  }, [data])

  const handleChange = (key: string, value: string) => {
    setTerms((prev) => ({ ...prev, [key]: value }))
  }

  const { toast } = useToast()

  const handleSave = async () => {
    try {
      await updateData({ terms })
      toast({ title: 'Sucesso', description: 'Textos legais salvos com sucesso!' })
    } catch (err: any) {
      toast({
        title: 'Erro ao salvar',
        description: err.message || 'Ocorreu um erro ao atualizar os textos.',
        variant: 'destructive',
      })
    }
  }

  const downloadPDF = (title: string, content: string) => {
    const parsedContent = content
      .replace(/{{user_name}}/g, user?.user_metadata?.name || 'Visitante')
      .replace(/{{company_name}}/g, data?.razao_social || 'FootgolfPR')
      .replace(/{{company_email}}/g, data?.email || 'contato@footgolfpr.com.br')
      .replace(/{{company_cnpj}}/g, data?.cnpj || '00.000.000/0000-00')

    const win = window.open('', '_blank')
    if (win) {
      win.document.write(`
        <html>
          <head>
            <title>${title}</title>
            <style>body { font-family: sans-serif; padding: 40px; line-height: 1.6; color: #333; } h1,h2,h3 { color: #1a1a1a; } a { color: #1B7D3A; }</style>
          </head>
          <body>
            <h2>${title}</h2>
            <div>${parsedContent.replace(/\n/g, '<br>')}</div>
          </body>
        </html>
      `)
      win.document.close()
      setTimeout(() => win.print(), 500)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <Card>
        <CardContent className="pt-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="lgpd">Política de Privacidade</TabsTrigger>
              <TabsTrigger value="uso">Termos de Uso</TabsTrigger>
              <TabsTrigger value="cookies">Política de Cookies</TabsTrigger>
            </TabsList>

            {(['lgpd', 'uso', 'cookies'] as const).map((tab) => (
              <TabsContent key={tab} value={tab} className="space-y-4">
                <div className="flex justify-between items-center mb-4">
                  <div className="text-xs text-muted-foreground bg-muted/20 p-2 rounded-md border inline-block">
                    <strong>Variáveis dinâmicas:</strong> Use <code>{'{{company_name}}'}</code>,{' '}
                    <code>{'{{company_cnpj}}'}</code>, <code>{'{{company_email}}'}</code> ou{' '}
                    <code>{'{{user_name}}'}</code>.
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => downloadPDF(`Termo - ${tab.toUpperCase()}`, terms[tab])}
                  >
                    <Download className="w-4 h-4 mr-2" /> Pré-visualizar / PDF
                  </Button>
                </div>
                <RichTextEditor
                  className="min-h-[400px]"
                  value={terms[tab] || ''}
                  onChange={(v) => handleChange(tab, v)}
                  withAi
                  aiContext={`Documento legal: ${tab === 'lgpd' ? 'Política de Privacidade e Tratamento de Dados' : tab === 'uso' ? 'Termos de Uso do Sistema' : 'Política de Cookies'}`}
                />
              </TabsContent>
            ))}
          </Tabs>

          <div className="mt-6">
            <Button onClick={handleSave} className="w-full">
              Salvar Textos Legais
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
