import { useLocation, Link } from 'react-router-dom'
import { useEffect } from 'react'
import { Home, Search, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSeo } from '@/hooks/use-seo'

const NotFound = () => {
  const location = useLocation()

  useSeo({
    title: 'Página Não Encontrada - Footgolf PR',
    description: 'A página que você está procurando não existe ou foi movida.',
  })

  useEffect(() => {
    console.error('404 Error: User attempted to access non-existent route:', location.pathname)
  }, [location.pathname])

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-background px-4">
      <div className="text-center max-w-lg mx-auto animate-fade-in-up">
        <div className="flex justify-center mb-6">
          <div className="relative">
            <AlertCircle className="w-24 h-24 text-[#0052CC] opacity-20" />
            <div className="absolute inset-0 flex items-center justify-center text-4xl font-black text-[#1B7D3A]">
              404
            </div>
          </div>
        </div>
        <h1 className="text-4xl md:text-5xl font-black mb-4 text-foreground tracking-tight">
          Ops! Fora de campo.
        </h1>
        <p className="text-lg text-muted-foreground mb-8">
          A página que você está procurando não existe, foi movida ou você não tem permissão para
          acessá-la.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            asChild
            size="lg"
            className="bg-[#1B7D3A] hover:bg-[#145d2b] text-white font-bold rounded-full"
          >
            <Link to="/">
              <Home className="w-5 h-5 mr-2" />
              Voltar ao Início
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="border-[#0052CC] text-[#0052CC] hover:bg-[#0052CC] hover:text-white font-bold rounded-full"
          >
            <Link to="/tournaments">
              <Search className="w-5 h-5 mr-2" />
              Ver Eventos
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

export default NotFound
