import { useEffect } from 'react'
import { useSystemData } from '@/hooks/use-system-data'
import { MessageCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

export function FloatingWidgets() {
  const { data: systemData } = useSystemData()

  useEffect(() => {
    if (systemData?.libras_enabled) {
      const scriptId = 'vlibras-script'
      let script = document.getElementById(scriptId) as HTMLScriptElement

      const initPlugin = () => {
        // @ts-expect-error
        if (window.VLibras && !document.querySelector('.vpw-controls')) {
          try {
            // @ts-expect-error
            new window.VLibras.Widget('https://vlibras.gov.br/app')
          } catch (e) {
            console.error('Erro ao inicializar VLibras:', e)
          }
        }
      }

      if (!script) {
        script = document.createElement('script')
        script.id = scriptId
        script.src = 'https://vlibras.gov.br/app/vlibras-plugin.js'
        script.async = true
        script.onload = initPlugin
        document.body.appendChild(script)
      } else {
        initPlugin()
      }
    }
  }, [systemData?.libras_enabled])

  const whatsappEnabled = systemData?.integrations?.whatsapp_enabled
  const whatsappNumber =
    systemData?.integrations?.whatsapp_number || systemData?.mobile?.replace(/\D/g, '') || ''

  return (
    <>
      {systemData?.libras_enabled && (
        <div vw="true" className="enabled">
          <div vw-access-button="true" className="active"></div>
          <div vw-plugin-wrapper="true">
            <div className="vw-plugin-top-wrapper"></div>
          </div>
        </div>
      )}

      {whatsappEnabled && whatsappNumber && (
        <a
          href={`https://wa.me/55${whatsappNumber}`}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            'fixed z-[60] bg-[#25D366] text-white p-4 rounded-full shadow-lg hover:bg-[#1ebc5a] hover:scale-110 transition-all duration-300 animate-in zoom-in flex items-center justify-center',
            'bottom-6 left-6',
          )}
          aria-label="Contato via WhatsApp"
        >
          <MessageCircle className="w-8 h-8" />
        </a>
      )}
    </>
  )
}
