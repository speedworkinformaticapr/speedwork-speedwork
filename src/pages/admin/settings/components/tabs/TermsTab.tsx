import { useRef, useEffect } from 'react'
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { FileText } from 'lucide-react'
import { UseFormReturn } from 'react-hook-form'
import { SystemDataFormData } from '../SystemDataSchema'
import { generateTermsPDF } from '@/lib/pdf-utils'
import { RichTextEditor } from '@/components/ui/rich-text-editor'

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
                  <RichTextEditor
                    value={field.value || ''}
                    onChange={field.onChange}
                    variables={[
                      { label: 'Nome do Cliente', value: '{{cliente_nome}}' },
                      { label: 'Doc do Cliente', value: '{{cliente_documento}}' },
                      { label: 'Nome da Empresa', value: '{{empresa_nome}}' },
                      { label: 'CNPJ da Empresa', value: '{{empresa_cnpj}}' },
                      { label: 'Data Atual', value: '{{data_atual}}' },
                    ]}
                  />
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
                  <RichTextEditor
                    value={field.value || ''}
                    onChange={field.onChange}
                    variables={[
                      { label: 'Nome do Cliente', value: '{{cliente_nome}}' },
                      { label: 'Doc do Cliente', value: '{{cliente_documento}}' },
                      { label: 'Nome da Empresa', value: '{{empresa_nome}}' },
                      { label: 'CNPJ da Empresa', value: '{{empresa_cnpj}}' },
                      { label: 'Data Atual', value: '{{data_atual}}' },
                    ]}
                  />
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
                  <RichTextEditor
                    value={field.value || ''}
                    onChange={field.onChange}
                    variables={[
                      { label: 'Nome do Cliente', value: '{{cliente_nome}}' },
                      { label: 'Doc do Cliente', value: '{{cliente_documento}}' },
                      { label: 'Nome da Empresa', value: '{{empresa_nome}}' },
                      { label: 'CNPJ da Empresa', value: '{{empresa_cnpj}}' },
                      { label: 'Data Atual', value: '{{data_atual}}' },
                    ]}
                  />
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
