import { Link } from 'react-router-dom'
import { CheckCircle2, ArrowLeft, Clock, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useSeo } from '@/hooks/use-seo'

export default function EvaluationSuccess() {
  useSeo({
    title: 'Avaliação Enviada com Sucesso!',
    description: 'Sua avaliação foi enviada com sucesso. Nossa equipe entrará em contato em breve.',
  })

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <Card className="max-w-lg w-full animate-fade-in-up border-0 shadow-xl shadow-primary/5 overflow-hidden">
        <div className="bg-gradient-to-br from-green-500/10 to-primary/5 pt-10 pb-6 px-6 text-center">
          <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-950 flex items-center justify-center mx-auto mb-6 ring-8 ring-green-500/10">
            <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold mb-3 tracking-tight">
            Avaliação Enviada com Sucesso!
          </h1>
          <p className="text-muted-foreground text-base leading-relaxed max-w-md mx-auto">
            Agradecemos o seu interesse. Nossa equipe analisará os dados e entrará em contato em
            breve.
          </p>
        </div>

        <CardContent className="px-6 pb-8 pt-6">
          <div className="space-y-4 mb-8">
            <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Mail className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">Análise dos Dados</p>
                <p className="text-sm text-muted-foreground">
                  Nossa equipe especializada irá revisar as informações fornecidas com atenção.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Clock className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">Contato em Breve</p>
                <p className="text-sm text-muted-foreground">
                  Entraremos em contato em até 48 horas com uma proposta personalizada.
                </p>
              </div>
            </div>
          </div>

          <Button asChild size="lg" className="w-full font-semibold">
            <Link to="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar para o Início
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
