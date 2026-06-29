import { useState } from 'react'
import { MessageCircle, Linkedin, Mail, Link2, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ShareButtonsProps {
  title: string
  url: string
}

export function ShareButtons({ title, url }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false)
  const encodedUrl = encodeURIComponent(url)
  const encodedTitle = encodeURIComponent(title)

  const links = [
    {
      label: 'WhatsApp',
      icon: MessageCircle,
      href: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
      color: 'hover:bg-green-500/10 hover:text-green-600',
    },
    {
      label: 'LinkedIn',
      icon: Linkedin,
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      color: 'hover:bg-blue-500/10 hover:text-blue-600',
    },
    {
      label: 'Email',
      icon: Mail,
      href: `mailto:?subject=${encodedTitle}&body=${encodedUrl}`,
      color: 'hover:bg-orange-500/10 hover:text-orange-600',
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
