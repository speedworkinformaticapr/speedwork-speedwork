import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Instagram, Facebook, Youtube, Dribbble } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { useTranslation } from '@/hooks/use-translation'
import { useSystemData } from '@/hooks/use-system-data'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'

export function Footer() {
  const { toast } = useToast()
  const { t } = useTranslation()
  const { data: systemData } = useSystemData()
  const { user } = useAuth()
  const [pages, setPages] = useState<{ id: string; slug: string; title: string }[]>([])

  useEffect(() => {
    const fetchPages = async () => {
      const { data } = await supabase
        .from('pages')
        .select('id, slug, title')
        .eq('is_published', true)
        .order('display_order')
      if (data) setPages(data)
    }
    fetchPages()
  }, [])

  const renderLegalModal = (title: string, content: string | undefined, defaultLink: string) => {
    if (!content) {
      return (
        <Link to={defaultLink} className="hover:text-foreground transition-colors">
          {title}
        </Link>
      )
    }

    const userName = user?.user_metadata?.name || user?.email || 'Usuário'
    const companyName = systemData?.platform_name || systemData?.razao_social || 'Speedwork'
    const companyEmail = systemData?.email || 'contato@speedwork.com.br'
    const companyCnpj = systemData?.cnpj || '00.000.000/0000-00'
    const currentDate = new Date().toLocaleDateString('pt-BR')

    const parsedContent = content
      .replace(/{{company_name}}/gi, companyName)
      .replace(/{{empresa_nome}}/gi, companyName)
      .replace(/{{company_email}}/gi, companyEmail)
      .replace(/{{empresa_email}}/gi, companyEmail)
      .replace(/{{company_cnpj}}/gi, companyCnpj)
      .replace(/{{empresa_cnpj}}/gi, companyCnpj)
      .replace(/{{cliente_nome}}/gi, userName)
      .replace(/{{data_atual}}/gi, currentDate)
      .replace(/\n/g, '<br>')

    return (
      <Dialog>
        <DialogTrigger className="hover:text-foreground transition-colors text-left cursor-pointer">
          {title}
        </DialogTrigger>
        <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col bg-background text-foreground border-slate-700">
          <DialogHeader className="pb-2 border-b">
            <DialogTitle className="text-xl font-bold">{title}</DialogTitle>
          </DialogHeader>
          <ScrollArea className="flex-1 p-6 bg-muted/20 rounded-md border border-border/50 prose dark:prose-invert max-w-none">
            <div dangerouslySetInnerHTML={{ __html: parsedContent }} />
          </ScrollArea>
          <div className="flex justify-end pt-4 gap-2 border-t mt-auto">
            <Button
              variant="outline"
              onClick={() => {
                const win = window.open('', '_blank')
                if (win) {
                  win.document.write(
                    `<html><head><title>${title}</title><style>body{font-family:sans-serif;padding:40px;line-height:1.6;color:#333;} h1,h2,h3{color:#1a1a1a;} a{color:#1B7D3A;}</style></head><body><h2>${title}</h2>${parsedContent}</body></html>`,
                  )
                  win.document.close()
                  setTimeout(() => win.print(), 500)
                }
              }}
            >
              Baixar PDF
            </Button>
            <DialogClose asChild>
              <Button>Fechar</Button>
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <footer className="bg-card text-card-foreground pt-16 pb-8 border-t-4 border-primary mt-auto">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          <div className="flex flex-col">
            <Link
              to="/"
              className="flex items-center gap-3 mb-6 opacity-90 hover:opacity-100 transition-opacity"
            >
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground overflow-hidden shrink-0">
                {systemData?.browser_icon_url ? (
                  <img
                    src={systemData.browser_icon_url}
                    alt="Icon"
                    className="w-full h-full object-cover"
                    style={{
                      transform: `scale(${((systemData as any)?.footer_icon_size || 100) / 100})`,
                      transition: 'transform 0.2s ease-in-out',
                    }}
                  />
                ) : (
                  <Dribbble className="w-6 h-6" />
                )}
              </div>
              <span className="font-montserrat font-black text-xl md:text-2xl tracking-tighter text-foreground uppercase line-clamp-2">
                {systemData?.platform_name || systemData?.razao_social || <>SPEEDWORK</>}
              </span>
            </Link>

            {(systemData?.slogan || !systemData) && (
              <p className="text-foreground/90 font-medium text-base md:text-lg max-w-sm mb-4 leading-relaxed italic border-l-4 border-primary pl-4">
                "
                {systemData?.slogan ||
                  'Eleve o seu jogo, viva a paixão pelo esporte. Junte-se à revolução!'}
                "
              </p>
            )}

            {(systemData as any)?.short_description && (
              <p className="text-muted-foreground text-sm max-w-sm mb-6 leading-relaxed">
                {(systemData as any).short_description}
              </p>
            )}
          </div>
          <div className="flex flex-col md:items-center">
            <div className="w-full md:w-auto">
              <h4 className="font-montserrat font-bold text-lg mb-6 text-foreground uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary"></span>
                {t('footer.quickLinks')}
              </h4>
              <div
                className={cn('grid gap-x-8 gap-y-6', {
                  'grid-cols-1': (systemData?.footer_links?.columns || 3) === 1,
                  'grid-cols-1 sm:grid-cols-2': (systemData?.footer_links?.columns || 3) === 2,
                  'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3':
                    (systemData?.footer_links?.columns || 3) >= 3,
                })}
              >
                {Array.from({ length: systemData?.footer_links?.columns || 3 }).map((_, colIdx) => {
                  const colNumber = colIdx + 1
                  const columnsCount = systemData?.footer_links?.columns || 3

                  const activeLinks = [
                    ...pages.map((p) => ({
                      id: p.id,
                      title: p.title,
                      path: p.slug === 'inicio' || p.slug === 'home' ? '/' : `/${p.slug}`,
                    })),
                  ]

                  // Distribute links evenly across columns
                  const colLinks = activeLinks.filter(
                    (_, i) => (i % columnsCount) + 1 === colNumber,
                  )

                  if (colLinks.length === 0) return null

                  return (
                    <ul key={colNumber} className="flex flex-col gap-4">
                      {colLinks.map((link: any) => (
                        <li key={link.id}>
                          <Link
                            to={link.path}
                            className="text-muted-foreground hover:text-primary transition-colors text-sm flex items-center gap-2"
                          >
                            <span
                              className="hover:translate-x-1 transition-transform inline-block whitespace-nowrap truncate max-w-[150px]"
                              title={link.title}
                            >
                              › {link.title}
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )
                })}
              </div>
            </div>
          </div>

          <div className="flex flex-col md:items-end">
            <div className="w-full md:w-auto">
              <h4 className="font-montserrat font-bold text-lg mb-6 text-foreground uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary"></span>
                {t('footer.stayUpdated')}
              </h4>
              <div className="flex gap-4 mb-8">
                {systemData?.integrations?.instagram && (
                  <a
                    href={systemData.integrations.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 rounded-full bg-muted border border-border flex items-center justify-center hover:bg-primary hover:border-primary hover:-translate-y-1 transition-all text-foreground hover:text-primary-foreground shadow-sm"
                  >
                    <Instagram className="w-5 h-5" />
                  </a>
                )}
                {systemData?.integrations?.facebook && (
                  <a
                    href={systemData.integrations.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 rounded-full bg-muted border border-border flex items-center justify-center hover:bg-primary hover:border-primary hover:-translate-y-1 transition-all text-foreground hover:text-primary-foreground shadow-sm"
                  >
                    <Facebook className="w-5 h-5" />
                  </a>
                )}
                {systemData?.integrations?.youtube && (
                  <a
                    href={systemData.integrations.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 rounded-full bg-muted border border-border flex items-center justify-center hover:bg-primary hover:border-primary hover:-translate-y-1 transition-all text-foreground hover:text-primary-foreground shadow-sm"
                  >
                    <Youtube className="w-5 h-5" />
                  </a>
                )}
                {!systemData?.integrations?.instagram &&
                  !systemData?.integrations?.facebook &&
                  !systemData?.integrations?.youtube &&
                  [Instagram, Facebook, Youtube].map((Icon, i) => (
                    <a
                      key={i}
                      href="#"
                      className="w-12 h-12 rounded-full bg-muted border border-border flex items-center justify-center hover:bg-primary hover:border-primary hover:-translate-y-1 transition-all text-foreground hover:text-primary-foreground shadow-sm"
                    >
                      <Icon className="w-5 h-5" />
                    </a>
                  ))}
              </div>

              <div className="space-y-2 text-sm text-muted-foreground text-left md:text-right">
                {systemData?.email && (
                  <p className="hover:text-primary transition-colors">
                    <a href={`mailto:${systemData.email}`}>{systemData.email}</a>
                  </p>
                )}
                {(systemData?.phone || systemData?.mobile) && (
                  <p className="hover:text-primary transition-colors">
                    <a href={`tel:${(systemData.phone || systemData.mobile)?.replace(/\D/g, '')}`}>
                      {systemData.phone || systemData.mobile}
                    </a>
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-border py-6 flex flex-row flex-wrap justify-between items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
          <div className="flex-1 flex items-center whitespace-nowrap">
            <span>
              © {new Date().getFullYear()}{' '}
              {systemData?.platform_name || systemData?.razao_social || 'Speedwork'}. Todos os
              direitos reservados. {systemData?.cnpj && `CNPJ: ${systemData.cnpj}`}
            </span>
          </div>
          <div className="flex items-center font-medium whitespace-nowrap">
            Desenvolvido por:{' '}
            <a
              href="https://www.s4md.com.br"
              target="_blank"
              rel="noopener noreferrer"
              className="ml-1 text-foreground hover:text-primary transition-colors"
            >
              S4MD (www.s4md.com.br)
            </a>
          </div>
          <div className="flex gap-3 whitespace-nowrap justify-end flex-1 items-center">
            {renderLegalModal('Política de Privacidade', systemData?.terms?.lgpd, '/privacy')}
            <span>|</span>
            {renderLegalModal('Termos de Uso', systemData?.terms?.uso, '/terms')}
            <span>|</span>
            {renderLegalModal('Política de Cookies', systemData?.terms?.cookies, '/cookies')}
          </div>
        </div>
      </div>
    </footer>
  )
}
