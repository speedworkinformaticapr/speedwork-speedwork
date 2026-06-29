import { useEffect, useState, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { format } from 'date-fns'
import { ArrowLeft, Clock, Calendar, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { blogService, BlogPost as BlogPostType, StepImage } from '@/services/blog'
import { parseMarkdown, calculateReadTime } from '@/lib/markdown'
import { distributeImagesInContent } from '@/lib/blog-content'
import { useTranslation } from '@/hooks/use-translation'
import { useSeo } from '@/hooks/use-seo'
import { ReactionBar } from '@/components/blog/ReactionBar'
import { StarRating } from '@/components/blog/StarRating'
import { ShareButtons } from '@/components/blog/ShareButtons'
import { CommentSection } from '@/components/blog/CommentSection'

export default function BlogPost() {
  const { id } = useParams<{ id: string }>()
  const { t, tf } = useTranslation()
  const [post, setPost] = useState<BlogPostType | null>(null)
  const [relatedPosts, setRelatedPosts] = useState<BlogPostType[]>([])
  const [loading, setLoading] = useState(true)

  const stepImages = useMemo<StepImage[]>(
    () => (Array.isArray(post?.step_images) ? post.step_images : []),
    [post],
  )
  const firstImage = useMemo(() => stepImages[0] || null, [stepImages])
  const lastImage = useMemo(
    () => (stepImages.length >= 2 ? stepImages[stepImages.length - 1] : null),
    [stepImages],
  )
  const middleImages = useMemo(
    () => (stepImages.length > 2 ? stepImages.slice(1, -1) : []),
    [stepImages],
  )
  const postTags = useMemo(() => (Array.isArray(post?.tags) ? (post.tags as string[]) : []), [post])

  useEffect(() => {
    if (!id) return
    const load = async () => {
      try {
        setLoading(true)
        const data = await blogService.getPostById(id)
        setPost(data)
        blogService.incrementViewCount(id)
        if (data.category) {
          const all = await blogService.getPosts()
          setRelatedPosts(
            all.filter((p) => p.category === data.category && p.id !== id).slice(0, 3),
          )
        }
      } catch {
        setPost(null)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  const pageTitle = post ? tf(post, 'title') : 'Carregando...'
  const pageDesc =
    post?.seo_description || post?.summary || (post?.content || '').substring(0, 160) || ''

  useSeo({
    title: post ? `${pageTitle} - Speedwork` : 'Carregando...',
    description: pageDesc,
    ogImage: post?.image_url || undefined,
    schema: post
      ? {
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: pageTitle,
          image: post.image_url ? [post.image_url] : [],
          datePublished: post.published_at || post.created_at,
          author: { '@type': 'Organization', name: post.author_source || 'Speedwork' },
          articleSection: post.category || undefined,
          keywords: postTags.join(', ') || undefined,
        }
      : undefined,
  })

  const contentNodes = useMemo(() => {
    if (!post) return []
    return distributeImagesInContent(parseMarkdown(tf(post, 'content')).__html, middleImages)
  }, [post, middleImages, tf])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Skeleton className="h-8 w-32 mb-8" />
        <Skeleton className="h-12 w-3/4 mb-4" />
        <Skeleton className="h-6 w-1/2 mb-8" />
        <Skeleton className="h-96 w-full mb-8 rounded-xl" />
        <div className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold mb-4">{t('blog.postNotFound')}</h2>
        <Button asChild>
          <Link to="/blog">{t('blog.backToBlog')}</Link>
        </Button>
      </div>
    )
  }

  return (
    <article className="container mx-auto px-4 py-8 max-w-4xl animate-fade-in-up">
      <Link
        to="/blog"
        className="inline-flex items-center text-primary hover:underline mb-8 font-medium"
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> {t('blog.backToBlog')}
      </Link>

      {post.category && (
        <Badge className="mb-4 bg-primary text-primary-foreground">{post.category}</Badge>
      )}
      <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-6">{pageTitle}</h1>

      <div className="flex flex-wrap items-center justify-between gap-4 mb-8 pb-6 border-b">
        <div className="flex items-center gap-6 text-muted-foreground">
          <span className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            {post.published_at
              ? format(new Date(post.published_at), 'dd/MM/yyyy')
              : format(new Date(post.created_at), 'dd/MM/yyyy')}
          </span>
          <span className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            {t('blog.readTimeLong', { time: calculateReadTime(post.content) })}
          </span>
          <span className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            {(post.view_count || 0) + 1} views
          </span>
        </div>
        <ShareButtons title={pageTitle} url={window.location.href} tags={postTags} />
      </div>

      {post.image_url && (
        <div className="mb-12 rounded-xl overflow-hidden shadow-md">
          <img
            src={post.image_url}
            alt={post.cover_alt_text || pageTitle}
            className="w-full h-auto max-h-[500px] object-cover"
          />
        </div>
      )}

      {post.introduction && (
        <div className="mb-8">
          <div
            className="prose prose-lg dark:prose-invert max-w-none text-lg font-medium text-foreground/80 border-l-4 border-primary pl-6"
            dangerouslySetInnerHTML={parseMarkdown(tf(post, 'introduction'))}
          />
          {firstImage?.url && (
            <figure className="mt-6 rounded-xl overflow-hidden">
              <img
                src={firstImage.url}
                alt={firstImage.description || 'Imagem ilustrativa'}
                className="w-full rounded-xl"
              />
              {firstImage.description && (
                <figcaption className="text-sm text-muted-foreground mt-2 text-center italic">
                  {firstImage.description}
                </figcaption>
              )}
            </figure>
          )}
        </div>
      )}

      <div className="prose prose-lg dark:prose-invert prose-headings:text-primary prose-a:text-primary hover:prose-a:text-primary/80 prose-img:rounded-xl max-w-none mb-12 text-foreground">
        {contentNodes}
      </div>

      {post.takeaways && (
        <div className="bg-primary/5 p-6 rounded-xl border border-primary/20 mb-12">
          <h3 className="font-bold text-lg mb-3 text-primary">Pontos Principais</h3>
          <div
            className="prose prose-sm dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={parseMarkdown(post.takeaways)}
          />
          {lastImage?.url && (
            <figure className="mt-6 rounded-xl overflow-hidden">
              <img
                src={lastImage.url}
                alt={lastImage.description || 'Imagem ilustrativa'}
                className="w-full rounded-xl"
              />
              {lastImage.description && (
                <figcaption className="text-sm text-muted-foreground mt-2 text-center italic">
                  {lastImage.description}
                </figcaption>
              )}
            </figure>
          )}
        </div>
      )}

      {post.conclusion && (
        <div
          className="prose prose-lg dark:prose-invert max-w-none mb-12 text-foreground"
          dangerouslySetInnerHTML={parseMarkdown(tf(post, 'conclusion'))}
        />
      )}

      {post.cta_final && (
        <div className="bg-primary text-primary-foreground p-6 rounded-xl text-center mb-12">
          <p className="text-lg font-bold">{post.cta_final}</p>
        </div>
      )}

      {postTags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-12">
          <span className="text-muted-foreground font-medium mr-2 self-center">
            {t('blog.tags')}
          </span>
          {postTags.map((tag, i) => (
            <Badge key={i} variant="secondary">
              #{tag}
            </Badge>
          ))}
        </div>
      )}

      <Separator className="my-8" />

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12">
        <div>
          <h3 className="font-bold mb-2">Reaja a este artigo</h3>
          <ReactionBar postId={post.id} />
        </div>
        <div className="md:text-right">
          <h3 className="font-bold mb-2">Avalie este artigo</h3>
          <StarRating postId={post.id} />
        </div>
      </div>

      <CommentSection postId={post.id} />

      {relatedPosts.length > 0 && (
        <section className="bg-muted/30 p-8 rounded-2xl border">
          <h3 className="text-2xl font-bold mb-6">{t('blog.relatedPosts')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedPosts.map((rp) => (
              <Link to={`/blog/${rp.id}`} key={rp.id} className="group block">
                <div className="h-32 overflow-hidden rounded-lg mb-3">
                  <img
                    src={
                      rp.image_url || `https://img.usecurling.com/p/300/200?q=golf&seed=${rp.id}`
                    }
                    alt={tf(rp, 'title')}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <h4 className="font-bold group-hover:text-primary line-clamp-2">
                  {tf(rp, 'title')}
                </h4>
              </Link>
            ))}
          </div>
        </section>
      )}
    </article>
  )
}
