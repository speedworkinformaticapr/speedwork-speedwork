import { useEffect } from 'react'
import { useSystemData } from '@/hooks/use-system-data'
import { useLocation } from 'react-router-dom'

declare global {
  interface Window {
    dataLayer: any[]
    gtag?: (...args: any[]) => void
  }
}

export function Analytics() {
  const { data: sysData } = useSystemData()
  const location = useLocation()

  const integrations = sysData?.integrations as any
  const trackingId = integrations?.googleAnalytics?.trackingId

  useEffect(() => {
    if (!trackingId) return

    const loadGA = () => {
      let script = document.getElementById('ga-script') as HTMLScriptElement
      if (!script) {
        script = document.createElement('script')
        script.id = 'ga-script'
        script.async = true
        script.fetchPriority = 'low'
        script.src = `https://www.googletagmanager.com/gtag/js?id=${trackingId}`
        document.head.appendChild(script)

        const inlineScript = document.createElement('script')
        inlineScript.id = 'ga-inline-script'
        inlineScript.innerHTML = `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${trackingId}');
        `
        document.head.appendChild(inlineScript)
      }
    }

    // Defer GA loading to avoid competing with page rendering
    if ('requestIdleCallback' in window) {
      const idleId = (window as any).requestIdleCallback(loadGA, { timeout: 3000 })
      return () => (window as any).cancelIdleCallback(idleId)
    } else {
      const timer = setTimeout(loadGA, 1500)
      return () => clearTimeout(timer)
    }
  }, [trackingId])

  useEffect(() => {
    if (trackingId && window.gtag) {
      window.gtag('config', trackingId, {
        page_path: location.pathname + location.search,
      })
    }
  }, [location, trackingId])

  return null
}
