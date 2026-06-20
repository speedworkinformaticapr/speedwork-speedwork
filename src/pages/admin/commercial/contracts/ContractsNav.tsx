import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'

export function ContractsNav() {
  const location = useLocation()

  const navItems = [
    { name: 'Dashboard', path: '/admin/commercial/contracts/dashboard' },
    { name: 'Contratos', path: '/admin/commercial/contracts' },
    { name: 'Nova Minuta (Wizard)', path: '/admin/commercial/contracts/wizard' },
    { name: 'Biblioteca de Cláusulas', path: '/admin/commercial/contracts/clauses' },
    { name: 'Aditivos', path: '/admin/commercial/contracts/addendums' },
    { name: 'Relatórios', path: '/admin/commercial/contracts/reports' },
  ]

  return (
    <nav className="flex items-center space-x-4 mb-6 overflow-x-auto pb-2 border-b">
      {navItems.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          className={cn(
            'px-3 py-2 text-sm font-medium rounded-md whitespace-nowrap transition-colors',
            location.pathname === item.path ||
              (location.pathname.startsWith(item.path) &&
                item.path !== '/admin/commercial/contracts')
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:bg-muted',
          )}
        >
          {item.name}
        </Link>
      ))}
    </nav>
  )
}
