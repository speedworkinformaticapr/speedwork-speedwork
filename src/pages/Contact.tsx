import { useState } from 'react'
import { Mail, Phone, MapPin, Send } from 'lucide-react'
import { PageHero } from '@/components/PageHero'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { useSeo } from '@/hooks/use-seo'

export default function Contact() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  useSeo({
    title: 'Contato - Footgolf PR',
    description: 'Entre em contato com a federação de Footgolf do Paraná.',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    // Simulate API call
    setTimeout(() => {
      toast({
        title: 'Mensagem enviada!',
        description: 'Recebemos seu contato e retornaremos em breve.',
      })
      setLoading(false)
      ;(e.target as HTMLFormElement).reset()
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-muted/30 pb-24 font-sans">
      <PageHero
        title="Contato"
        description="Fale conosco para dúvidas, parcerias ou informações sobre filiação e torneios."
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Contato' }]}
        icon={<Mail className="w-[400px] h-[400px]" />}
      />

      <main className="container mx-auto px-4 -mt-8 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <Card className="border-none shadow-md overflow-hidden bg-card">
              <div className="h-2 bg-[#1B7D3A]"></div>
              <CardContent className="p-8">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 bg-[#1B7D3A]/10 rounded-full flex items-center justify-center shrink-0">
                    <MapPin className="w-6 h-6 text-[#1B7D3A]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-foreground mb-1">Endereço</h3>
                    <p className="text-muted-foreground text-sm">
                      Sede Administrativa Footgolf PR
                      <br />
                      Curitiba, PR - Brasil
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 bg-[#0052CC]/10 rounded-full flex items-center justify-center shrink-0">
                    <Mail className="w-6 h-6 text-[#0052CC]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-foreground mb-1">E-mail</h3>
                    <a
                      href="mailto:contato@footgolfpr.com.br"
                      className="text-muted-foreground text-sm hover:text-[#0052CC] transition-colors"
                    >
                      contato@footgolfpr.com.br
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-amber-500/10 rounded-full flex items-center justify-center shrink-0">
                    <Phone className="w-6 h-6 text-amber-500" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-foreground mb-1">Telefone</h3>
                    <a
                      href="tel:+5541999999999"
                      className="text-muted-foreground text-sm hover:text-amber-500 transition-colors"
                    >
                      +55 (41) 99999-9999
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Card className="border-none shadow-md bg-card">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-foreground mb-6">Envie uma Mensagem</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label htmlFor="name" className="text-sm font-medium text-foreground">
                        Nome Completo *
                      </label>
                      <Input
                        id="name"
                        required
                        placeholder="Seu nome"
                        className="bg-background border-input"
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="email" className="text-sm font-medium text-foreground">
                        E-mail *
                      </label>
                      <Input
                        id="email"
                        type="email"
                        required
                        placeholder="seu@email.com"
                        className="bg-background border-input"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="subject" className="text-sm font-medium text-foreground">
                      Assunto *
                    </label>
                    <Input
                      id="subject"
                      required
                      placeholder="Como podemos ajudar?"
                      className="bg-background border-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="message" className="text-sm font-medium text-foreground">
                      Mensagem *
                    </label>
                    <Textarea
                      id="message"
                      required
                      placeholder="Escreva sua mensagem aqui..."
                      className="min-h-[150px] bg-background border-input"
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full md:w-auto bg-[#1B7D3A] hover:bg-[#145d2b] text-white px-8 font-bold"
                  >
                    {loading ? (
                      'Enviando...'
                    ) : (
                      <>
                        Enviar Mensagem
                        <Send className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
