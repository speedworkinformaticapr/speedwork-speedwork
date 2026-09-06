import React, { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Star, MessageSquareQuote } from 'lucide-react'
import { cn } from '@/lib/utils'

export function TestimonialsBlock({ data, id }: { data: any; id?: string }) {
  const [googleReviews, setGoogleReviews] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (data.useGoogleReviews) {
      setIsLoading(true)
      const fetchReviews = async () => {
        const limit = data.googleReviewsLimit ? parseInt(data.googleReviewsLimit, 10) : 10
        const order = data.googleReviewsOrder || 'time_desc'

        let query = (supabase.from('google_reviews') as any).select('*').eq('status', 'approved')

        if (order === 'rating_desc') {
          query = query.order('rating', { ascending: false }).order('time', { ascending: false })
        } else {
          query = query.order('time', { ascending: false })
        }

        const { data: reviews, error } = await query.limit(limit)

        if (!error && reviews) {
          setGoogleReviews(reviews)
        }
        setIsLoading(false)
      }
      fetchReviews()
    }
  }, [data.useGoogleReviews, data.googleReviewsLimit, data.googleReviewsOrder])

  const rawManualItems = data.items || []
  const manualItems = Array.isArray(rawManualItems)
    ? rawManualItems
        .map((item: any, originalIndex: number) => {
          const raw = item._order ?? item.order ?? originalIndex + 1
          const num = typeof raw === 'number' ? raw : parseInt(String(raw), 10) || originalIndex + 1
          return { item, originalIndex, order: num }
        })
        .sort((a: any, b: any) => {
          if (a.order !== b.order) return a.order - b.order
          return a.originalIndex - b.originalIndex
        })
        .map((entry: any) => entry.item)
    : []

  const displayItems = [
    ...manualItems.map((item: any) => ({
      author: item.author,
      text: item.text,
      image: item.image,
      rating: 5,
      isGoogle: false,
    })),
    ...googleReviews.map((review) => ({
      author: review.author_name,
      text: review.text,
      image: review.profile_photo_url,
      rating: review.rating,
      isGoogle: true,
    })),
  ]

  if (displayItems.length === 0 && !isLoading) return null

  return (
    <section
      id={id}
      className={cn('py-16 md:py-24', data.animation && `animate-${data.animation}`)}
    >
      <div className="container mx-auto px-4">
        {data.title && (
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">{data.title}</h2>
            <div className="w-24 h-1 bg-primary mx-auto rounded-full"></div>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayItems.map((item, idx) => (
              <Card
                key={idx}
                className="bg-card border border-border shadow-sm hover:shadow-md transition-shadow duration-300 h-full flex flex-col"
              >
                <CardContent className="p-8 flex flex-col h-full">
                  <div className="flex text-yellow-400 mb-6">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          'w-5 h-5',
                          i < item.rating ? 'fill-current' : 'text-muted/50',
                        )}
                      />
                    ))}
                  </div>

                  <div className="relative flex-grow">
                    <MessageSquareQuote className="absolute -top-2 -left-2 w-8 h-8 text-muted/20 -z-10" />
                    <p className="text-muted-foreground italic relative z-10 line-clamp-6">
                      "{item.text}"
                    </p>
                  </div>

                  <div className="flex items-center gap-4 mt-8 pt-6 border-t border-border">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.author}
                        className="w-12 h-12 rounded-full object-cover shadow-sm"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shadow-sm">
                        {item.author?.charAt(0) || 'U'}
                      </div>
                    )}
                    <div>
                      <h4 className="font-semibold text-foreground text-sm">{item.author}</h4>
                      {item.isGoogle ? (
                        <span className="text-[11px] text-muted-foreground font-medium flex items-center gap-1 mt-0.5">
                          <svg
                            viewBox="0 0 24 24"
                            width="14"
                            height="14"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                              fill="#4285F4"
                            />
                            <path
                              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                              fill="#34A853"
                            />
                            <path
                              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                              fill="#FBBC05"
                            />
                            <path
                              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                              fill="#EA4335"
                            />
                            <path d="M1 1h22v22H1z" fill="none" />
                          </svg>
                          Avaliação do Google
                        </span>
                      ) : (
                        <span className="text-[11px] text-muted-foreground font-medium mt-0.5 block">
                          Cliente Verificado
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
