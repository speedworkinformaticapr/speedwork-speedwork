import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { format } from 'date-fns'
import { ArrowLeft, Share2, Clock, MessageCircle, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'
import { blogService, commentService, BlogPost as BlogPostType, BlogComment } from '@/services/blog'
import { parseMarkdown, calculateReadTime } from '@/lib/markdown'
import { useTranslation } from '@/hooks/use-translation'
import { useSeo } from '@/hooks/use-seo'

export default function BlogPost() {
  const { id } = useParams<{ id: string }>()
  const { t } = useTranslation()
  const [post, setPost] = useState<BlogPostType | null>(null)
  const [relatedPosts, setRelatedPosts] = useState<BlogPostType[]>([])
  const [comments, setComments] = useState<BlogComment[]>([])
  const [loading, setLoading] = useState(true)

  const [newCommentName, setNewCommentName] = useState('')
  const [newCommentContent, setNewCommentContent] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const { toast } = useToast()

  useEffect(() => {
    if (id) {
      loadPost(id)
    }
  }, [id])

  const loadPost = async (postId: string) => {
    try {
      setLoading(true)
      const data = await blogService.getPostById(postId)
      setPost(data)

      const commentsData = await commentService.getComments(postId)
      setComments(commentsData)

      if (data.category) {
        const allPosts = await blogService.getPosts()
        setRelatedPosts(
          allPosts.filter((p) => p.category === data.category && p.id !== postId).slice(0, 3),
        )
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar o post.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: post?.title,
        text: post?.summary || '',
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast({
        title: 'Link copiado',
        description: 'O link foi copiado para a área de transferência.',
      })
    }
  }

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!id || !newCommentName || !newCommentContent) return

    try {
      setSubmitting(true)
      await commentService.addComment({
        post_id: id,
        author_name: newCommentName,
        content: newCommentContent,
      })

      toast({
        title: 'Comentário enviado',
        description: 'Seu comentário foi enviado e aguarda aprovação do moderador.',
      })

      setNewCommentName('')
      setNewCommentContent('')
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível enviar o comentário.',
        variant: 'destructive',
      })
    } finally {
      setSubmitting(false)
    }
  }

  useSeo({
    title: post ? `${post.title} - Footgolf PR` : 'Carregando...',
    description:
      post?.summary ||
      post?.content?.substring(0, 160) ||
      'Leia este artigo no blog oficial do Footgolf PR.',
    ogImage: post?.image_url || undefined,
    schema: post
      ? {
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: post.title,
          image: post.image_url ? [post.image_url] : [],
          datePublished: post.published_at || post.created_at,
          author: {
            '@type': 'Organization',
            name: 'Footgolf PR',
          },
        }
      : undefined,
  })

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
        <Button asChild className="bg-[#1B7D3A] hover:bg-[#1B7D3A]/90">
          <Link to="/blog">{t('blog.backToBlog')}</Link>
        </Button>
      </div>
    )
  }

  return (
    <article className="container mx-auto px-4 py-8 max-w-4xl animate-fade-in-up">
      <Link
        to="/blog"
        className="inline-flex items-center text-[#1B7D3A] hover:underline mb-8 font-medium"
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> {t('blog.backToBlog')}
      </Link>

      {post.category && (
        <Badge className="mb-4 bg-[#0052CC] hover:bg-[#0052CC]/90 text-sm py-1 px-3">
          {post.category}
        </Badge>
      )}

      <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 leading-tight mb-6">
        {post.title}
      </h1>

      <div className="flex flex-wrap items-center justify-between gap-4 mb-8 text-slate-500 pb-6 border-b">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>
              {post.published_at
                ? format(new Date(post.published_at), 'dd/MM/yyyy')
                : format(new Date(post.created_at), 'dd/MM/yyyy')}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>{t('blog.readTimeLong', { time: calculateReadTime(post.content) })}</span>
          </div>
        </div>

        <Button variant="outline" size="sm" onClick={handleShare} className="gap-2">
          <Share2 className="h-4 w-4" /> {t('blog.share')}
        </Button>
      </div>

      {post.image_url && (
        <div className="mb-12 rounded-xl overflow-hidden shadow-md">
          <img
            src={post.image_url}
            alt={post.title}
            className="w-full h-auto max-h-[500px] object-cover"
          />
        </div>
      )}

      <div
        className="prose prose-lg prose-slate max-w-none mb-16"
        dangerouslySetInnerHTML={parseMarkdown(post.content)}
      />

      {post.tags && post.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-12">
          <span className="text-slate-500 font-medium mr-2 self-center">{t('blog.tags')}</span>
          {post.tags.map((tag, i) => (
            <Badge
              key={i}
              variant="secondary"
              className="bg-slate-100 text-slate-700 hover:bg-slate-200"
            >
              #{tag}
            </Badge>
          ))}
        </div>
      )}

      <Separator className="my-12" />

      {/* Comentários */}
      <section className="mb-16">
        <h3 className="text-2xl font-bold text-slate-900 mb-8 flex items-center gap-2">
          <MessageCircle className="h-6 w-6 text-[#1B7D3A]" />
          {t('blog.comments', { count: comments.length })}
        </h3>

        <div className="space-y-6 mb-10">
          {comments.map((comment) => (
            <div key={comment.id} className="bg-slate-50 p-6 rounded-lg border border-slate-100">
              <div className="flex items-center gap-3 mb-3">
                <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                  <AvatarFallback className="bg-[#0052CC] text-white">
                    {comment.author_name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-semibold text-slate-900">{comment.author_name}</h4>
                  <p className="text-xs text-slate-500">
                    {format(new Date(comment.created_at), 'dd/MM/yyyy HH:mm')}
                  </p>
                </div>
              </div>
              <p className="text-slate-700">{comment.content}</p>
            </div>
          ))}
          {comments.length === 0 && (
            <p className="text-slate-500 italic bg-slate-50 p-6 rounded-lg border border-dashed border-slate-200 text-center">
              {t('blog.noComments')}
            </p>
          )}
        </div>

        <div className="bg-white p-6 md:p-8 rounded-xl border border-slate-200 shadow-sm">
          <h4 className="text-lg font-bold mb-4 text-slate-900">{t('blog.leaveComment')}</h4>
          <form onSubmit={handleSubmitComment} className="space-y-4">
            <div>
              <Label htmlFor="name">{t('blog.yourName')}</Label>
              <Input
                id="name"
                value={newCommentName}
                onChange={(e) => setNewCommentName(e.target.value)}
                placeholder={t('blog.namePlaceholder')}
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="comment">{t('blog.commentLabel')}</Label>
              <Textarea
                id="comment"
                value={newCommentContent}
                onChange={(e) => setNewCommentContent(e.target.value)}
                placeholder={t('blog.commentPlaceholder')}
                rows={4}
                required
                className="mt-1 resize-none"
              />
            </div>
            <Button
              type="submit"
              className="bg-[#1B7D3A] hover:bg-[#1B7D3A]/90 text-white"
              disabled={submitting}
            >
              {submitting ? t('blog.sending') : t('blog.sendComment')}
            </Button>
          </form>
        </div>
      </section>

      {/* Posts Relacionados */}
      {relatedPosts.length > 0 && (
        <section className="bg-slate-50 p-8 rounded-2xl border border-slate-100">
          <h3 className="text-2xl font-bold text-slate-900 mb-6">{t('blog.relatedPosts')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedPosts.map((relPost) => (
              <Link
                to={`/blog/${relPost.id}`}
                key={relPost.id}
                className="group cursor-pointer block"
              >
                <div className="h-32 overflow-hidden rounded-lg mb-3">
                  <img
                    src={
                      relPost.image_url ||
                      `https://img.usecurling.com/p/300/200?q=golf&seed=${relPost.id}`
                    }
                    alt={relPost.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <h4 className="font-bold text-slate-900 group-hover:text-[#0052CC] line-clamp-2 transition-colors">
                  {relPost.title}
                </h4>
              </Link>
            ))}
          </div>
        </section>
      )}
    </article>
  )
}
