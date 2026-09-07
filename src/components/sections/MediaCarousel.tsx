import { useEffect, useState, useCallback, useMemo, useRef } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Volume2, VolumeX } from 'lucide-react'
import { cn } from '@/lib/utils'

// MediaCarousel: exibe itens de mídia (imagens e vídeos).
export function MediaCarousel({ data }: { data: any }) {
  const {
    autoplay = true,
    delay = 5000,
    transition = 'slide',
    alignHorizontal = 'center',
    alignVertical = 'center',
    items: rawItems = [],
  } = data || {}

  // Ordenação estável pela ordem definida pela usuária (_order / order)
  const items = useMemo(() => {
    if (!Array.isArray(rawItems)) return []
    return rawItems
      .map((item, originalIndex) => {
        const orderVal =
          typeof item === 'object' && item !== null
            ? (item._order ?? item.order ?? originalIndex + 1)
            : originalIndex + 1
        const numOrder =
          typeof orderVal === 'number'
            ? orderVal
            : parseInt(String(orderVal), 10) || originalIndex + 1
        return { item, originalIndex, order: numOrder }
      })
      .sort((a, b) => {
        if (a.order !== b.order) return a.order - b.order
        return a.originalIndex - b.originalIndex
      })
      .map((entry) => entry.item)
  }, [rawItems])

  const parsedDelay = parseInt(String(delay), 10) || 5000
  const isSlide = transition === 'slide'

  const [activeVideoIndex, setActiveVideoIndex] = useState<number | null>(null)
  const [isMuted, setIsMuted] = useState(true)

  const videoRefs = useRef<Record<number, HTMLVideoElement | null>>({})

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

  const playActiveVideo = useCallback((video: HTMLVideoElement) => {
    // Autoplay com som mudo e playsinline para conformidade estrita com navegadores
    video.muted = true
    video.playsInline = true
    const playPromise = video.play()
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        // Tenta novamente garantindo muted
        video.muted = true
        video.play().catch(() => {
          /* erro de autoplay ignorado */
        })
      })
    }
  }, [])

  useEffect(() => {
    // Ao trocar de slide, reseta o estado de áudio para mudo padrão
    setIsMuted(true)

    // Pausa todos os outros vídeos
    Object.entries(videoRefs.current).forEach(([idxStr, video]) => {
      const idx = Number(idxStr)
      if (video && idx !== selectedIndex) {
        video.pause()
        video.currentTime = 0
        video.muted = true
      }
    })

    const current = items[selectedIndex]
    const autoplayPlugin = emblaApi?.plugins()?.autoplay as any

    if (current && current.type === 'video') {
      setActiveVideoIndex(selectedIndex)
      // Pausa o autoplay do timer de imagens enquanto o vídeo estiver em exibição
      if (autoplayPlugin) {
        try {
          autoplayPlugin.stop()
        } catch {
          /* ignorado */
        }
      }

      const video = videoRefs.current[selectedIndex]
      if (video) {
        video.currentTime = 0
        playActiveVideo(video)
      }
    } else {
      setActiveVideoIndex(null)
      // Se voltou para um slide de imagem, retoma o autoplay do timer
      if (autoplay && autoplayPlugin) {
        try {
          autoplayPlugin.reset()
        } catch {
          /* ignorado */
        }
      }
    }
  }, [selectedIndex, items, emblaApi, autoplay, playActiveVideo])

  // Alterna o som do vídeo ativo
  const toggleMute = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      const video = videoRefs.current[selectedIndex]
      if (!video) return

      if (video.muted) {
        video.muted = false
        setIsMuted(false)
        const playPromise = video.play()
        if (playPromise !== undefined) {
          playPromise.catch(() => {
            /* ignorado se já estiver tocando */
          })
        }
      } else {
        video.muted = true
        setIsMuted(true)
      }
    },
    [selectedIndex],
  )

  // Handler executado quando o vídeo termina
  const handleVideoEnded = useCallback(
    (index: number) => {
      if (!emblaApi) return
      // Só avança se o vídeo que disparou o evento ainda for o slide selecionado
      if (selectedIndex === index) {
        emblaApi.scrollNext()
      }
    },
    [emblaApi, selectedIndex],
  )

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
        'relative w-full overflow-hidden group bg-black h-[60vh] md:h-[80vh]',
        !isSlide && 'embla-transform-none',
      )}
      ref={emblaRef}
    >
      <div className="flex w-full h-full">
        {items.map((slide: any, index: number) => {
          const isVideo = slide.type === 'video'
          return (
            <div
              key={index}
              className={cn(
                'relative flex-[0_0_100%] min-w-0 h-full bg-black',
                getTransitionStyles(index),
              )}
            >
              {isVideo ? (
                <video
                  ref={(el) => {
                    videoRefs.current[index] = el
                  }}
                  src={slide.url}
                  autoPlay
                  muted
                  playsInline
                  onEnded={() => handleVideoEnded(index)}
                  className="w-full h-full object-contain pointer-events-none"
                >
                  {slide.subtitleUrl && (
                    <track
                      kind="subtitles"
                      src={slide.subtitleUrl}
                      srcLang={slide.subtitleLang || 'pt'}
                      label={slide.subtitleLabel || 'Português'}
                      default={false}
                    />
                  )}
                </video>
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
                      <h2
                        className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-white drop-shadow-lg tracking-tight"
                        dangerouslySetInnerHTML={{ __html: slide.title }}
                      />
                    )}
                    {slide.subtitle && (
                      <div
                        className="text-base md:text-xl lg:text-2xl text-white/90 drop-shadow-md font-medium whitespace-pre-wrap [&_p]:mb-2 [&_p:last-child]:mb-0"
                        dangerouslySetInnerHTML={{ __html: slide.subtitle }}
                      />
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
          )
        })}
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

      {activeVideoIndex !== null && (
        <button
          type="button"
          onClick={toggleMute}
          aria-label={isMuted ? 'Ativar som' : 'Desativar som'}
          title={isMuted ? 'Ativar som' : 'Desativar som'}
          className="absolute bottom-6 right-6 z-30 flex items-center justify-center w-11 h-11 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-sm border border-white/20 shadow-lg transition-all duration-200 hover:scale-105 pointer-events-auto cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/50"
        >
          {isMuted ? (
            <VolumeX className="w-5 h-5 text-white" />
          ) : (
            <Volume2 className="w-5 h-5 text-white" />
          )}
        </button>
      )}
    </div>
  )
}
