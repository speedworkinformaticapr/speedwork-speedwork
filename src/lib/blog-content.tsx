import { ReactNode } from 'react'
import { StepImage } from '@/services/blog'

export function distributeImagesInContent(html: string, images: StepImage[]): ReactNode[] {
  if (!images.length) {
    return [<div key="content-full" dangerouslySetInnerHTML={{ __html: html }} />]
  }

  const raw = html.split(/(<\/p>)/)
  const chunks: string[] = []
  for (let i = 0; i < raw.length; i += 2) {
    const c = (raw[i] || '') + (raw[i + 1] || '')
    if (c.trim()) chunks.push(c)
  }

  if (!chunks.length) {
    return [<div key="content-full" dangerouslySetInnerHTML={{ __html: html }} />]
  }

  const nodes: ReactNode[] = []
  const interval = Math.max(1, Math.floor(chunks.length / (images.length + 1)))
  let imgIdx = 0

  chunks.forEach((chunk, i) => {
    nodes.push(<div key={`chunk-${i}`} dangerouslySetInnerHTML={{ __html: chunk }} />)
    if ((i + 1) % interval === 0 && imgIdx < images.length) {
      const img = images[imgIdx]
      if (img?.url) {
        nodes.push(
          <figure key={`img-${imgIdx}`} className="my-8 rounded-xl overflow-hidden">
            <img
              src={img.url}
              alt={img.description || `Imagem ${imgIdx + 1}`}
              className="w-full rounded-xl"
            />
            {img.description && (
              <figcaption className="text-sm text-muted-foreground mt-2 text-center italic">
                {img.description}
              </figcaption>
            )}
          </figure>,
        )
      }
      imgIdx++
    }
  })

  return nodes
}
