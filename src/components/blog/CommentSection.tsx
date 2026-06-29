import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { MessageCircle, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { commentService, BlogComment } from '@/services/blog'
import { useToast } from '@/hooks/use-toast'
import { useTranslation } from '@/hooks/use-translation'

export function CommentSection({ postId }: { postId: string }) {
  const [comments, setComments] = useState<BlogComment[]>([])
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { toast } = useToast()
  const { t } = useTranslation()

  useEffect(() => {
    const load = async () => {
      try {
        const data = await commentService.getComments(postId)
        setComments(data)
      } catch {
        console.error('Failed to load comments')
      }
    }
    load()
  }, [postId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !content) return
    setSubmitting(true)
    try {
      await commentService.addComment({
        post_id: postId,
        author_name: name,
        email,
        content,
      })
      toast({ title: 'Comentário enviado!', description: 'Aguarda aprovação do moderador.' })
      setName('')
      setEmail('')
      setContent('')
    } catch {
      toast({ title: 'Erro', description: 'Não foi possível enviar.', variant: 'destructive' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="mb-16">
      <h3 className="text-2xl font-bold text-foreground mb-8 flex items-center gap-2">
        <MessageCircle className="h-6 w-6 text-primary" />
        {t('blog.comments', { count: comments.length })}
      </h3>
      <div className="space-y-6 mb-10">
        {comments.map((comment) => (
          <div key={comment.id} className="bg-muted/30 p-6 rounded-lg border border-border">
            <div className="flex items-center gap-3 mb-3">
              <Avatar className="h-10 w-10 border-2 border-background shadow-sm">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {comment.author_name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h4 className="font-semibold text-foreground">{comment.author_name}</h4>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(comment.created_at), 'dd/MM/yyyy HH:mm')}
                </p>
              </div>
            </div>
            <p className="text-foreground/90">{comment.content}</p>
          </div>
        ))}
        {comments.length === 0 && (
          <p className="text-muted-foreground italic bg-muted/30 p-6 rounded-lg border border-dashed border-border text-center">
            {t('blog.noComments')}
          </p>
        )}
      </div>
      <Separator className="my-6" />
      <div className="bg-card p-6 md:p-8 rounded-xl border border-border shadow-sm">
        <h4 className="text-lg font-bold mb-4 text-card-foreground">{t('blog.leaveComment')}</h4>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="c-name">{t('blog.yourName')}</Label>
              <Input
                id="c-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="c-email">E-mail</Label>
              <Input
                id="c-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="c-content">{t('blog.commentLabel')}</Label>
            <Textarea
              id="c-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              required
              className="mt-1 resize-none"
            />
          </div>
          <Button type="submit" disabled={submitting} className="bg-primary hover:bg-primary/90">
            <Send className="w-4 h-4 mr-2" />
            {submitting ? t('blog.sending') : t('blog.sendComment')}
          </Button>
        </form>
      </div>
    </section>
  )
}
