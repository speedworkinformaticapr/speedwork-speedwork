import { UseFormReturn } from 'react-hook-form'
import { SystemDataFormData } from '../SystemDataSchema'
import { VisualIdentitySection } from './sections/VisualIdentitySection'
import { CompanyDataSection } from './sections/CompanyDataSection'
import { LayoutSettingsSection } from './sections/LayoutSettingsSection'

import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'

export function VisualIdentityTab({ form }: { form: UseFormReturn<SystemDataFormData> }) {
  const watchWhatsapp = form.watch('whatsapp_enabled')

  return (
    <div className="space-y-8 animate-fade-in">
      <VisualIdentitySection form={form} />
      <CompanyDataSection form={form} />
      <LayoutSettingsSection form={form} />

      <div className="space-y-4 pt-6 border-t">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Redes Sociais</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="instagram"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Instagram URL</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="facebook"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Facebook URL</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="youtube"
            render={({ field }) => (
              <FormItem>
                <FormLabel>YouTube URL</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>

      <div className="space-y-4 pt-6 border-t">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
          Acessibilidade e Chat
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="libras_enabled"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between rounded-lg border p-4 shadow-sm bg-background">
                <FormLabel>VLibras</FormLabel>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="accessibility_enabled"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between rounded-lg border p-4 shadow-sm bg-background">
                <FormLabel>Menu de Acessibilidade</FormLabel>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />
          <div className="rounded-lg border p-4 shadow-sm bg-background space-y-4 md:col-span-2">
            <FormField
              control={form.control}
              name="whatsapp_enabled"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between">
                  <FormLabel>Botão de WhatsApp</FormLabel>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
            {watchWhatsapp && (
              <FormField
                control={form.control}
                name="whatsapp_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número (apenas números com DDD)</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
