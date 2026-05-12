import { FormItem, FormLabel, FormDescription } from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Info } from 'lucide-react'

export function FooterSettingsTab({ form }: { form: any }) {
  const footerLinks = form.watch('footer_links') || { columns: 3 }
  const columnsCount = footerLinks.columns || 3

  const handleColumnsChange = (val: string) => {
    form.setValue('footer_links', { ...footerLinks, columns: parseInt(val) }, { shouldDirty: true })
  }

  return (
    <div className="space-y-6">
      <div className="bg-muted/30 p-4 sm:p-6 rounded-xl border border-border/50">
        <h3 className="text-lg font-semibold mb-4">Links Rápidos</h3>

        <div className="bg-primary/10 text-primary border border-primary/20 p-4 rounded-lg flex gap-3 mb-6">
          <Info className="h-5 w-5 shrink-0" />
          <div className="text-sm">
            <p className="font-medium mb-1">Organização Automática</p>
            <p>
              Os links exibidos no rodapé são automaticamente extraídos das{' '}
              <strong>Páginas Ativas</strong> do menu. Se você desativar uma página, o link sumirá
              automaticamente do atalho. Você só precisa definir abaixo em quantas colunas deseja
              que esses links sejam distribuídos.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormItem>
            <FormLabel>Número de Colunas para Links</FormLabel>
            <Select value={columnsCount.toString()} onValueChange={handleColumnsChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 Coluna</SelectItem>
                <SelectItem value="2">2 Colunas</SelectItem>
                <SelectItem value="3">3 Colunas</SelectItem>
                <SelectItem value="4">4 Colunas</SelectItem>
              </SelectContent>
            </Select>
            <FormDescription>
              Ajuste como os links serão distribuídos visualmente no rodapé.
            </FormDescription>
          </FormItem>
        </div>
      </div>
    </div>
  )
}
