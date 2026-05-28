import { Button } from '@/components/ui/button'
import { Calendar } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export function SchedulingBlock({
  title = 'Agende seu Serviço',
  subtitle = 'Rápido, fácil e totalmente online. Escolha o melhor horário para você.',
}) {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col items-center justify-center p-12 bg-card rounded-xl shadow-sm border border-border/50 text-center max-w-3xl mx-auto my-8">
      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
        <Calendar className="w-8 h-8 text-primary" />
      </div>
      <h3 className="text-3xl font-bold mb-3">{title}</h3>
      <p className="text-muted-foreground text-lg mb-8 max-w-lg">{subtitle}</p>
      <Button
        onClick={() => navigate('/scheduling')}
        size="lg"
        className="h-12 px-8 text-lg font-medium"
      >
        Iniciar Agendamento
      </Button>
    </div>
  )
}
