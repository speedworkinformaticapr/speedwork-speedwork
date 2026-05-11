import { useEffect, useState, useCallback, useMemo } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export function MediaCarousel({ data }: { data: any }) {
  const {
    autoplay = true,
    delay = 5000,
    transition = 'slide',
    alignHorizontal = 'center',
    alignVertical = 'center',
    items = [],
  } = data || {}

  const parsedDelay = parseInt(String(delay), 10) || 5000
  const isSlide = transition === 'slide'

  const plugins = useMemo(() => {
    if (!autoplay) return []
    return [Autoplay({ delay: parsedDelay, stopOnInteraction: true, stopOnMouseEnter: true })]
  }, [autoplay, parsedDelay])

  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      watchDrag: isSlide,
    },
    plugins,
  )

  const [selectedIndex, setSelectedIndex] = useState(0)
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([])

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi])
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi])
  const scrollTo = useCallback((index: number) => emblaApi && emblaApi.scrollTo(index), [emblaApi])

  const onInit = useCallback((api: any) => {
    setScrollSnaps(api.scrollSnapList())
  }, [])

  const onSelect = useCallback((api: any) => {
    setSelectedIndex(api.selectedScrollSnap())
  }, [])

  useEffect(() => {
    if (!emblaApi) return
    onInit(emblaApi)
    onSelect(emblaApi)
    emblaApi.on('reInit', onInit)
    emblaApi.on('reInit', onSelect)
    emblaApi.on('select', onSelect)
  }, [emblaApi, onInit, onSelect])

  if (!items || items.length === 0) return null

  const getAlignClasses = () => {
    const h =
      alignHorizontal === 'left'
        ? 'items-start text-left'
        : alignHorizontal === 'right'
          ? 'items-end text-right'
          : 'items-center text-center'
    const v =
      alignVertical === 'top'
        ? 'justify-start pt-16'
        : alignVertical === 'bottom'
          ? 'justify-end pb-16'
          : 'justify-center'
    return `flex-col ${h} ${v}`
  }

  const getTransitionStyles = (index: number) => {
    if (isSlide) return ''
    const isActive = index === selectedIndex

    const base = 'absolute inset-0 transition-all duration-1000 ease-in-out'

    if (transition === 'fade') {
      return cn(base, isActive ? 'opacity-100 z-10' : 'opacity-0 z-0')
    }
    if (transition === 'scale') {
      return cn(base, isActive ? 'opacity-100 scale-100 z-10' : 'opacity-0 scale-110 z-0')
    }
    if (transition === 'flip') {
      return cn(
        base,
        '[backface-visibility:hidden]',
        isActive
          ? 'opacity-100 [transform:rotateY(0deg)] z-10'
          : 'opacity-0 [transform:rotateY(180deg)] z-0',
      )
    }
    if (transition === 'cube') {
      return cn(
        base,
        isActive
          ? 'opacity-100 [transform:rotateY(0deg)_translateZ(0px)] z-10'
          : 'opacity-0 [transform:rotateY(-90deg)_translateZ(100px)] z-0',
      )
    }
    return base
  }

  return (
    <div
      className={cn(
        'relative w-full overflow-hidden group bg-slate-900 h-[60vh] md:h-[80vh]',
        !isSlide && 'embla-transform-none',
      )}
      ref={emblaRef}
    >
      <div className="flex w-full h-full">
        {items.map((slide: any, index: number) => (
          <div
            key={index}
            className={cn('relative flex-[0_0_100%] min-w-0 h-full', getTransitionStyles(index))}
          >
            {slide.type === 'video' ? (
              <video
                src={slide.url}
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover pointer-events-none"
              />
            ) : (
              <img
                src={slide.url}
                alt={slide.title || 'Slide'}
                className="w-full h-full object-cover"
              />
            )}

            {(slide.title || slide.subtitle || slide.buttonText) && (
              <div
                className={cn('absolute inset-0 flex p-6 md:p-12 z-20', getAlignClasses())}
                style={{ backgroundColor: `rgba(0,0,0,${(slide.overlayOpacity ?? 40) / 100})` }}
              >
                <div
                  className={cn(
                    'max-w-4xl animate-fade-in-up flex flex-col gap-4',
                    alignHorizontal === 'left'
                      ? 'items-start'
                      : alignHorizontal === 'right'
                        ? 'items-end'
                        : 'items-center',
                  )}
                >
                  {slide.title && (
                    <h2 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-white drop-shadow-lg tracking-tight">
                      {slide.title}
                    </h2>
                  )}
                  {slide.subtitle && (
                    <p className="text-base md:text-xl lg:text-2xl text-white/90 drop-shadow-md font-medium whitespace-pre-wrap">
                      {slide.subtitle}
                    </p>
                  )}
                  {slide.buttonText && slide.buttonLink && (
                    <div className="mt-6">
                      <Button
                        asChild
                        size="lg"
                        className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-8 py-6 text-lg rounded-full transition-all hover:scale-105 shadow-xl pointer-events-auto"
                      >
                        <Link to={slide.buttonLink}>{slide.buttonText}</Link>
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/70 to-transparent pointer-events-none z-20" />

      <Button
        variant="ghost"
        size="icon"
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full h-12 w-12 opacity-0 group-hover:opacity-100 transition-opacity z-30 pointer-events-auto"
        onClick={scrollPrev}
      >
        <ChevronLeft className="h-8 w-8" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full h-12 w-12 opacity-0 group-hover:opacity-100 transition-opacity z-30 pointer-events-auto"
        onClick={scrollNext}
      >
        <ChevronRight className="h-8 w-8" />
      </Button>

      <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-3 z-30 pointer-events-auto">
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
