import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { useSystemData } from '@/hooks/use-system-data'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Link } from 'react-router-dom'
import { Info } from 'lucide-react'

export function CookieConsent() {
  const [show, setShow] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const { data: systemData } = useSystemData()

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent')
    if (!consent && systemData?.integrations?.cookie_consent_enabled !== false) {
      setShow(true)
    }
  }, [systemData])

  if (!show) return null

  const handleAcceptAll = () => {
    localStorage.setItem('cookie-consent', 'all')
    setShow(false)
  }

  const handleSaveAdvanced = () => {
    localStorage.setItem('cookie-consent', 'custom')
    setShow(false)
    setShowAdvanced(false)
  }

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-[100] bg-background border-t p-4 shadow-2xl animate-in slide-in-from-bottom-full">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-start gap-4 flex-1">
            <div className="hidden sm:flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <Info className="h-5 w-5 text-primary" />
            </div>
            <div className="text-sm text-muted-foreground">
              <p className="font-semibold text-foreground mb-1">Privacidade e Cookies</p>
              Utilizamos cookies para melhorar sua experiência, personalizar anúncios e analisar
              nosso tráfego. Ao continuar navegando, você concorda com a nossa{' '}
              {systemData?.terms?.cookies ? (
                <a
                  href={systemData.terms.cookies}
                  target="_blank"
                  rel="noreferrer"
                  className="underline font-medium text-primary hover:text-primary/80 transition-colors"
                >
                  Política de Cookies
                </a>
              ) : (
                <Link
                  to="/cookies"
                  className="underline font-medium text-primary hover:text-primary/80 transition-colors"
                >
                  Política de Cookies
                </Link>
              )}
              .
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end shrink-0">
            <Button variant="outline" onClick={() => setShowAdvanced(true)}>
              Preferências Avançadas
            </Button>
            <Button onClick={handleAcceptAll}>Aceitar Todos</Button>
          </div>
        </div>
      </div>

      <Dialog open={showAdvanced} onOpenChange={setShowAdvanced}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Preferências de Cookies</DialogTitle>
            <DialogDescription>
              Gerencie como utilizamos os cookies no seu navegador.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="flex items-center justify-between space-x-2">
              <div className="flex flex-col space-y-1">
                <span className="font-medium text-sm text-foreground">Cookies Essenciais</span>
                <span className="text-xs text-muted-foreground">
                  Necessários para o funcionamento básico e segurança do site. Não podem ser
                  desativados.
                </span>
              </div>
              <Switch checked disabled />
            </div>

            <div className="flex items-center justify-between space-x-2">
              <div className="flex flex-col space-y-1">
                <span className="font-medium text-sm text-foreground">Cookies Analíticos</span>
                <span className="text-xs text-muted-foreground">
                  Ajudam a entender como os visitantes interagem com o site, coletando métricas
                  anônimas.
                </span>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between space-x-2">
              <div className="flex flex-col space-y-1">
                <span className="font-medium text-sm text-foreground">Cookies de Marketing</span>
                <span className="text-xs text-muted-foreground">
                  Utilizados para rastrear visitantes e fornecer anúncios mais relevantes.
                </span>
              </div>
              <Switch defaultChecked />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdvanced(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveAdvanced}>Salvar Preferências</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
