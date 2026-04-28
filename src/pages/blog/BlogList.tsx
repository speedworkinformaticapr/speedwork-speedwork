import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import { Search, Clock, ChevronRight, Newspaper } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { PageHero } from '@/components/PageHero'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { blogService, BlogPost } from '@/services/blog'
import { calculateReadTime } from '@/lib/markdown'
import { useTranslation } from '@/hooks/use-translation'
import { useSeo } from '@/hooks/use-seo'

export default function BlogList() {
  const { t } = useTranslation()
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('Todas')
  const [page, setPage] = useState(1)
  const postsPerPage = 6

  useEffect(() => {
    loadPosts()
  }, [])

  const loadPosts = async () => {
    try {
      setLoading(true)
      const data = await blogService.getPosts()
      setPosts(data)
    } catch (error) {
      console.error('Failed to load posts', error)
    } finally {
      setLoading(false)
    }
  }

  const categories = [
    t('blog.allCategories'),
    ...Array.from(new Set(posts.map((p) => p.category).filter(Boolean))),
  ]

  const filteredPosts = posts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(search.toLowerCase()) ||
      (post.summary && post.summary.toLowerCase().includes(search.toLowerCase()))
    const matchesCategory = category === t('blog.allCategories') || post.category === category
    return matchesSearch && matchesCategory
  })

  const paginatedPosts = filteredPosts.slice((page - 1) * postsPerPage, page * postsPerPage)
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage)

  useSeo({
    title: 'Blog e Notícias - Footgolf PR',
    description:
      'Fique por dentro das últimas novidades, dicas e notícias sobre o Footgolf no Paraná.',
  })

  return (
    <div className="min-h-screen bg-gray-50 pb-24 font-sans">
      <PageHero
        title={t('blog.title') || 'Blog e Notícias'}
        description={t('blog.desc') || 'Acompanhe as últimas novidades do Footgolf no estado.'}
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Blog' }]}
        icon={<Newspaper className="w-[400px] h-[400px]" />}
      />

      <main className="container mx-auto px-4 -mt-8 relative z-20">
        <div className="bg-white rounded-2xl p-4 shadow-lg mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex overflow-x-auto pb-2 md:pb-0 gap-2 w-full md:w-auto no-scrollbar">
            {categories.map((cat) => (
              <Button
                key={cat as string}
                variant={category === cat ? 'default' : 'outline'}
                className={
                  category === cat
                    ? 'bg-[#1B7D3A] hover:bg-[#1B7D3A]/90 text-white'
                    : 'text-slate-600 border-gray-200'
                }
                onClick={() => {
                  setCategory(cat as string)
                  setPage(1)
                }}
              >
                {cat as string}
              </Button>
            ))}
          </div>
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder={t('blog.searchPlaceholder') || 'Buscar...'}
              className="pl-9 bg-gray-50 border-gray-200 focus:ring-[#1B7D3A]"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
            />
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-20 bg-slate-50 rounded-lg border border-dashed border-slate-200">
            <p className="text-slate-500 text-lg mb-4">{t('blog.noPosts')}</p>
            <Button
              variant="outline"
              onClick={() => {
                setSearch('')
                setCategory(t('blog.allCategories'))
              }}
            >
              {t('blog.clearFilters')}
            </Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {paginatedPosts.map((post) => (
                <Card
                  key={post.id}
                  className="overflow-hidden flex flex-col hover:shadow-lg transition-all duration-300 group"
                >
                  <div className="h-48 overflow-hidden relative">
                    <img
                      src={
                        post.image_url ||
                        `https://img.usecurling.com/p/400/300?q=golf&color=green&seed=${post.id}`
                      }
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {post.category && (
                      <Badge className="absolute top-4 left-4 bg-[#0052CC] hover:bg-[#0052CC]/90">
                        {post.category}
                      </Badge>
                    )}
                  </div>
                  <CardHeader className="pb-3">
                    <h3 className="text-xl font-bold text-slate-900 line-clamp-2 group-hover:text-[#1B7D3A] transition-colors">
                      {post.title}
                    </h3>
                    <div className="flex items-center text-xs text-slate-500 gap-4 mt-2">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {t('blog.readTime', { time: calculateReadTime(post.content) })}
                      </span>
                      <span>
                        {post.published_at
                          ? format(new Date(post.published_at), 'dd/MM/yyyy')
                          : format(new Date(post.created_at), 'dd/MM/yyyy')}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 pb-4">
                    <p className="text-slate-600 line-clamp-3">
                      {post.summary || post.content?.substring(0, 150) + '...'}
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button
                      asChild
                      variant="ghost"
                      className="w-full justify-between text-[#1B7D3A] hover:text-[#1B7D3A] hover:bg-green-50 group-hover:bg-green-50"
                    >
                      <Link to={`/blog/${post.id}`}>
                        {t('blog.readMore')}{' '}
                        <ChevronRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>

            {totalPages > 1 && (
              <Pagination className="justify-center mt-8">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault()
                        setPage((p) => Math.max(1, p - 1))
                      }}
                      className={page === 1 ? 'pointer-events-none opacity-50' : ''}
                    />
                  </PaginationItem>
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <PaginationItem key={i}>
                      <PaginationLink
                        href="#"
                        onClick={(e) => {
                          e.preventDefault()
                          setPage(i + 1)
                        }}
                        isActive={page === i + 1}
                      >
                        {i + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault()
                        setPage((p) => Math.min(totalPages, p + 1))
                      }}
                      className={page === totalPages ? 'pointer-events-none opacity-50' : ''}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </>
        )}
      </main>
    </div>
  )
}
