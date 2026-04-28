export function parseMarkdown(text: string | null | undefined) {
  if (!text) return { __html: '' }

  let html = text
    .replace(/^### (.*$)/gim, '<h3 class="text-xl font-bold mt-6 mb-3 text-slate-800">$1</h3>')
    .replace(
      /^## (.*$)/gim,
      '<h2 class="text-2xl font-bold mt-8 mb-4 text-slate-900 border-b pb-2">$1</h2>',
    )
    .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold mt-10 mb-5 text-slate-900">$1</h1>')
    .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/gim, '<em>$1</em>')
    .replace(
      /\[(.*?)\]\((.*?)\)/gim,
      '<a href="$2" class="text-[#0052CC] hover:underline" target="_blank">$1</a>',
    )
    .replace(/\n\n/gim, '</p><p class="mb-4 text-slate-700 leading-relaxed">')
    .replace(/\n/gim, '<br />')

  // Wrap lists
  html = html.replace(
    /(?:<br \/>)?- (.*)/gim,
    '<li class="ml-6 list-disc mb-1 text-slate-700">$1</li>',
  )

  html = `<p class="mb-4 text-slate-700 leading-relaxed">${html}</p>`

  // Clean up empty paragraphs
  html = html.replace(/<p[^>]*><\/p>/gim, '')

  return { __html: html.trim() }
}

export function calculateReadTime(text: string | null | undefined): number {
  if (!text) return 1
  const words = text.trim().split(/\s+/).length
  return Math.max(1, Math.ceil(words / 200))
}
