import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { HelpCircle, Map, BookOpen, FileDown } from 'lucide-react'
import { driver } from 'driver.js'
import 'driver.js/dist/driver.css'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { resolveScreenHelp, type TourStep } from '@/config/screenHelp'
import { downloadAuditDocx, AUDIT_DOCX_URL } from '@/lib/audit-docx-build'

const TOUR_SEEN_KEY = 'screen_tour_seen'

const wasTourSeen = (pathname: string) => {
  try {
    return localStorage.getItem(`${TOUR_SEEN_KEY}:${pathname}`) === '1'
  } catch {
    return false
  }
}

const markTourSeen = (pathname: string) => {
  try {
    localStorage.setItem(`${TOUR_SEEN_KEY}:${pathname}`, '1')
  } catch {
    // localStorage indisponível: apenas ignora
  }
}

export default function ScreenHelpMenu() {
  const location = useLocation()
  const [helpOpen, setHelpOpen] = useState(false)
  const [tourSeen, setTourSeen] = useState(() => wasTourSeen(location.pathname))

  const help = resolveScreenHelp(location.pathname)
  const tour: TourStep[] = help.tour ?? []

  const startTour = () => {
    const steps = tour
      .map((step) => {
        const el = document.querySelector(step.element)
        if (!el) return null
        return {
          element: el as HTMLElement,
          popover: { title: step.title, description: step.text },
        }
      })
      .filter((s): s is NonNullable<typeof s> => s !== null)

    if (steps.length === 0) {
      // Nenhum elemento-alvo presente nesta tela: avisa e não abre tour vazio.
      setHelpOpen(true)
      return
    }

    const driverObj = driver({
      showProgress: true,
      nextBtnText: 'Próximo',
      prevBtnText: 'Anterior',
      doneBtnText: 'Concluir',
      progressText: '{{current}} de {{total}}',
      steps,
      onDestroyed: () => {
        markTourSeen(location.pathname)
        setTourSeen(true)
      },
    })
    driverObj.drive()
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Ajuda"
            title="Ajuda"
            className="rounded-full h-8 w-8 shrink-0"
          >
            <HelpCircle className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onSelect={() => setHelpOpen(true)}>
            <BookOpen className="size-4" />
            Ajuda da tela
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={startTour}>
            <Map className="size-4" />
            Tour da tela
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <a
              href={AUDIT_DOCX_URL}
              download="prompts-auditoria-speedwork.docx"
              onClick={(e) => {
                // Sem o arquivo estático (gerado por script), gera o .docx em runtime.
                fetch(AUDIT_DOCX_URL, { method: 'HEAD' })
                  .then((res) => {
                    if (!res.ok) {
                      e.preventDefault()
                      downloadAuditDocx()
                    }
                  })
                  .catch(() => {
                    e.preventDefault()
                    downloadAuditDocx()
                  })
              }}
            >
              <FileDown className="size-4" />
              Documentação da auditoria (.docx)
            </a>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={helpOpen} onOpenChange={setHelpOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {help.title}
              {tour.length > 0 && (
                <Badge
                  variant="outline"
                  className={
                    tourSeen
                      ? 'text-muted-foreground border-muted-foreground/40'
                      : 'border-primary text-primary'
                  }
                >
                  {tourSeen ? 'Tour já visualizado' : 'Novo: tour disponível'}
                </Badge>
              )}
            </DialogTitle>
            <DialogDescription>{help.description}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <h4 className="text-sm font-semibold mb-2">O que se faz nesta tela</h4>
              <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                {help.actions.map((action, i) => (
                  <li key={i}>{action}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-2">Dicas</h4>
              <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                {help.tips.map((tip, i) => (
                  <li key={i}>{tip}</li>
                ))}
              </ul>
            </div>
            <div className="border-t pt-3">
              <a
                href={AUDIT_DOCX_URL}
                download="prompts-auditoria-speedwork.docx"
                onClick={(e) => {
                  // Sem o arquivo estático (gerado por script), gera o .docx em runtime.
                  fetch(AUDIT_DOCX_URL, { method: 'HEAD' })
                    .then((res) => {
                      if (!res.ok) {
                        e.preventDefault()
                        downloadAuditDocx()
                      }
                    })
                    .catch(() => {
                      e.preventDefault()
                      downloadAuditDocx()
                    })
                }}
                className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
              >
                <FileDown className="size-4" />
                Documentação da auditoria (.docx)
              </a>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
