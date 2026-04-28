import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'

const CATEGORIES = ['Todas', 'Torneios', 'Campos', 'Antes/Depois']

const MOCK_NORMAL_PHOTOS = [
  {
    id: '1',
    category: 'Torneios',
    url: 'https://img.usecurling.com/p/600/400?q=golf%20tournament',
    title: 'Copa PR 2026',
    date: 'Março 2026',
  },
  {
    id: '2',
    category: 'Campos',
    url: 'https://img.usecurling.com/p/600/400?q=golf%20course',
    title: 'Buraco 18',
    date: 'Janeiro 2026',
  },
  {
    id: '3',
    category: 'Torneios',
    url: 'https://img.usecurling.com/p/600/400?q=golf%20championship',
    title: 'Finais de Inverno',
    date: 'Julho 2025',
  },
  {
    id: '4',
    category: 'Campos',
    url: 'https://img.usecurling.com/p/600/400?q=green%20golf%20course',
    title: 'Visão Aérea',
    date: 'Novembro 2025',
  },
]

const MOCK_BEFORE_AFTER = [
  {
    id: 'ba1',
    service: 'Manutenção de Campo',
    date: '10/05/2026',
    before: 'https://img.usecurling.com/p/400/300?q=dry%20grass',
    after: 'https://img.usecurling.com/p/400/300?q=green%20grass',
    desc: 'Recuperação completa do gramado no setor sul após seca severa.',
  },
  {
    id: 'ba2',
    service: 'Nivelamento',
    date: '15/04/2026',
    before: 'https://img.usecurling.com/p/400/300?q=messy%20field',
    after: 'https://img.usecurling.com/p/400/300?q=clean%20golf%20field',
    desc: 'Adequação de terreno e nivelamento profissional.',
  },
  {
    id: 'ba3',
    service: 'Limpeza de Lagos',
    date: '20/03/2026',
    before: 'https://img.usecurling.com/p/400/300?q=dirty%20lake',
    after: 'https://img.usecurling.com/p/400/300?q=clear%20lake',
    desc: 'Tratamento de água e limpeza das margens dos obstáculos de água.',
  },
  {
    id: 'ba4',
    service: 'Manutenção de Campo',
    date: '05/02/2026',
    before: 'https://img.usecurling.com/p/400/300?q=dead%20grass',
    after: 'https://img.usecurling.com/p/400/300?q=perfect%20golf%20grass',
    desc: 'Plantio de nova grama especial para greens.',
  },
  {
    id: 'ba5',
    service: 'Pintura de Estruturas',
    date: '10/01/2026',
    before: 'https://img.usecurling.com/p/400/300?q=old%20building',
    after: 'https://img.usecurling.com/p/400/300?q=new%20building',
    desc: 'Revitalização do clubhouse central.',
  },
  {
    id: 'ba6',
    service: 'Iluminação',
    date: '01/12/2025',
    before: 'https://img.usecurling.com/p/400/300?q=dark%20field',
    after: 'https://img.usecurling.com/p/400/300?q=bright%20field',
    desc: 'Instalação de LEDs no campo de treino.',
  },
]

export default function Gallery() {
  const [activeCategory, setActiveCategory] = useState('Todas')
  const [baServiceFilter, setBaServiceFilter] = useState('Todos')

  const uniqueServices = Array.from(new Set(MOCK_BEFORE_AFTER.map((x) => x.service)))

  const filteredNormal =
    activeCategory === 'Todas'
      ? MOCK_NORMAL_PHOTOS
      : MOCK_NORMAL_PHOTOS.filter((p) => p.category === activeCategory)

  const filteredBA =
    baServiceFilter === 'Todos'
      ? MOCK_BEFORE_AFTER
      : MOCK_BEFORE_AFTER.filter((x) => x.service === baServiceFilter)

  return (
    <div className="py-20 px-4 min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12 animate-fade-in-up">
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight mb-4">
            Galeria e Portfólio
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Acompanhe nossos eventos, instalações e a transformação promovida pelos nossos serviços.
          </p>
        </div>

        <div
          className="flex flex-wrap justify-center gap-3 mb-10 animate-fade-in-up"
          style={{ animationDelay: '100ms' }}
        >
          {CATEGORIES.map((cat) => (
            <Button
              key={cat}
              variant={activeCategory === cat ? 'default' : 'outline'}
              className={
                activeCategory === cat
                  ? 'bg-[#1B7D3A] hover:bg-[#1B7D3A]/90 rounded-full px-6'
                  : 'rounded-full px-6'
              }
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </Button>
          ))}
        </div>

        {activeCategory === 'Antes/Depois' && (
          <div className="mb-8 flex justify-end animate-fade-in">
            <Select value={baServiceFilter} onValueChange={setBaServiceFilter}>
              <SelectTrigger className="w-[250px] bg-white rounded-xl">
                <SelectValue placeholder="Filtrar por Serviço" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Todos">Todos os Serviços</SelectItem>
                {uniqueServices.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {activeCategory !== 'Antes/Depois' &&
              filteredNormal.map((photo, i) => (
                <motion.div
                  key={photo.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                  className="group relative rounded-2xl overflow-hidden shadow-md bg-white cursor-pointer"
                >
                  <div className="aspect-[4/3] overflow-hidden">
                    <img
                      src={photo.url}
                      alt={photo.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                    <span className="text-white/80 text-sm font-bold uppercase tracking-widest mb-1">
                      {photo.category}
                    </span>
                    <h3 className="text-white text-xl font-bold">{photo.title}</h3>
                    <span className="text-white/60 text-xs mt-1">{photo.date}</span>
                  </div>
                </motion.div>
              ))}

            {activeCategory === 'Antes/Depois' &&
              filteredBA.map((ba, i) => (
                <motion.div
                  key={ba.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                  className="bg-white rounded-2xl overflow-hidden shadow-lg border border-border flex flex-col"
                >
                  <div className="flex aspect-[16/9] w-full relative group">
                    <div className="w-1/2 relative overflow-hidden">
                      <img
                        src={ba.before}
                        alt="Antes"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded shadow-sm">
                        Antes
                      </div>
                    </div>
                    <div className="w-0.5 bg-white shadow-xl z-10 relative"></div>
                    <div className="w-1/2 relative overflow-hidden">
                      <img
                        src={ba.after}
                        alt="Depois"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute top-2 right-2 bg-green-500 text-white text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded shadow-sm">
                        Depois
                      </div>
                    </div>
                  </div>
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-lg leading-tight text-gray-900">
                        {ba.service}
                      </h3>
                      <span className="text-xs text-muted-foreground font-medium bg-muted px-2 py-1 rounded-md">
                        {ba.date}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-3 mt-1 flex-1">
                      {ba.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
          </AnimatePresence>
        </div>

        {((activeCategory !== 'Antes/Depois' && filteredNormal.length === 0) ||
          (activeCategory === 'Antes/Depois' && filteredBA.length === 0)) && (
          <div className="py-20 text-center text-muted-foreground animate-fade-in">
            <p className="text-lg">Nenhuma imagem encontrada para os filtros selecionados.</p>
          </div>
        )}
      </div>
    </div>
  )
}
