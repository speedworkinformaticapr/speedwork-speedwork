import { useState } from 'react'
import { Instagram, Twitter, Facebook, Link2, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ShareButtonsProps {
  title: string
  url: string
  tags?: string[]
}

export function ShareButtons({ title, url, tags = [] }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false)
  const encodedUrl = encodeURIComponent(url)
  const encodedTitle = encodeURIComponent(title)
  const hashtags = tags.length > 0 ? tags.slice(0, 3).join(',') : 'footgolf,speedwork'

  const links = [
    {
      label: 'Instagram',
      icon: Instagram,
      href: 'https://www.instagram.com/',
      color: 'hover:bg-pink-500/10 hover:text-pink-600',
    },
    {
      label: 'X (Twitter)',
      icon: Twitter,
      href: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}&hashtags=${hashtags}`,
      color: 'hover:bg-slate-500/10 hover:text-slate-700 dark:hover:text-slate-300',
    },
    {
      label: 'Facebook',
      icon: Facebook,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      color: 'hover:bg-blue-600/10 hover:text-blue-600',
    },
  ]

  const copyLink = () => {
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-sm font-medium text-muted-foreground">Compartilhar:</span>
      {links.map(({ label, icon: Icon, href, color }) => (
        <a key={label} href={href} target="_blank" rel="noopener noreferrer" title={label}>
          <Button variant="outline" size="icon" className={color}>
            <Icon className="w-4 h-4" />
          </Button>
        </a>
      ))}
      <Button
        variant="outline"
        size="icon"
        onClick={copyLink}
        title="Copiar link"
        className="hover:bg-primary/10"
      >
        {copied ? <Check className="w-4 h-4 text-green-500" /> : <Link2 className="w-4 h-4" />}
      </Button>
    </div>
  )
}
