import React from 'react'

export function BlockRenderer({ block }: { block: any }) {
  if (!block || !block.type || !block.data) return null

  switch (block.type) {
    case 'text':
      return (
        <div
          className="prose prose-lg max-w-none text-foreground my-8"
          dangerouslySetInnerHTML={{ __html: block.data.content || '' }}
        />
      )
    case 'image':
      return (
        <div className="my-8 flex flex-col items-center">
          <img
            src={block.data.url}
            alt={block.data.alt || 'Imagem'}
            className="w-full h-auto rounded-2xl shadow-lg max-h-[700px] object-cover"
          />
          {block.data.caption && (
            <p className="text-center text-sm text-muted-foreground mt-4 italic">
              {block.data.caption}
            </p>
          )}
        </div>
      )
    case 'video':
      return (
        <div className="my-10 aspect-video rounded-2xl overflow-hidden shadow-xl border border-muted bg-black/5">
          <iframe
            src={block.data.url}
            className="w-full h-full"
            allowFullScreen
            title="Vídeo"
            style={{ border: 'none' }}
          />
        </div>
      )
    case 'gallery': {
      const images = Array.isArray(block.data.images) ? block.data.images : []
      return (
        <div className="my-10 grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {images.map((img: any, i: number) => (
            <div
              key={i}
              className="aspect-square rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300"
            >
              <img
                src={img.url}
                alt={img.alt || `Galeria imagem ${i + 1}`}
                className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
              />
            </div>
          ))}
        </div>
      )
    }
    case 'cta':
      return (
        <div className="my-12 text-center bg-gradient-to-br from-primary/10 to-primary/5 p-10 md:p-14 rounded-3xl border border-primary/20 shadow-sm relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-2xl md:text-4xl font-extrabold text-primary mb-6">
              {block.data.text || 'Chamada para Ação'}
            </h3>
            <a
              href={block.data.link || '#'}
              className="inline-block bg-primary text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-primary/90 hover:-translate-y-1 transition-all duration-300 shadow-lg hover:shadow-primary/30"
            >
              {block.data.buttonText || 'Clique Aqui'}
            </a>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-10 -mt-10"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/5 rounded-full blur-3xl -ml-10 -mb-10"></div>
        </div>
      )
    default:
      return null
  }
}
