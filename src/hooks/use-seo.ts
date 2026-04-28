import { useEffect } from 'react'

export interface SeoProps {
  title?: string
  description?: string
  keywords?: string
  ogImage?: string
  canonicalUrl?: string
  schema?: Record<string, any>
}

export function useSeo({
  title = 'Footgolf PR',
  description = 'A plataforma oficial para a Federação Paranaense de Footgolf.',
  keywords = 'footgolf, parana, esporte, torneios, ranking',
  ogImage = '/og-image.png',
  canonicalUrl,
  schema,
}: SeoProps) {
  useEffect(() => {
    // Update title
    document.title = title

    // Helper to update meta tags
    const updateMetaTag = (name: string, content: string, property = false) => {
      if (!content) return
      const attr = property ? 'property' : 'name'
      let el = document.querySelector(`meta[${attr}="${name}"]`)
      if (!el) {
        el = document.createElement('meta')
        el.setAttribute(attr, name)
        document.head.appendChild(el)
      }
      el.setAttribute('content', content)
    }

    if (description) updateMetaTag('description', description)
    if (keywords) updateMetaTag('keywords', keywords)
    if (title) updateMetaTag('og:title', title, true)
    if (description) updateMetaTag('og:description', description, true)
    if (ogImage) updateMetaTag('og:image', ogImage, true)

    // Update canonical link
    let canonical = document.querySelector('link[rel="canonical"]')
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.setAttribute('rel', 'canonical')
      document.head.appendChild(canonical)
    }
    canonical.setAttribute('href', canonicalUrl || window.location.href)

    // Update JSON-LD schema
    if (schema) {
      let script = document.querySelector('script[id="schema-json-ld"]')
      if (!script) {
        script = document.createElement('script')
        script.setAttribute('type', 'application/ld+json')
        script.setAttribute('id', 'schema-json-ld')
        document.head.appendChild(script)
      }
      script.textContent = JSON.stringify(schema)
    } else {
      const script = document.querySelector('script[id="schema-json-ld"]')
      if (script) script.remove()
    }
  }, [title, description, keywords, ogImage, canonicalUrl, schema])
}
