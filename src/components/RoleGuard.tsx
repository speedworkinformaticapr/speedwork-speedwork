import { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { useSystemData } from '@/hooks/use-system-data'
import { Button } from '@/components/ui/button'
import { ShieldAlert, AlertTriangle } from 'lucide-react'

interface RoleGuardProps {
  children: ReactNode
  allowedRoles: string[]
}

export function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
  const { user, activeRole, roles, setActiveRole, loading } = useAuth()
  const location = useLocation()
  const { data: systemData } = useSystemData()

  if (loading) return null

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  const hasAccess = activeRole && allowedRoles.includes(activeRole)

  if (!hasAccess) {
    const availableAllowedRoles = (roles || []).filter((r) => allowedRoles.includes(r))

    const getRoleName = (role: string) => {
      const names: Record<string, string> = {
        master: 'Master',
        admin: 'Administrador',
        club: 'Clube',
        athlete: 'Atleta',
        client: 'Cliente',
        staff: 'Staff',
        user: 'Usuário',
      }
      return names[role] || role
    }

    if (availableAllowedRoles.length > 0) {
      return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-background">
          {systemData?.bg_image_url && (
            <div
              className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
              style={{
                backgroundImage: `url(${systemData.bg_image_url})`,
                opacity: (systemData.bg_opacity ?? 100) / 100,
              }}
            />
          )}
          <div className="absolute inset-0 z-10 bg-background/80 backdrop-blur-sm" />

          <div className="z-20 max-w-md w-full p-8 text-center space-y-6 animate-fade-in-up">
            <div className="mx-auto w-24 h-24 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-6 shadow-sm">
              <ShieldAlert className="w-12 h-12" />
            </div>

            <h1 className="text-3xl font-bold text-foreground">Alternar Papel Necessário</h1>

            <div className="bg-primary/5 border border-primary/20 p-4 rounded-lg flex items-start gap-3 text-left shadow-sm">
              <AlertTriangle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <p className="text-sm text-foreground/80 leading-relaxed">
                Você tem acesso a esta página, mas precisa alternar para o papel correto para
                visualizá-la.
              </p>
            </div>

            <div className="pt-4 flex flex-col gap-3">
              {availableAllowedRoles.map((role) => (
                <Button
                  key={role}
                  size="lg"
                  className="w-full font-bold shadow-md"
                  onClick={() => setActiveRole(role)}
                >
                  Acessar como {getRoleName(role)}
                </Button>
              ))}
              <Button variant="outline" asChild size="lg" className="w-full font-bold mt-2">
                <a href="/">Voltar p/ Home</a>
              </Button>
            </div>
          </div>
        </div>
      )
    }

    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-background">
        {systemData?.bg_image_url && (
          <div
            className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url(${systemData.bg_image_url})`,
              opacity: (systemData.bg_opacity ?? 100) / 100,
            }}
          />
        )}
        <div className="absolute inset-0 z-10 bg-background/80 backdrop-blur-sm" />

        <div className="z-20 max-w-md w-full p-8 text-center space-y-6 animate-fade-in-up">
          <div className="mx-auto w-24 h-24 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mb-6 shadow-sm">
            <ShieldAlert className="w-12 h-12" />
          </div>

          <h1 className="text-3xl font-bold text-foreground">Acesso Restrito</h1>

          <div className="bg-destructive/5 border border-destructive/20 p-4 rounded-lg flex items-start gap-3 text-left shadow-sm">
            <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
            <p className="text-sm text-foreground/80 leading-relaxed">
              <strong>Acesso a Recurso Proibido</strong> - Verifique seu Cadastro/Login e suas
              respectivas permissões. Em caso de dúvidas, entre em contato com o Administrador do
              Site.
            </p>
          </div>

          <div className="pt-4">
            <Button asChild size="lg" className="w-full font-bold shadow-md">
              <a href="/">Voltar p/ Home</a>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
