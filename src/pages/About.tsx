import { Users, Target, Shield, Trophy } from 'lucide-react'
import { PageHero } from '@/components/PageHero'
import { Card, CardContent } from '@/components/ui/card'
import { useSeo } from '@/hooks/use-seo'

export default function About() {
  useSeo({
    title: 'Sobre Nós - Footgolf PR',
    description: 'Conheça a história, a missão e os valores do Footgolf no Paraná.',
  })

  return (
    <div className="min-h-screen bg-gray-50 pb-24 font-sans">
      <PageHero
        title="Sobre Nós"
        description="Conheça a história e o compromisso da federação com o desenvolvimento do esporte no estado do Paraná."
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Sobre' }]}
        icon={<Users className="w-[400px] h-[400px]" />}
      />

      <main className="container mx-auto px-4 -mt-8 relative z-20">
        <Card className="border-none shadow-xl overflow-hidden mb-12 bg-white rounded-2xl">
          <div className="flex flex-col lg:flex-row">
            <div className="lg:w-1/2 p-8 md:p-12 lg:p-16 flex flex-col justify-center">
              <h2 className="text-3xl font-black font-montserrat text-[#0052CC] uppercase mb-6">
                Nossa História
              </h2>
              <div className="space-y-4 text-gray-600 leading-relaxed text-lg">
                <p>
                  O Footgolf Paraná nasceu da paixão compartilhada por dois dos esportes mais
                  populares do mundo: o futebol e o golfe. Começamos como um pequeno grupo de
                  entusiastas e rapidamente crescemos para nos tornarmos a referência oficial do
                  esporte no estado.
                </p>
                <p>
                  Nossa organização trabalha incansavelmente para promover competições justas,
                  desenvolver novos talentos e expandir a infraestrutura de campos disponíveis para
                  a prática do Footgolf em todo o Paraná.
                </p>
              </div>
            </div>
            <div className="lg:w-1/2 h-64 lg:h-auto relative">
              <img
                src="https://img.usecurling.com/p/800/600?q=footgolf&color=blue"
                alt="Equipe Footgolf"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="border-none shadow-md hover:shadow-lg transition-shadow bg-white text-center p-8 group">
            <div className="w-16 h-16 bg-[#1B7D3A]/10 text-[#1B7D3A] rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
              <Target className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold mb-4 text-gray-900">Missão</h3>
            <p className="text-gray-600">
              Desenvolver, promover e organizar a prática do Footgolf no Paraná, proporcionando
              eventos de excelência e inclusão para atletas de todos os níveis.
            </p>
          </Card>

          <Card className="border-none shadow-md hover:shadow-lg transition-shadow bg-white text-center p-8 group">
            <div className="w-16 h-16 bg-[#0052CC]/10 text-[#0052CC] rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
              <Shield className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold mb-4 text-gray-900">Visão</h3>
            <p className="text-gray-600">
              Ser reconhecida nacionalmente como a principal força fomentadora do Footgolf,
              revelando talentos e sediando os melhores torneios do país.
            </p>
          </Card>

          <Card className="border-none shadow-md hover:shadow-lg transition-shadow bg-white text-center p-8 group">
            <div className="w-16 h-16 bg-amber-500/10 text-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
              <Trophy className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold mb-4 text-gray-900">Valores</h3>
            <p className="text-gray-600">
              Integridade, respeito, espírito esportivo, inclusão, sustentabilidade e paixão pelo
              esporte em cada chute e em cada buraco.
            </p>
          </Card>
        </div>
      </main>
    </div>
  )
}
