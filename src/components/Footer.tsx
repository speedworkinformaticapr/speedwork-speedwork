import { Link } from 'react-router-dom'
import { Instagram, Facebook, Youtube, Send, Dribbble } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { useTranslation } from '@/hooks/use-translation'
import { useSystemData } from '@/hooks/use-system-data'
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

    const parsedContent = content
      .replace(
        /{{company_name}}/g,
        systemData?.platform_name || systemData?.razao_social || 'FootgolfPR',
      )
      .replace(/{{company_email}}/g, systemData?.email || 'contato@footgolfpr.com.br')
      .replace(/{{company_cnpj}}/g, systemData?.cnpj || '00.000.000/0000-00')
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-2">
            <Link
              to="/"
              className="flex items-center gap-2 mb-4 opacity-90 hover:opacity-100 transition-opacity"
            >
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
            </Link>

            <p className="text-muted text-sm max-w-sm mb-4 leading-relaxed">
              {systemData?.slogan || t('footer.desc')}
            </p>

            <div className="space-y-1 mb-6 text-sm text-muted/80">
              {systemData?.show_cnpj && systemData?.cnpj && (
                <p className="font-mono text-xs">CNPJ: {systemData.cnpj}</p>
              )}
              {systemData?.address_street && (
                <p>
                  {systemData.address_street}, {systemData.address_number}
                  {systemData.address_complement && ` - ${systemData.address_complement}`}
                </p>
              )}
              {systemData?.address_city && (
                <p>
                  {systemData.address_city} - {systemData.address_state}
                </p>
              )}
              {(systemData?.phone || systemData?.mobile) && (
                <p className="mt-2 text-primary/80">Tel: {systemData.phone || systemData.mobile}</p>
              )}
              {systemData?.email && <p className="text-primary/80">E-mail: {systemData.email}</p>}
            </div>

            <div className="flex items-center gap-2 text-sm font-semibold text-primary/90 bg-white/5 inline-flex px-3 py-1.5 rounded-full">
              <span className="text-lg leading-none">🇧🇷</span> {t('footer.proudly')}
            </div>
          </div>

          <div>
            <h4 className="font-montserrat font-bold text-lg mb-4 text-white uppercase tracking-wider">
              {t('footer.quickLinks')}
            </h4>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/courses"
                  className="text-muted hover:text-primary transition-colors text-sm"
                >
                  {t('nav.courses')}
                </Link>
              </li>
              <li>
                <Link
                  to="/tournaments"
                  className="text-muted hover:text-primary transition-colors text-sm"
                >
                  {t('nav.tournaments')}
                </Link>
              </li>
              <li>
                <Link
                  to="/rules"
                  className="text-muted hover:text-primary transition-colors text-sm"
                >
                  {t('nav.rules')}
                </Link>
              </li>
              <li>
                <Link
                  to="/blog"
                  className="text-muted hover:text-primary transition-colors text-sm"
                >
                  {t('nav.blog')}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-montserrat font-bold text-lg mb-4 text-white uppercase tracking-wider">
              {t('footer.stayUpdated')}
            </h4>
            <form onSubmit={handleSubscribe} className="flex gap-2 mb-6">
              <Input
                type="email"
                placeholder={t('footer.emailPlaceholder')}
                required
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus-visible:ring-primary"
              />
              <Button
                type="submit"
                size="icon"
                className="bg-primary hover:bg-primary/90 text-primary-foreground shrink-0"
              >
                <Send className="w-4 h-4" />
              </Button>
            </form>
            <div className="flex gap-4">
              {systemData?.integrations?.instagram && (
                <a
                  href={systemData.integrations.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary hover:text-white transition-colors text-white/80"
                >
                  <Instagram className="w-5 h-5" />
                </a>
              )}
              {systemData?.integrations?.facebook && (
                <a
                  href={systemData.integrations.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary hover:text-white transition-colors text-white/80"
                >
                  <Facebook className="w-5 h-5" />
                </a>
              )}
              {systemData?.integrations?.youtube && (
                <a
                  href={systemData.integrations.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary hover:text-white transition-colors text-white/80"
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
                    className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary hover:text-white transition-colors text-white/80"
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                ))}
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
