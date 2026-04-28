import { useNavigate } from 'react-router-dom'
import { useSystemData } from '@/hooks/use-system-data'
import { Button } from '@/components/ui/button'
import { ShieldAlert, ArrowLeft } from 'lucide-react'

export default function Forbidden() {
  const navigate = useNavigate()
  const { data } = useSystemData()

  const bgUrl =
    data?.bg_image_url || 'https://img.usecurling.com/p/1920/1080?q=soccer%20field&color=gray'
  const opacity = data?.bg_opacity ?? 100
  const overlayOpacity = 1 - opacity / 100

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center p-4 overflow-hidden">
      <div
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${bgUrl})` }}
      />

      <div
        className="absolute inset-0 z-0 bg-black transition-opacity duration-300"
        style={{ opacity: overlayOpacity }}
      />

      <div className="relative z-10 max-w-2xl w-full bg-background/95 backdrop-blur-md p-8 md:p-12 rounded-2xl shadow-2xl border text-center animate-fade-in-up">
        <div className="flex justify-center mb-6">
          <div className="bg-destructive/10 p-4 rounded-full">
            <ShieldAlert className="h-16 w-16 text-destructive" />
          </div>
        </div>

        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-foreground">
          Acesso a Recurso Proibido
        </h1>

        <p className="text-lg text-muted-foreground mb-8 leading-relaxed max-w-lg mx-auto">
          Verifique seu Cadastro/Login e suas respectivas permissões. Em caso de dúvidas entre em
          contato com o Administrador do Site.
        </p>

        <Button size="lg" onClick={() => navigate('/')} className="gap-2 text-base h-12 px-8">
          <ArrowLeft className="w-5 h-5" />
          Voltar p/ Home
        </Button>
      </div>
    </div>
  )
}
