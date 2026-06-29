import { useEffect, useState } from 'react'
import { Star } from 'lucide-react'
import { ratingService } from '@/services/blog'
import { cn } from '@/lib/utils'

export function StarRating({ postId }: { postId: string }) {
  const [average, setAverage] = useState(0)
  const [count, setCount] = useState(0)
  const [userRating, setUserRating] = useState(0)
  const [hover, setHover] = useState(0)

  useEffect(() => {
    const load = async () => {
      const { average, count } = await ratingService.getRatings(postId)
      setAverage(average)
      setCount(count)
      const stored = parseInt(localStorage.getItem(`blog_rating_${postId}`) || '0')
      setUserRating(stored)
    }
    load()
  }, [postId])

  const submit = async (score: number) => {
    if (userRating > 0) return
    try {
      await ratingService.addRating(postId, score)
      setUserRating(score)
      localStorage.setItem(`blog_rating_${postId}`, String(score))
      const { average: newAvg, count: newCount } = await ratingService.getRatings(postId)
      setAverage(newAvg)
      setCount(newCount)
    } catch {
      console.error('Failed to submit rating')
    }
  }

  const displayScore = hover || userRating || Math.round(average)

  return (
    <div className="flex flex-col gap-1">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onMouseEnter={() => userRating === 0 && setHover(n)}
            onMouseLeave={() => setHover(0)}
            onClick={() => submit(n)}
            disabled={userRating > 0}
            className="transition-transform hover:scale-110 disabled:cursor-default"
          >
            <Star
              className={cn(
                'w-7 h-7',
                n <= displayScore ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/40',
              )}
            />
          </button>
        ))}
      </div>
      <span className="text-sm text-muted-foreground">
        {average > 0 ? `${average.toFixed(1)} de 5` : 'Sem avaliações'}
        {count > 0 && ` (${count} ${count === 1 ? 'avaliação' : 'avaliações'})`}
        {userRating > 0 && ' • Você avaliou!'}
      </span>
    </div>
  )
}
