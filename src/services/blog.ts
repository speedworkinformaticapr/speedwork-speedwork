import { supabase } from '@/lib/supabase/client'

export interface StepImage {
  url: string
  description: string
}

export interface BlogPost {
  id: string
  title: string
  summary: string | null
  introduction: string | null
  content: string | null
  conclusion: string | null
  category: string | null
  image_url: string | null
  tags: string[] | null
  author_id: string | null
  published_at: string | null
  created_at: string
  status: string
  is_active: boolean
  takeaways?: string | null
  cta_final?: string | null
  cover_alt_text?: string | null
  author_source?: string | null
  seo_description?: string | null
  view_count?: number
  step_images?: StepImage[] | null
}

export interface BlogComment {
  id: string
  post_id: string
  author_name: string
  email: string | null
  content: string
  status: string
  created_at: string
}

export interface BlogRating {
  id: string
  post_id: string
  score: number
  created_at: string
}

export interface BlogReaction {
  id: string
  post_id: string
  type: string
  created_at: string
}

export const blogService = {
  async getPosts() {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) throw error
    return (data || []) as unknown as BlogPost[]
  },

  async getPublishedPosts() {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false })
    if (error) throw error
    return (data || []) as unknown as BlogPost[]
  },

  async getPostById(id: string) {
    const { data, error } = await supabase.from('blog_posts').select('*').eq('id', id).single()
    if (error) throw error
    return data as unknown as BlogPost
  },

  async createPost(post: Partial<BlogPost>) {
    const { data, error } = await (supabase.from('blog_posts') as any).insert(post).select().single()
    if (error) throw error
    return data as unknown as BlogPost
  },

  async updatePost(id: string, post: Partial<BlogPost>) {
    const { data, error } = await (supabase
      .from('blog_posts') as any)
      .update(post)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data as unknown as BlogPost
  },

  async deletePost(id: string) {
    const { error } = await supabase.from('blog_posts').delete().eq('id', id)
    if (error) throw error
  },

  async incrementViewCount(postId: string) {
    await supabase.rpc('increment_blog_view', { post_id: postId })
  },

  async getAllTags(): Promise<string[]> {
    const { data, error } = await supabase.from('blog_posts').select('tags')
    if (error || !data) return []
    const tagSet = new Set<string>()
    data.forEach((row: any) => {
      if (Array.isArray(row.tags)) row.tags.forEach((t: string) => tagSet.add(t))
    })
    return Array.from(tagSet)
  },

  async getCategories(): Promise<string[]> {
    const { data, error } = await supabase.from('blog_posts').select('category')
    if (error || !data) return []
    const catSet = new Set<string>()
    data.forEach((row: any) => {
      if (row.category) catSet.add(row.category)
    })
    return Array.from(catSet)
  },

  async updatePostField(id: string, field: 'category' | 'status', value: string) {
    const { error } = await supabase
      .from('blog_posts')
      .update({ [field]: value })
      .eq('id', id)
    if (error) throw error
  },

  async generateImage(prompt: string, aspectRatio: '16:9' | '1:1' | '4:5' = '16:9') {
    const { data, error } = await supabase.functions.invoke('generate-ai-text', {
      body: { type: 'image', field_context: prompt, aspect_ratio: aspectRatio },
    })
    if (error) throw error
    return (data as any)?.image_url || ''
  },
}

export const commentService = {
  async getComments(postId: string) {
    const { data, error } = await supabase
      .from('blog_comments')
      .select('*')
      .eq('post_id', postId)
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
    if (error) throw error
    return (data || []) as unknown as BlogComment[]
  },

  async addComment(comment: Partial<BlogComment>) {
    const { data, error } = await (supabase
      .from('blog_comments') as any)
      .insert({ ...comment, status: 'pending' })
      .select()
      .single()
    if (error) throw error
    return data as unknown as BlogComment
  },
}

export const ratingService = {
  async getRatings(postId: string) {
    const { data, error } = await supabase
      .from('blog_ratings')
      .select('score')
      .eq('post_id', postId)
    if (error) return { average: 0, count: 0 }
    const scores = (data || []) as unknown as { score: number }[]
    if (scores.length === 0) return { average: 0, count: 0 }
    const avg = scores.reduce((s, r) => s + r.score, 0) / scores.length
    return { average: avg, count: scores.length }
  },

  async addRating(postId: string, score: number) {
    const { error } = await supabase.from('blog_ratings').insert({ post_id: postId, score })
    if (error) throw error
  },
}

export const reactionService = {
  async getReactions(postId: string) {
    const { data, error } = await supabase
      .from('blog_reactions')
      .select('type')
      .eq('post_id', postId)
    if (error || !data) return {} as Record<string, number>
    const counts: Record<string, number> = {}
    ;(data as unknown as { type: string }[]).forEach((r) => {
      counts[r.type] = (counts[r.type] || 0) + 1
    })
    return counts
  },

  async addReaction(postId: string, type: string) {
    const { error } = await supabase.from('blog_reactions').insert({ post_id: postId, type })
    if (error) throw error
  },
}
