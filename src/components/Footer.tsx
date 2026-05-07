import { Link } from 'react-router-dom'
import { Instagram, Facebook, Youtube, Send, Dribbble } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { useTranslation } from '@/hooks/use-translation'
import { useSystemData } from '@/hooks/use-system-data'
import { useAuth } from '@/hooks/use-auth'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'

export function Footer() {
  const { toast } = useToast()
  const { t } = useTranslation()
  const { data: systemData } = useSystemData()
  const { user } = useAuth()

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    toast({
      title: 'Welcome to the club!',
      description: 'You have successfully subscribed to our newsletter.',
    })
  }

  const renderLegalModal = (title: string, content: string | undefined, defaultLink: string) => {
    if (!content) {
      return (
        <Link to={defaultLink} className="hover:text-white transition-colors">
          {title}
        </Link>
      )
    }

    const userName = user?.user_metadata?.name || user?.email || 'Usuário'
    const companyName = systemData?.platform_name || systemData?.razao_social || 'FootgolfPR'
    const companyEmail = systemData?.email || 'contato@footgolfpr.com.br'
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
        <DialogTrigger className="hover:text-white transition-colors text-left cursor-pointer">
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
    <footer className="bg-foreground text-background pt-16 pb-8 border-t-4 border-primary mt-auto">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          <div className="flex flex-col">
            <Link
              to="/"
              className="flex items-center gap-2 mb-6 opacity-90 hover:opacity-100 transition-opacity"
            >
              {systemData?.logo_url ? (
                <img src={systemData.logo_url} alt="Logo" className="w-auto h-12 object-contain" />
              ) : (
                <>
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white">
                    <Dribbble className="w-5 h-5" />
                  </div>
                  <span className="font-montserrat font-black text-2xl tracking-tighter text-white uppercase">
                    {systemData?.platform_name || systemData?.razao_social || (
                      <>
                        FOOTGOLF<span className="text-primary">PR</span>
                      </>
                    )}
                  </span>
                </>
              )}
            </Link>

            <p className="text-white font-medium text-base md:text-lg max-w-sm mb-6 leading-relaxed italic border-l-4 border-primary pl-4">
              "
              {systemData?.slogan ||
                'Eleve o seu jogo, viva a paixão pelo esporte. Junte-se à revolução!'}
              "
            </p>

            <div className="flex items-center gap-2 text-sm font-semibold text-primary/90 bg-white/5 inline-flex px-3 py-1.5 rounded-full w-fit mt-auto">
              <span className="text-lg leading-none">🇧🇷</span> {t('footer.proudly')}
            </div>
          </div>

          <div className="flex flex-col md:items-center">
            <div className="w-full md:w-auto">
              <h4 className="font-montserrat font-bold text-lg mb-6 text-white uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary"></span>
                {t('footer.quickLinks')}
              </h4>
              <ul className="space-y-4">
                <li>
                  <Link
                    to="/courses"
                    className="text-muted hover:text-primary transition-colors text-sm flex items-center gap-2"
                  >
                    <span className="hover:translate-x-1 transition-transform inline-block">
                      › {t('nav.courses')}
                    </span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/tournaments"
                    className="text-muted hover:text-primary transition-colors text-sm flex items-center gap-2"
                  >
                    <span className="hover:translate-x-1 transition-transform inline-block">
                      › {t('nav.tournaments')}
                    </span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/rules"
                    className="text-muted hover:text-primary transition-colors text-sm flex items-center gap-2"
                  >
                    <span className="hover:translate-x-1 transition-transform inline-block">
                      › {t('nav.rules')}
                    </span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/blog"
                    className="text-muted hover:text-primary transition-colors text-sm flex items-center gap-2"
                  >
                    <span className="hover:translate-x-1 transition-transform inline-block">
                      › {t('nav.blog')}
                    </span>
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col md:items-end">
            <div className="w-full md:w-auto">
              <h4 className="font-montserrat font-bold text-lg mb-6 text-white uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary"></span>
                {t('footer.stayUpdated')}
              </h4>
              <div className="flex gap-4 mb-8">
                {systemData?.integrations?.instagram && (
                  <a
                    href={systemData.integrations.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-primary hover:border-primary hover:-translate-y-1 transition-all text-white shadow-lg"
                  >
                    <Instagram className="w-5 h-5" />
                  </a>
                )}
                {systemData?.integrations?.facebook && (
                  <a
                    href={systemData.integrations.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-primary hover:border-primary hover:-translate-y-1 transition-all text-white shadow-lg"
                  >
                    <Facebook className="w-5 h-5" />
                  </a>
                )}
                {systemData?.integrations?.youtube && (
                  <a
                    href={systemData.integrations.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-primary hover:border-primary hover:-translate-y-1 transition-all text-white shadow-lg"
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
                      className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-primary hover:border-primary hover:-translate-y-1 transition-all text-white shadow-lg"
                    >
                      <Icon className="w-5 h-5" />
                    </a>
                  ))}
              </div>

              <div className="space-y-2 text-sm text-muted/80 text-left md:text-right">
                {systemData?.email && (
                  <p className="hover:text-white transition-colors">
                    <a href={`mailto:${systemData.email}`}>{systemData.email}</a>
                  </p>
                )}
                {(systemData?.phone || systemData?.mobile) && (
                  <p className="hover:text-white transition-colors">
                    <a href={`tel:${(systemData.phone || systemData.mobile)?.replace(/\D/g, '')}`}>
                      {systemData.phone || systemData.mobile}
                    </a>
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 py-6 flex flex-row flex-wrap justify-between items-center gap-x-4 gap-y-2 text-xs text-muted">
          <div className="flex-1 flex items-center whitespace-nowrap">
            <span>
              © {new Date().getFullYear()}{' '}
              {systemData?.platform_name || systemData?.razao_social || 'FootgolfPR'}. Todos os
              direitos reservados. {systemData?.cnpj && `CNPJ: ${systemData.cnpj}`}
            </span>
          </div>
          <div className="flex items-center font-medium whitespace-nowrap">
            Desenvolvido por:{' '}
            <a
              href="https://www.s4md.com.br"
              target="_blank"
              rel="noopener noreferrer"
              className="ml-1 text-white hover:text-primary transition-colors"
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
