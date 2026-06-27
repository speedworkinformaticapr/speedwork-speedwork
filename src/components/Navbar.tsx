import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  Menu,
  Dribbble,
  User as UserIcon,
  ShoppingCart,
  Package,
  ShieldAlert,
  ShieldCheck,
  Trophy,
  Medal,
  FileText,
  ShoppingBag,
  BookOpen,
  LogOut,
  LogIn,
  UserPlus,
  Phone,
  Mail,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/use-auth'
import { useTranslation } from '@/hooks/use-translation'
import { LanguageSwitcher } from './LanguageSwitcher'
import { useCartStore } from '@/stores/useCartStore'
import { useEffect, useState } from 'react'
import { useUserRole } from '@/hooks/use-user-role'
import { NotificationBell } from './NotificationBell'
import { supabase } from '@/lib/supabase/client'
import { useSystemData } from '@/hooks/use-system-data'
import { MapPin, Instagram, Facebook, Youtube } from 'lucide-react'

export function Navbar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, signOut } = useAuth()
  const { t } = useTranslation()
  const { items, fetchCart } = useCartStore()
  const { isAdmin, isClubAdmin } = useUserRole()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [dynamicLinks, setDynamicLinks] = useState<any[]>([])
  const [allPages, setAllPages] = useState<any[]>([])
  const { data: systemData } = useSystemData()

  useEffect(() => {
    const loadDynamicPages = async () => {
      const { data } = await supabase
        .from('pages' as any)
        .select('title, slug, display_order, is_published')
        .order('display_order', { ascending: true })

      if (data) {
        setAllPages(data)
        const published = data.filter((p: any) => p.is_published)

        const getIconForSlug = (slug: string) => {
          if (slug.includes('curso')) return BookOpen
          if (slug.includes('torneio')) return Trophy
          if (slug.includes('ranking')) return Medal
          if (slug.includes('regra')) return ShieldCheck
          return FileText
        }

        setDynamicLinks(
          published.map((p: any) => ({
            key: `page-${p.slug}`,
            label: p.title,
            path: p.slug === 'inicio' || p.slug === 'home' ? '/' : `/${p.slug}`,
            icon: getIconForSlug(p.slug),
            isDynamic: true,
            submenus: p.submenus || [],
          })),
        )
      }
    }
    loadDynamicPages()
  }, [])

  const isShopEnabled = !allPages.find((p) => p.slug === 'store' && p.is_published === false)

  const ALL_LINKS = [...dynamicLinks]

  useEffect(() => {
    if (user) {
      fetchCart(user.id)
    }
  }, [user, fetchCart])

  const cartCount = items.reduce((acc, item) => acc + item.quantity, 0)

  const handleLogout = async () => {
    await signOut()
    navigate('/')
  }

  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full flex flex-col transition-all duration-300',
        isScrolled ? 'bg-background shadow-md border-b' : 'bg-transparent border-transparent',
      )}
    >
      {systemData?.show_contact_bar && (
        <div
          className={cn(
            'bg-[#1B7D3A] text-white px-4 text-[11px] font-semibold tracking-wider w-full hidden md:block transition-all duration-300 origin-top overflow-hidden',
            isScrolled ? 'max-h-0 py-0 opacity-0' : 'max-h-[40px] py-1.5 opacity-100',
          )}
        >
          <div className="container mx-auto flex items-center justify-between opacity-90">
            <div className="flex items-center gap-6">
              {systemData.address_city && (
                <span className="flex items-center gap-1.5 hover:text-white/80 transition-colors">
                  <MapPin className="w-3 h-3" />
                  {systemData.address_street}
                  {systemData.address_number ? `, ${systemData.address_number}` : ''} -{' '}
                  {systemData.address_city}/{systemData.address_state}
                </span>
              )}
              {systemData.phone && (
                <a
                  href={`tel:${systemData.phone.replace(/\D/g, '')}`}
                  className="flex items-center gap-1.5 hover:text-white/80 transition-colors"
                >
                  <Phone className="w-3 h-3" />
                  {systemData.phone}
                </a>
              )}
            </div>
            <div className="flex items-center gap-4">
              {systemData?.integrations?.instagram && (
                <a
                  href={systemData.integrations.instagram}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white/80 transition-colors"
                >
                  <Instagram className="w-4 h-4" />
                </a>
              )}
              {systemData?.integrations?.facebook && (
                <a
                  href={systemData.integrations.facebook}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white/80 transition-colors"
                >
                  <Facebook className="w-4 h-4" />
                </a>
              )}
              {systemData?.integrations?.youtube && (
                <a
                  href={systemData.integrations.youtube}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white/80 transition-colors"
                >
                  <Youtube className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
        </div>
      )}
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          {systemData?.logo_url ? (
            <img
              src={systemData.logo_url}
              alt="Logo"
              style={{ height: `${(systemData.menu_logo_size || 100) * 0.4}px` }}
              className="w-auto object-contain transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <>
              <div className="w-10 h-10 rounded-full bg-[#1B7D3A] flex items-center justify-center text-white transition-transform duration-500 group-hover:rotate-12 shadow-lg shadow-[#1B7D3A]/20 shrink-0">
                <Dribbble className="w-6 h-6" />
              </div>
              <div className="flex flex-col justify-center">
                <span className="font-montserrat font-black text-xl md:text-2xl tracking-tight text-foreground leading-none uppercase">
                  {systemData?.platform_name || 'SPEEDWORK'}
                </span>
                {systemData?.razao_social && (
                  <span className="text-[9px] md:text-[10px] text-muted-foreground font-semibold tracking-widest mt-1 leading-none truncate max-w-[150px] md:max-w-[200px]">
                    {systemData.razao_social}
                  </span>
                )}
              </div>
            </>
          )}
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center justify-center flex-1 px-4 gap-1">
          {ALL_LINKS.map((link, index) => (
            <div key={`desktop-nav-${index}`} className="relative group">
              <Button
                asChild
                variant="ghost"
                className={cn(
                  'font-bold uppercase tracking-wider text-xs px-3 h-10 transition-colors',
                  location.pathname === link.path
                    ? 'bg-[#1B7D3A]/10 text-[#1B7D3A]'
                    : 'hover:bg-muted/80 text-foreground',
                )}
              >
                <Link to={link.path}>
                  <link.icon className="w-4 h-4 mr-2" />
                  {link.isDynamic ? link.label : link.key ? t(link.key) : link.label}
                </Link>
              </Button>
              {link.submenus && link.submenus.length > 0 && (
                <div className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-background border border-border/50 shadow-xl rounded-xl p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  {link.submenus.map((sub: any, i: number) =>
                    sub.url.startsWith('http') ? (
                      <a
                        key={`sub-${i}`}
                        href={sub.url}
                        target="_blank"
                        rel="noreferrer"
                        className="block px-3 py-2 text-sm font-medium text-muted-foreground hover:text-[#1B7D3A] hover:bg-[#1B7D3A]/5 rounded-md transition-colors"
                      >
                        {sub.label}
                      </a>
                    ) : sub.url.startsWith('#') || sub.url.startsWith('/#') ? (
                      <a
                        key={`sub-${i}`}
                        href={sub.url}
                        onClick={(e) => {
                          const hashIndex = sub.url.indexOf('#')
                          const id = sub.url.substring(hashIndex + 1)
                          if (id) {
                            const element = document.getElementById(id)
                            if (element) {
                              e.preventDefault()
                              element.scrollIntoView({ behavior: 'smooth' })
                              window.history.pushState(null, '', sub.url.substring(hashIndex))
                            }
                          }
                        }}
                        className="block px-3 py-2 text-sm font-medium text-muted-foreground hover:text-[#1B7D3A] hover:bg-[#1B7D3A]/5 rounded-md transition-colors"
                      >
                        {sub.label}
                      </a>
                    ) : (
                      <Link
                        key={`sub-${i}`}
                        to={sub.url}
                        className={cn(
                          'block px-3 py-2 text-sm font-medium rounded-md transition-colors',
                          location.pathname === sub.url
                            ? 'text-[#1B7D3A] bg-[#1B7D3A]/5'
                            : 'text-muted-foreground hover:text-[#1B7D3A] hover:bg-[#1B7D3A]/5',
                        )}
                      >
                        {sub.label}
                      </Link>
                    ),
                  )}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Desktop Right */}
        <div className="hidden lg:flex items-center gap-3 shrink-0">
          <LanguageSwitcher />
          {user ? (
            <div className="flex items-center gap-2 pl-2 border-l border-border/50">
              {isShopEnabled && (
                <Button
                  asChild
                  variant="ghost"
                  size="icon"
                  className="rounded-full relative hover:bg-[#0052CC]/10 hover:text-[#0052CC] transition-colors"
                >
                  <Link to="/cart">
                    <ShoppingCart className="w-5 h-5" />
                    {cartCount > 0 && (
                      <span className="absolute top-0 right-0 translate-x-1 -translate-y-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full shadow-sm animate-in zoom-in">
                        {cartCount}
                      </span>
                    )}
                  </Link>
                </Button>
              )}
              <NotificationBell />

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="rounded-full px-2 pl-3 h-10 gap-2 hover:bg-[#1B7D3A]/10 hover:text-[#1B7D3A] transition-colors group"
                  >
                    <span className="text-sm font-bold truncate max-w-[100px]">
                      {user.user_metadata?.name?.split(' ')[0] || 'Usuário'}
                    </span>
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-[#1B7D3A] group-hover:bg-[#1B7D3A] group-hover:text-white transition-colors">
                      <UserIcon className="w-3.5 h-3.5" />
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-64 mt-2 p-2 bg-white/95 dark:bg-background/95 backdrop-blur-md border-border/50 shadow-xl rounded-xl animate-in fade-in zoom-in-95 duration-200"
                >
                  <div className="flex items-center gap-3 p-3 mb-2 bg-muted/50 rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-[#1B7D3A]/10 flex items-center justify-center text-[#1B7D3A]">
                      <UserIcon className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col overflow-hidden">
                      <span className="font-bold text-sm truncate">
                        {user.user_metadata?.name || 'Usuário'}
                      </span>
                      <span className="text-xs text-muted-foreground truncate">{user.email}</span>
                    </div>
                  </div>
                  <DropdownMenuSeparator className="bg-border/50" />
                  <DropdownMenuItem asChild className="cursor-pointer rounded-md my-1 h-10">
                    <Link to="/profile" className="font-medium flex items-center">
                      <UserIcon className="w-4 h-4 mr-3 text-muted-foreground" /> Meu Perfil
                    </Link>
                  </DropdownMenuItem>
                  {isShopEnabled && (
                    <DropdownMenuItem asChild className="cursor-pointer rounded-md my-1 h-10">
                      <Link to="/orders" className="font-medium flex items-center">
                        <Package className="w-4 h-4 mr-3 text-muted-foreground" /> Meus Pedidos
                      </Link>
                    </DropdownMenuItem>
                  )}

                  {(isAdmin || isClubAdmin) && <DropdownMenuSeparator className="bg-border/50" />}

                  {isAdmin && (
                    <DropdownMenuItem
                      asChild
                      className="cursor-pointer rounded-md my-1 h-10 text-[#0052CC] focus:text-[#0052CC] focus:bg-[#0052CC]/10"
                    >
                      <Link to="/admin/dashboard" className="font-bold flex items-center">
                        <ShieldAlert className="w-4 h-4 mr-3" /> Painel Admin
                      </Link>
                    </DropdownMenuItem>
                  )}
                  {isClubAdmin && !isAdmin && (
                    <DropdownMenuItem
                      asChild
                      className="cursor-pointer rounded-md my-1 h-10 text-[#0052CC] focus:text-[#0052CC] focus:bg-[#0052CC]/10"
                    >
                      <Link to="/club/dashboard" className="font-bold flex items-center">
                        <ShieldCheck className="w-4 h-4 mr-3" /> Painel do Clube
                      </Link>
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuSeparator className="bg-border/50" />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="cursor-pointer rounded-md my-1 h-10 font-bold text-destructive focus:text-destructive focus:bg-destructive/10"
                  >
                    <LogOut className="w-4 h-4 mr-3" /> {t('nav.logout')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="flex items-center gap-2 pl-2 border-l border-border/50">
              <Button
                asChild
                variant="ghost"
                className="rounded-full font-bold uppercase tracking-widest px-6 hover:bg-[#1B7D3A]/10 hover:text-[#1B7D3A]"
              >
                <Link to="/login">{t('nav.login')}</Link>
              </Button>
            </div>
          )}
        </div>

        {/* Mobile Nav */}
        <div className="lg:hidden">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-muted/80">
                <Menu className="w-6 h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="w-[85vw] sm:w-[400px] p-0 flex flex-col border-r border-border/50 bg-background/95 backdrop-blur-xl [&>button]:hidden"
            >
              <SheetTitle className="sr-only">Navegação Mobile</SheetTitle>
              <SheetDescription className="sr-only">Menu de navegação</SheetDescription>
              <div className="p-6 border-b border-border/10 bg-muted/20 flex flex-col gap-6">
                <div className="flex items-center justify-between">
                  <Link
                    to="/"
                    className="flex items-center gap-3 group"
                    onClick={() => setMobileOpen(false)}
                  >
                    {systemData?.logo_url ? (
                      <img
                        src={systemData.logo_url}
                        alt="Logo"
                        style={{ height: `${(systemData.menu_logo_size || 100) * 0.32}px` }}
                        className="w-auto object-contain transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <>
                        <div className="w-8 h-8 rounded-xl bg-[#1B7D3A] flex items-center justify-center text-white shadow-lg shadow-[#1B7D3A]/20 shrink-0">
                          <Dribbble className="w-5 h-5" />
                        </div>
                        <div className="flex flex-col justify-center">
                          <span className="font-montserrat font-black text-lg tracking-tight text-foreground leading-none uppercase">
                            {systemData?.platform_name || 'SPEEDWORK'}
                          </span>
                          {systemData?.razao_social && (
                            <span className="text-[9px] text-muted-foreground font-semibold tracking-widest mt-1 leading-none truncate max-w-[140px]">
                              {systemData.razao_social}
                            </span>
                          )}
                        </div>
                      </>
                    )}
                  </Link>
                  <LanguageSwitcher />
                </div>

                {user && (
                  <div className="flex items-center gap-3 p-4 bg-white/50 dark:bg-black/20 rounded-2xl border border-border/50 shadow-sm backdrop-blur-sm">
                    <div className="w-12 h-12 rounded-full bg-[#1B7D3A]/10 flex items-center justify-center text-[#1B7D3A] shrink-0">
                      <UserIcon className="w-6 h-6" />
                    </div>
                    <div className="flex flex-col overflow-hidden">
                      <span className="font-bold text-base truncate">
                        {user.user_metadata?.name || 'Usuário'}
                      </span>
                      <span className="text-xs text-muted-foreground truncate">{user.email}</span>
                    </div>
                  </div>
                )}
              </div>

              <ScrollArea className="flex-1 px-4 py-6">
                <div className="flex flex-col gap-2">
                  {ALL_LINKS.map((link, index) => (
                    <div key={`${link.path}-${index}`} className="flex flex-col gap-1">
                      <Link
                        to={link.path}
                        onClick={() => setMobileOpen(false)}
                        className={cn(
                          'flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm font-bold uppercase tracking-wider transition-all',
                          location.pathname === link.path
                            ? 'bg-[#1B7D3A]/10 text-[#1B7D3A]'
                            : 'text-foreground hover:bg-muted/80 hover:translate-x-1',
                        )}
                      >
                        <link.icon
                          className={cn(
                            'w-5 h-5',
                            location.pathname === link.path
                              ? 'text-[#1B7D3A]'
                              : 'text-muted-foreground',
                          )}
                        />
                        {link.isDynamic ? link.label : link.key ? t(link.key) : link.label}
                      </Link>

                      {link.submenus && link.submenus.length > 0 && (
                        <div className="pl-12 flex flex-col gap-2 py-2 border-l-2 border-muted ml-6">
                          {link.submenus.map((sub: any, i: number) =>
                            sub.url.startsWith('http') ? (
                              <a
                                key={i}
                                href={sub.url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-sm font-medium text-muted-foreground hover:text-[#1B7D3A] transition-colors py-1"
                                onClick={() => setMobileOpen(false)}
                              >
                                {sub.label}
                              </a>
                            ) : sub.url.startsWith('#') || sub.url.startsWith('/#') ? (
                              <a
                                key={i}
                                href={sub.url}
                                onClick={(e) => {
                                  setMobileOpen(false)
                                  const hashIndex = sub.url.indexOf('#')
                                  const id = sub.url.substring(hashIndex + 1)
                                  if (id) {
                                    const element = document.getElementById(id)
                                    if (element) {
                                      e.preventDefault()
                                      element.scrollIntoView({ behavior: 'smooth' })
                                      window.history.pushState(
                                        null,
                                        '',
                                        sub.url.substring(hashIndex),
                                      )
                                    }
                                  }
                                }}
                                className="text-sm font-medium text-muted-foreground hover:text-[#1B7D3A] transition-colors py-1"
                              >
                                {sub.label}
                              </a>
                            ) : (
                              <Link
                                key={i}
                                to={sub.url}
                                className={cn(
                                  'text-sm font-medium transition-colors py-1',
                                  location.pathname === sub.url
                                    ? 'text-[#1B7D3A] font-bold'
                                    : 'text-muted-foreground hover:text-[#1B7D3A]',
                                )}
                                onClick={() => setMobileOpen(false)}
                              >
                                {sub.label}
                              </Link>
                            ),
                          )}
                        </div>
                      )}
                    </div>
                  ))}

                  {(isAdmin || isClubAdmin) && (
                    <div className="my-4 border-t border-border/50 pt-6 flex flex-col gap-2">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-4 mb-2">
                        Painéis de Gestão
                      </span>
                      {isClubAdmin && !isAdmin && (
                        <Link
                          to="/club/dashboard"
                          onClick={() => setMobileOpen(false)}
                          className={cn(
                            'flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm font-bold uppercase tracking-wider transition-all text-[#0052CC]',
                            location.pathname.startsWith('/club')
                              ? 'bg-[#0052CC]/10'
                              : 'hover:bg-[#0052CC]/5 hover:translate-x-1',
                          )}
                        >
                          <ShieldCheck className="w-5 h-5" />
                          Painel do Clube
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              </ScrollArea>

              <div className="p-4 border-t border-border/10 bg-muted/10 flex flex-col gap-3">
                {user ? (
                  <>
                    <div className="grid grid-cols-2 gap-2">
                      {isShopEnabled ? (
                        <Button
                          asChild
                          variant="outline"
                          className="rounded-xl font-bold uppercase tracking-widest h-12 relative overflow-hidden bg-background border-border/50 hover:bg-muted"
                        >
                          <Link to="/cart" onClick={() => setMobileOpen(false)}>
                            <ShoppingCart className="w-4 h-4 mr-2" />
                            Loja
                            {cartCount > 0 && (
                              <span className="absolute top-2 right-2 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full shadow-sm animate-in zoom-in">
                                {cartCount}
                              </span>
                            )}
                          </Link>
                        </Button>
                      ) : (
                        <div className="hidden"></div>
                      )}
                      <div className={cn('h-12', !isShopEnabled && 'col-span-2')}>
                        <NotificationBell mobile />
                      </div>
                    </div>
                    <Button
                      onClick={() => {
                        handleLogout()
                        setMobileOpen(false)
                      }}
                      variant="ghost"
                      className="rounded-xl font-bold uppercase tracking-widest text-destructive hover:bg-destructive/10 hover:text-destructive h-12"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      {t('nav.logout')}
                    </Button>
                  </>
                ) : (
                  <div className="grid grid-cols-1 gap-2">
                    <Button
                      asChild
                      variant="outline"
                      className="rounded-xl font-bold uppercase tracking-widest h-12 bg-background border-border/50"
                    >
                      <Link to="/login" onClick={() => setMobileOpen(false)}>
                        <LogIn className="w-4 h-4 mr-2" />
                        {t('nav.login')}
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
