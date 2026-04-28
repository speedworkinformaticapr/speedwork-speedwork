import { useState, useEffect, useCallback } from 'react'
import {
  X,
  ChevronLeft,
  ChevronRight,
  Share2,
  Maximize,
  ZoomIn,
  ZoomOut,
  Link as LinkIcon,
  Facebook,
  Instagram,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { PhotoWithEvent } from '@/services/gallery'
import { useTranslation } from '@/hooks/use-translation'
import { toast } from '@/hooks/use-toast'

interface LightboxProps {
  photos: PhotoWithEvent[]
  initialIndex: number
  onClose: () => void
}

export function Lightbox({ photos, initialIndex, onClose }: LightboxProps) {
  const { t } = useTranslation()
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [isZoomed, setIsZoomed] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const photo = photos[currentIndex]

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % photos.length)
    setIsZoomed(false)
  }, [photos.length])

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length)
    setIsZoomed(false)
  }, [photos.length])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isFullscreen) document.exitFullscreen()
        onClose()
      }
      if (e.key === 'ArrowRight') handleNext()
      if (e.key === 'ArrowLeft') handlePrev()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleNext, handlePrev, onClose, isFullscreen])

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen()
      setIsFullscreen(true)
    } else {
      await document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  const sharePhoto = (platform: 'whatsapp' | 'facebook' | 'copy') => {
    const url = photo.photo_url
    if (platform === 'whatsapp') {
      window.open(
        `https://api.whatsapp.com/send?text=${encodeURIComponent('Confira esta foto: ' + url)}`,
        '_blank',
      )
    } else if (platform === 'facebook') {
      window.open(
        `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
        '_blank',
      )
    } else if (platform === 'copy') {
      navigator.clipboard.writeText(url)
      toast({ title: t('gallery.linkCopied') })
    }
  }

  if (!photo) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="absolute top-4 right-4 z-50 flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/20"
          onClick={toggleFullscreen}
        >
          <Maximize className="h-5 w-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/20"
          onClick={() => sharePhoto('whatsapp')}
        >
          <Share2 className="h-5 w-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/20"
          onClick={() => sharePhoto('facebook')}
        >
          <Facebook className="h-5 w-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/20"
          onClick={() => sharePhoto('copy')}
        >
          <LinkIcon className="h-5 w-5" />
        </Button>
        <div className="w-px h-6 bg-white/30 mx-2" />
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/20"
          onClick={onClose}
        >
          <X className="h-6 w-6" />
        </Button>
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 z-50"
        onClick={handlePrev}
      >
        <ChevronLeft className="h-8 w-8" />
      </Button>

      <div
        className="relative w-full h-full flex items-center justify-center p-12 overflow-hidden"
        onClick={() => setIsZoomed(!isZoomed)}
      >
        <img
          src={photo.photo_url}
          alt="Gallery"
          className={cn(
            'max-w-full max-h-full transition-transform duration-300 ease-out',
            isZoomed ? 'scale-[2] cursor-zoom-out' : 'scale-100 cursor-zoom-in object-contain',
          )}
        />

        {!isZoomed && photo.events && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-black/60 text-white px-6 py-3 rounded-full backdrop-blur-md text-center border border-white/10 animate-in slide-in-from-bottom-4">
            <h3 className="font-semibold">{photo.events.name}</h3>
            <p className="text-sm text-white/80">
              {photo.events.date && new Date(photo.events.date).toLocaleDateString()}
              {photo.events.location && ` • ${photo.events.location}`}
            </p>
          </div>
        )}
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 z-50"
        onClick={handleNext}
      >
        <ChevronRight className="h-8 w-8" />
      </Button>
    </div>
  )
}
