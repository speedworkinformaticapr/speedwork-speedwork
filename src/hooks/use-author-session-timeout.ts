import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { toast } from 'sonner'

const TIMEOUT_MS = 15 * 60 * 1000
const WARNING_2_MIN_MS = 13 * 60 * 1000
const WARNING_1_MIN_MS = 14 * 60 * 1000

export function useAuthorSessionTimeout() {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const warn2MinRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const warn1MinRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const warned2Min = useRef(false)
  const warned1Min = useRef(false)

  const signOutRef = useRef(signOut)
  const navigateRef = useRef(navigate)
  signOutRef.current = signOut
  navigateRef.current = navigate

  const isAuthor = profile?.role?.toLowerCase() === 'autor'

  useEffect(() => {
    if (!isAuthor) return

    const resetTimers = () => {
      warned2Min.current = false
      warned1Min.current = false
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      if (warn2MinRef.current) clearTimeout(warn2MinRef.current)
      if (warn1MinRef.current) clearTimeout(warn1MinRef.current)

      warn2MinRef.current = setTimeout(() => {
        if (!warned2Min.current) {
          warned2Min.current = true
          toast.warning('Sua sessão expira em 2 minutos. Salve seu trabalho!')
        }
      }, WARNING_2_MIN_MS)

      warn1MinRef.current = setTimeout(() => {
        if (!warned1Min.current) {
          warned1Min.current = true
          toast.warning('Sua sessão expira em 1 minuto. Salve seu trabalho!')
        }
      }, WARNING_1_MIN_MS)

      timeoutRef.current = setTimeout(async () => {
        await signOutRef.current()
        navigateRef.current('/login')
      }, TIMEOUT_MS)
    }

    const events: (keyof WindowEventMap)[] = [
      'mousemove',
      'keydown',
      'click',
      'touchstart',
      'scroll',
    ]
    events.forEach((e) => window.addEventListener(e, resetTimers, { passive: true }))
    resetTimers()

    return () => {
      events.forEach((e) => window.removeEventListener(e, resetTimers))
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      if (warn2MinRef.current) clearTimeout(warn2MinRef.current)
      if (warn1MinRef.current) clearTimeout(warn1MinRef.current)
    }
  }, [isAuthor])
}
