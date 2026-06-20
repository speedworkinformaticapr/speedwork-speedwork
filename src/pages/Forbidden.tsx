import { Link } from 'react-router-dom'
import { AlertOctagon } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function Forbidden() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center p-8 text-center">
      <div className="rounded-full bg-destructive/10 p-4">
        <AlertOctagon className="h-12 w-12 text-destructive" />
      </div>
      <h1 className="mt-6 text-4xl font-bold tracking-tight">403 Acesso Negado</h1>
      <p className="mt-4 max-w-[600px] text-lg text-muted-foreground">
        Você não tem permissão para acessar esta página. Se você acredita que isso é um erro, entre
        em contato com o suporte ou valide sua sessão.
      </p>
      <div className="mt-8 flex gap-4">
        <Button asChild>
          <Link to="/">Voltar para o Início</Link>
        </Button>
      </div>
    </div>
  )
}
