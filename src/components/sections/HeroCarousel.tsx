import { useEffect, useState, useCallback, useMemo } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'
import { supabase } from '@/lib/supabase/client'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export function HeroCarousel() {
  const [slides, setSlides] = useState<any[]>([])

  const plugins = useMemo(() => {
    return [Autoplay({ delay: 5000, stopOnInteraction: true, stopOnMouseEnter: true })]
  }, [])

  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, plugins)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([])

  useEffect(() => {
    const fetchSlides = async () => {
      const { data } = await supabase
        .from('hero_carousel')
        .select('*')
        .eq('is_published', true)
        .order('display_order', { ascending: true })
      if (data) setSlides(data)
    }
    fetchSlides()
  }, [])

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi])
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi])
  const scrollTo = useCallback((index: number) => emblaApi && emblaApi.scrollTo(index), [emblaApi])

  const onInit = useCallback((emblaApi: any) => {
    setScrollSnaps(emblaApi.scrollSnapList())
  }, [])

  const onSelect = useCallback((emblaApi: any) => {
    setSelectedIndex(emblaApi.selectedScrollSnap())
  }, [])

  useEffect(() => {
    if (!emblaApi) return
    onInit(emblaApi)
    onSelect(emblaApi)
    emblaApi.on('reInit', onInit)
    emblaApi.on('reInit', onSelect)
    emblaApi.on('select', onSelect)
  }, [emblaApi, onInit, onSelect])

  if (!slides || slides.length === 0) return null

  const getEmbedUrl = (type: string, url: string) => {
    if (!url) return ''
    if (type === 'youtube') {
      const videoId = url.match(
        /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&]{11})/,
      )?.[1]
      return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&showinfo=0&rel=0`
    }
    if (type === 'vimeo') {
      const videoId = url.match(/vimeo\.com\/(?:.*#|.*\/videos\/)?([0-9]+)/)?.[1]
      return `https://player.vimeo.com/video/${videoId}?background=1&autoplay=1&loop=1&byline=0&title=0`
    }
    return url
  }

  return (
    <div className="relative w-full overflow-hidden group bg-slate-900" ref={emblaRef}>
      <div className="flex touch-pan-y">
        {slides.map((slide) => (
          <div key={slide.id} className="relative flex-[0_0_100%] min-w-0 h-[60vh] md:h-[80vh]">
            {slide.media_type === 'image' ? null : slide.media_type === 'local_video' ? (
              <video
                src={slide.media_url}
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover pointer-events-none"
              />
            ) : (
              <iframe
                src={getEmbedUrl(slide.media_type, slide.media_url)}
                className="w-full h-full object-cover pointer-events-none"
                allow="autoplay; fullscreen; picture-in-picture"
              />
            )}
          </div>
        ))}
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/70 to-transparent pointer-events-none" />

      <Button
        variant="ghost"
        size="icon"
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full h-12 w-12 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={scrollPrev}
      >
        <ChevronLeft className="h-8 w-8" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full h-12 w-12 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={scrollNext}
      >
        <ChevronRight className="h-8 w-8" />
      </Button>

      <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-3">
        {scrollSnaps.map((_, index) => (
          <button
            key={index}
            className={cn(
              'w-3 h-3 rounded-full transition-all duration-300',
              index === selectedIndex ? 'bg-white scale-125' : 'bg-white/50 hover:bg-white/80',
            )}
            onClick={() => scrollTo(index)}
          />
        ))}
      </div>
    </div>
  )
}
