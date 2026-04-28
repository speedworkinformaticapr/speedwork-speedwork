import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Menu, X, Globe, User, LogOut, FileText, ChevronDown, Check, UserCog } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { useAuth } from '@/hooks/use-auth'
import { useSystemData } from '@/hooks/use-system-data'
import { supabase } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [pages, setPages] = useState<any[]>([])
  const { user, profile, activeRole, roles, setActiveRole, signOut } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const { data: systemData } = useSystemData()

  useEffect(() => {
    const fetchPages = async () => {
      const { data } = await supabase
        .from('pages')
        .select('id, title, slug')
        .eq('is_published', true)
        .order('display_order', { ascending: true })

      if (data) {
        // Remove slugs que já possuem menus dedicados para evitar duplicidade
        setPages(data.filter((p) => p.slug !== 'services' && p.slug !== 'portal-de-servicos'))
      }
    }
    fetchPages()
  }, [])

  const handleLogout = async () => {
    await signOut()
    navigate('/')
  }

  const isAdmin = activeRole === 'admin'
  const isStaff = activeRole === 'staff' || isAdmin
  const isClient = activeRole === 'client' || isAdmin
  const isClub = activeRole === 'club' || isAdmin

  const getRoleName = (role: string) => {
    const names: Record<string, string> = {
      admin: 'Administrador',
      club: 'Clube',
      athlete: 'Atleta',
      client: 'Cliente',
      staff: 'Staff',
      user: 'Usuário',
    }
    return names[role] || role
  }

  const navLinks = [
    { title: 'Início', path: '/' },
    { title: 'Cursos', path: '/courses' },
    { title: 'Torneios', path: '/tournaments' },
    { title: 'Ranking', path: '/ranking' },
    { title: 'Regras', path: '/rules' },
    { title: 'Sobre', path: '/about' },
    { title: 'Contato', path: '/contact' },
    { title: 'Loja', path: '/store' },
    { title: 'Galeria', path: '/gallery' },
    { title: 'Blog', path: '/blog' },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          {systemData?.logo_url ? (
            <img
              src={systemData.logo_url}
              alt={systemData?.platform_name || 'Logo'}
              className="h-10 object-contain"
            />
          ) : (
            <span className="text-xl font-bold text-primary uppercase">
              {systemData?.platform_name || 'FOOTGOLF PR'}
            </span>
          )}
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={cn(
                'text-sm font-medium uppercase transition-colors hover:text-primary',
                location.pathname === link.path ? 'text-primary' : 'text-muted-foreground',
              )}
            >
              {link.title}
            </Link>
          ))}

          {pages.map((page) => (
            <Link
              key={page.slug}
              to={`/${page.slug}`}
              className={cn(
                'text-sm font-medium uppercase transition-colors hover:text-primary flex items-center gap-1',
                location.pathname === `/${page.slug}` ? 'text-primary' : 'text-muted-foreground',
              )}
            >
              <FileText className="h-4 w-4" />
              <span>{page.title}</span>
            </Link>
          ))}

          {/* Portal de Serviços Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger
              className={cn(
                'text-sm font-bold uppercase transition-colors hover:text-primary flex items-center gap-1 outline-none',
                location.pathname.includes('/services') ||
                  location.pathname.includes('appointments') ||
                  location.pathname.includes('quotes')
                  ? 'text-primary'
                  : 'text-muted-foreground',
              )}
            >
              Portal de Serviços <ChevronDown className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {/* Opção ligada à página customizada no CMS */}
              <DropdownMenuItem asChild>
                <Link to="/services" className="w-full font-bold">
                  Página do Portal
                </Link>
              </DropdownMenuItem>

              {isAdmin && (
                <>
                  <DropdownMenuItem asChild>
                    <Link to="/admin/quotes" className="w-full">
                      Orçamentos (Admin)
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/admin/appointments" className="w-full">
                      Agendamentos (Admin)
                    </Link>
                  </DropdownMenuItem>
                </>
              )}

              {isStaff && (
                <DropdownMenuItem asChild>
                  <Link to="/staff/dashboard" className="w-full">
                    Dashboard Staff
                  </Link>
                </DropdownMenuItem>
              )}

              {isClient && (
                <>
                  <DropdownMenuItem asChild>
                    <Link to="/client/quotes" className="w-full">
                      Meus Orçamentos
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/client/dashboard" className="w-full">
                      Meus Agendamentos
                    </Link>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>

        <div className="hidden lg:flex items-center gap-4">
          <Globe className="h-5 w-5 text-muted-foreground cursor-pointer hover:text-primary transition-colors" />

          {user ? (
            <div className="flex items-center gap-2">
              {roles && roles.length > 1 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="rounded-full"
                      title="Alternar Papel"
                    >
                      <UserCog className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground">
                      Alternar Papel
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {roles.map((role) => (
                      <DropdownMenuItem
                        key={role}
                        onClick={() => {
                          setActiveRole(role)
                          if (role === 'admin') navigate('/admin/dashboard')
                          else if (role === 'club') navigate('/club/dashboard')
                          else if (role === 'staff') navigate('/staff/dashboard')
                          else if (role === 'client') navigate('/client/dashboard')
                          else navigate('/')
                        }}
                        className={cn(
                          'w-full cursor-pointer',
                          activeRole === role && 'bg-primary/10 font-bold',
                        )}
                      >
                        {getRoleName(role)}
                        {activeRole === role && <Check className="ml-auto h-4 w-4" />}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" className="rounded-full">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      {profile?.name && <p className="font-medium">{profile.name}</p>}
                      {user.email && (
                        <p className="w-[200px] truncate text-sm text-muted-foreground">
                          {user.email}
                        </p>
                      )}
                      {activeRole && (
                        <p className="text-xs text-primary font-medium mt-1">
                          Papel atual: {getRoleName(activeRole)}
                        </p>
                      )}
                    </div>
                  </div>

                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="w-full">
                      Meu Perfil
                    </Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <DropdownMenuItem asChild>
                      <Link to="/admin/dashboard" className="w-full">
                        Painel Admin
                      </Link>
                    </DropdownMenuItem>
                  )}
                  {isClub && (
                    <DropdownMenuItem asChild>
                      <Link to="/club/dashboard" className="w-full">
                        Painel do Clube
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-destructive focus:text-destructive"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sair</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="flex gap-2">
              <Button variant="ghost" asChild>
                <Link to="/login">Entrar</Link>
              </Button>
              <Button asChild>
                <Link to="/register">Cadastrar</Link>
              </Button>
            </div>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t bg-background p-4 space-y-4 max-h-[calc(100vh-4rem)] overflow-y-auto">
          <nav className="flex flex-col gap-3">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="text-sm font-medium uppercase hover:text-primary"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.title}
              </Link>
            ))}

            {pages.map((page) => (
              <Link
                key={page.slug}
                to={`/${page.slug}`}
                className="text-sm font-medium uppercase hover:text-primary flex items-center gap-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <FileText className="h-4 w-4" />
                {page.title}
              </Link>
            ))}

            <div className="border-t pt-3 mt-2">
              <p className="text-sm font-bold uppercase mb-3 text-muted-foreground">
                Portal de Serviços
              </p>

              <div className="flex flex-col gap-3 pl-4 border-l-2 border-primary/20">
                <Link
                  to="/services"
                  className="text-sm font-bold hover:text-primary"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Página do Portal
                </Link>
                {isAdmin && (
                  <>
                    <Link
                      to="/admin/quotes"
                      className="text-sm hover:text-primary"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Orçamentos (Admin)
                    </Link>
                    <Link
                      to="/admin/appointments"
                      className="text-sm hover:text-primary"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Agendamentos (Admin)
                    </Link>
                  </>
                )}
                {isStaff && (
                  <Link
                    to="/staff/dashboard"
                    className="text-sm hover:text-primary"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Dashboard Staff
                  </Link>
                )}
                {isClient && (
                  <>
                    <Link
                      to="/client/quotes"
                      className="text-sm hover:text-primary"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Meus Orçamentos
                    </Link>
                    <Link
                      to="/client/dashboard"
                      className="text-sm hover:text-primary"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Meus Agendamentos
                    </Link>
                  </>
                )}
              </div>
            </div>
          </nav>

          <div className="border-t pt-4">
            {user ? (
              <div className="flex flex-col gap-3">
                {roles && roles.length > 1 && (
                  <div className="bg-muted/50 p-3 rounded-lg flex flex-col gap-2 mb-2 border border-border/50">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Alternar Papel
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {roles.map((role) => (
                        <Button
                          key={role}
                          variant={activeRole === role ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => {
                            setActiveRole(role)
                            setIsMobileMenuOpen(false)
                            if (role === 'admin') navigate('/admin/dashboard')
                            else if (role === 'club') navigate('/club/dashboard')
                            else if (role === 'staff') navigate('/staff/dashboard')
                            else if (role === 'client') navigate('/client/dashboard')
                            else navigate('/')
                          }}
                          className="flex items-center gap-1"
                        >
                          {getRoleName(role)}
                          {activeRole === role && <Check className="h-3 w-3" />}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                <Link
                  to="/profile"
                  className="text-sm font-medium hover:text-primary"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Meu Perfil
                </Link>
                {isAdmin && (
                  <Link
                    to="/admin/dashboard"
                    className="text-sm font-medium hover:text-primary"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Painel Admin
                  </Link>
                )}
                {isClub && (
                  <Link
                    to="/club/dashboard"
                    className="text-sm font-medium hover:text-primary"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Painel do Clube
                  </Link>
                )}
                <Button
                  variant="outline"
                  className="w-full justify-start text-destructive mt-2"
                  onClick={() => {
                    handleLogout()
                    setIsMobileMenuOpen(false)
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" /> Sair
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Button variant="outline" asChild className="w-full">
                  <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                    Entrar
                  </Link>
                </Button>
                <Button asChild className="w-full">
                  <Link to="/register" onClick={() => setIsMobileMenuOpen(false)}>
                    Cadastrar
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
