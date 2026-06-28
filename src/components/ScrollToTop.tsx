import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { ArrowUp } from 'lucide-react'
import { cn } from '@/lib/utils'

const SCROLL_THRESHOLD = 300

export function ScrollToTop() {
  const { pathname } = useLocation()
  const [showButton, setShowButton] = useState(false)

  useEffect(() => {
    const scrollToTop = () => {
      if ('scrollBehavior' in document.documentElement.style) {
        window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
      } else {
        window.scrollTo(0, 0)
      }
    }

    scrollToTop()

    const frame = requestAnimationFrame(scrollToTop)
    return () => cancelAnimationFrame(frame)
  }, [pathname])

  useEffect(() => {
    let ticking = false

    const handleScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        setShowButton(window.scrollY > SCROLL_THRESHOLD)
        ticking = false
      })
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleClick = () => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
  }

  return (
    <button
      onClick={handleClick}
      aria-label="Voltar ao topo"
      className={cn(
        'fixed z-[60] bottom-6 right-6 p-3 rounded-full shadow-lg',
        'bg-primary text-primary-foreground',
        'hover:bg-primary/90 hover:scale-110',
        'transition-all duration-300',
        'flex items-center justify-center',
        showButton
          ? 'opacity-100 translate-y-0 pointer-events-auto'
          : 'opacity-0 translate-y-4 pointer-events-none',
      )}
    >
      <ArrowUp className="w-6 h-6" />
    </button>
  )
}
