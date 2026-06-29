import { useEffect, useState } from 'react'
import { ThumbsUp, Heart, Lightbulb } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { reactionService } from '@/services/blog'
import { cn } from '@/lib/utils'

const REACTION_TYPES = [
  { type: 'like', label: 'Curtir', icon: ThumbsUp },
  { type: 'useful', label: 'Útil', icon: Heart },
  { type: 'interesting', label: 'Interessante', icon: Lightbulb },
]

export function ReactionBar({ postId }: { postId: string }) {
  const [counts, setCounts] = useState<Record<string, number>>({})
  const [userReactions, setUserReactions] = useState<string[]>([])

  useEffect(() => {
    const load = async () => {
      const data = await reactionService.getReactions(postId)
      setCounts(data)
      const stored = JSON.parse(localStorage.getItem(`blog_reactions_${postId}`) || '[]')
      setUserReactions(stored)
    }
    load()
  }, [postId])

  const toggle = async (type: string) => {
    if (userReactions.includes(type)) return
    try {
      await reactionService.addReaction(postId, type)
      const updated = [...userReactions, type]
      setUserReactions(updated)
      localStorage.setItem(`blog_reactions_${postId}`, JSON.stringify(updated))
      setCounts((prev) => ({ ...prev, [type]: (prev[type] || 0) + 1 }))
    } catch {
      console.error('Failed to add reaction')
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {REACTION_TYPES.map(({ type, label, icon: Icon }) => {
        const active = userReactions.includes(type)
        return (
          <Button
            key={type}
            variant={active ? 'default' : 'outline'}
            size="sm"
            onClick={() => toggle(type)}
            className={cn('gap-2 transition-all', active && 'scale-105')}
          >
            <Icon className="w-4 h-4" />
            {label}
            {counts[type] > 0 && <span className="ml-1 text-xs opacity-80">{counts[type]}</span>}
          </Button>
        )
      })}
    </div>
  )
}
