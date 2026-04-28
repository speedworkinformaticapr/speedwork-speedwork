import { useState, useEffect } from 'react'
import { useSystemData } from '@/hooks/use-system-data'
import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import {
  Download,
  Bold,
  Italic,
  Underline,
  Link as LinkIcon,
  List,
  Heading1,
  Heading2,
} from 'lucide-react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

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

  const insertFormat = (tag: string) => {
    const el = document.getElementById(`textarea-${activeTab}`) as HTMLTextAreaElement
    if (!el) return
    const start = el.selectionStart
    const end = el.selectionEnd
    const text = terms[activeTab as keyof typeof terms]
    const selected = text.substring(start, end)
    let replacement = ''

    if (tag === 'link') {
      replacement = `<a href="URL_AQUI" target="_blank">${selected || 'texto do link'}</a>`
    } else if (tag === 'list') {
      replacement = `<ul>\n  <li>${selected || 'item'}</li>\n</ul>`
    } else if (tag.startsWith('h')) {
      replacement = `<${tag}>${selected || 'Título'}</${tag}>`
    } else {
      replacement = `<${tag}>${selected || 'texto'}</${tag}>`
    }

    const newText = text.substring(0, start) + replacement + text.substring(end)
    handleChange(activeTab, newText)

    setTimeout(() => {
      el.focus()
      el.setSelectionRange(start + tag.length + 2, start + tag.length + 2 + (selected.length || 5))
    }, 0)
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

  const FormatButton = ({ icon: Icon, tag, label }: { icon: any; tag: string; label: string }) => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={(e) => {
            e.preventDefault()
            insertFormat(tag)
          }}
        >
          <Icon className="h-4 w-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )

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
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-muted/30 p-3 rounded-md border">
                  <div className="flex gap-1 flex-wrap">
                    <FormatButton icon={Bold} tag="b" label="Negrito" />
                    <FormatButton icon={Italic} tag="i" label="Itálico" />
                    <FormatButton icon={Underline} tag="u" label="Sublinhado" />
                    <div className="w-px h-8 bg-border mx-1" />
                    <FormatButton icon={Heading1} tag="h2" label="Título Principal" />
                    <FormatButton icon={Heading2} tag="h3" label="Subtítulo" />
                    <div className="w-px h-8 bg-border mx-1" />
                    <FormatButton icon={List} tag="list" label="Lista" />
                    <FormatButton icon={LinkIcon} tag="link" label="Inserir Link" />
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => downloadPDF(`Termo - ${tab.toUpperCase()}`, terms[tab])}
                  >
                    <Download className="w-4 h-4 mr-2" /> Pré-visualizar / PDF
                  </Button>
                </div>
                <div className="text-xs text-muted-foreground bg-muted/20 p-2 rounded-md border">
                  <strong>Variáveis dinâmicas:</strong> Use <code>{'{{company_name}}'}</code>,{' '}
                  <code>{'{{company_cnpj}}'}</code>, <code>{'{{company_email}}'}</code> ou{' '}
                  <code>{'{{user_name}}'}</code> para preenchimento automático.
                </div>
                <Textarea
                  id={`textarea-${tab}`}
                  rows={18}
                  className="font-mono text-sm leading-relaxed"
                  placeholder="Escreva os termos aqui usando as opções de formatação acima ou HTML direto..."
                  value={terms[tab]}
                  onChange={(e) => handleChange(tab, e.target.value)}
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
