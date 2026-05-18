import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { blogService, BlogPost } from '@/services/blog'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar } from 'lucide-react'

export function BlogPostsGrid({ block }: { block: any }) {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)

  const limit = block.data?.limit ? parseInt(block.data.limit, 10) : 6

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        console.log(`[BlogPostsGrid] Fetching posts with limit: ${limit}`)
        const data = await blogService.getPosts()
        const activePosts = data.filter((p) => p.is_active !== false && p.status !== 'draft')
        setPosts(activePosts.slice(0, limit))
        console.log(`[BlogPostsGrid] Fetched ${activePosts.length} active posts`)
      } catch (error) {
        console.error('[BlogPostsGrid] Error fetching blog posts:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchPosts()
  }, [limit])

  return (
    <div className="container mx-auto px-4 my-16">
      <div className="text-center mb-12">
        {block.data?.title && (
          <h2
            className="text-3xl md:text-4xl font-black font-montserrat text-primary uppercase mb-4"
            dangerouslySetInnerHTML={{ __html: block.data.title }}
          />
        )}
        {block.data?.subtitle && (
          <div
            className="text-lg text-muted-foreground max-w-2xl mx-auto [&_p]:mb-2 [&_p:last-child]:mb-0"
            dangerouslySetInnerHTML={{ __html: block.data.subtitle }}
          />
        )}
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground">Nenhum post encontrado.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <Card
              key={post.id}
              className="overflow-hidden flex flex-col h-full hover:shadow-lg transition-all duration-300 border-none shadow-md group bg-card"
            >
              <div className="aspect-video w-full overflow-hidden bg-muted relative">
                {post.image_url ? (
                  <img
                    src={post.image_url}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-primary/5 text-primary">
                    <span className="font-semibold text-4xl">
                      {post.title.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                  {post.published_at && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(post.published_at).toLocaleDateString('pt-BR')}
                    </span>
                  )}
                  {post.category && (
                    <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                      {post.category}
                    </span>
                  )}
                </div>
                <h3 className="text-xl font-bold leading-tight group-hover:text-primary transition-colors line-clamp-2 mb-4">
                  <Link to={`/blog/${post.id}`} dangerouslySetInnerHTML={{ __html: post.title }} />
                </h3>
                <div
                  className="text-muted-foreground text-sm line-clamp-3 mb-6 flex-1 [&_p]:mb-2 [&_p:last-child]:mb-0"
                  dangerouslySetInnerHTML={{
                    __html:
                      post.summary ||
                      post.introduction ||
                      'Leia mais sobre este assunto clicando no botão abaixo.',
                  }}
                />
                <div className="mt-auto">
                  <Button
                    asChild
                    variant="outline"
                    className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                  >
                    <Link to={`/blog/${post.id}`}>Ler Artigo Completo</Link>
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
