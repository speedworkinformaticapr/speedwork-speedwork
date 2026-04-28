import { useRef, useEffect } from 'react'
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { FileText } from 'lucide-react'
import { UseFormReturn } from 'react-hook-form'
import { SystemDataFormData } from '../SystemDataSchema'
import { generateTermsPDF } from '@/lib/pdf-utils'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

function RichTextEditor({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const editorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (editorRef.current && !editorRef.current.innerHTML && value) {
      editorRef.current.innerHTML = value
    }
  }, [])

  const handleCommand = (command: string, arg?: string) => {
    document.execCommand(command, false, arg)
    onChange(editorRef.current?.innerHTML || '')
  }

  return (
    <div className="border rounded-md overflow-hidden bg-background focus-within:ring-2 focus-within:ring-ring">
      <div className="flex flex-wrap items-center gap-1 border-b p-1 bg-muted/50">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => handleCommand('bold')}
          className="h-8 w-8 p-0 font-bold"
        >
          B
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => handleCommand('italic')}
          className="h-8 w-8 p-0 italic"
        >
          I
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => handleCommand('underline')}
          className="h-8 w-8 p-0 underline"
        >
          U
        </Button>
        <div className="w-px h-4 bg-border mx-1" />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => handleCommand('justifyLeft')}
          className="h-8 px-2 text-xs"
        >
          Esq
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => handleCommand('justifyCenter')}
          className="h-8 px-2 text-xs"
        >
          Centro
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => handleCommand('justifyRight')}
          className="h-8 px-2 text-xs"
        >
          Dir
        </Button>
        <div className="w-px h-4 bg-border mx-1" />
        <Select
          onValueChange={(val) => {
            editorRef.current?.focus()
            document.execCommand('insertText', false, val)
            onChange(editorRef.current?.innerHTML || '')
          }}
        >
          <SelectTrigger className="h-8 w-[160px] text-xs">
            <SelectValue placeholder="Inserir Variável" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="{{cliente_nome}}">Nome do Cliente</SelectItem>
            <SelectItem value="{{cliente_documento}}">Doc do Cliente</SelectItem>
            <SelectItem value="{{empresa_nome}}">Nome da Empresa</SelectItem>
            <SelectItem value="{{empresa_cnpj}}">CNPJ da Empresa</SelectItem>
            <SelectItem value="{{data_atual}}">Data Atual</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div
        ref={editorRef}
        contentEditable
        className="min-h-[200px] p-3 text-sm focus:outline-none prose dark:prose-invert max-w-none"
        onBlur={(e) => onChange(e.currentTarget.innerHTML)}
        onInput={(e) => onChange(e.currentTarget.innerHTML)}
      />
    </div>
  )
}

export function TermsTab({ form }: { form: UseFormReturn<SystemDataFormData> }) {
  return (
    <div className="space-y-8 animate-fade-in">
      <FormField
        control={form.control}
        name="cookie_consent_enabled"
        render={({ field }) => (
          <FormItem className="flex items-center justify-between rounded-lg border p-4 shadow-sm bg-background">
            <div className="space-y-0.5">
              <FormLabel>Banner de Consentimento de Cookies (LGPD)</FormLabel>
            </div>
            <FormControl>
              <Switch checked={field.value} onCheckedChange={field.onChange} />
            </FormControl>
          </FormItem>
        )}
      />

      <div className="space-y-6">
        <div className="rounded-lg border p-4 space-y-4 bg-background shadow-sm">
          <div className="flex items-center justify-between">
            <FormLabel className="text-base font-semibold">Termos de Uso</FormLabel>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                generateTermsPDF('Termos de Uso', form.getValues('term_content_uso') || '')
              }
            >
              <FileText className="h-4 w-4 mr-2" /> Gerar PDF
            </Button>
          </div>
          <FormField
            control={form.control}
            name="term_content_uso"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <RichTextEditor value={field.value || ''} onChange={field.onChange} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="rounded-lg border p-4 space-y-4 bg-background shadow-sm">
          <div className="flex items-center justify-between">
            <FormLabel className="text-base font-semibold">
              Política de Privacidade (LGPD)
            </FormLabel>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                generateTermsPDF(
                  'Política de Privacidade',
                  form.getValues('term_content_lgpd') || '',
                )
              }
            >
              <FileText className="h-4 w-4 mr-2" /> Gerar PDF
            </Button>
          </div>
          <FormField
            control={form.control}
            name="term_content_lgpd"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <RichTextEditor value={field.value || ''} onChange={field.onChange} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="rounded-lg border p-4 space-y-4 bg-background shadow-sm">
          <div className="flex items-center justify-between">
            <FormLabel className="text-base font-semibold">Política de Cookies</FormLabel>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                generateTermsPDF(
                  'Política de Cookies',
                  form.getValues('term_content_cookies') || '',
                )
              }
            >
              <FileText className="h-4 w-4 mr-2" /> Gerar PDF
            </Button>
          </div>
          <FormField
            control={form.control}
            name="term_content_cookies"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <RichTextEditor value={field.value || ''} onChange={field.onChange} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    </div>
  )
}
