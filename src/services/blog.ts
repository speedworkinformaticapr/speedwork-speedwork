import { supabase } from '@/lib/supabase/client'

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
}

export interface BlogComment {
  id: string
  post_id: string
  author_name: string
  content: string
  status: string
  created_at: string
}

export const blogService = {
  async getPosts() {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) throw error
    return data as BlogPost[]
  },

  async getPostById(id: string) {
    const { data, error } = await supabase.from('blog_posts').select('*').eq('id', id).single()
    if (error) throw error
    return data as BlogPost
  },

  async createPost(post: Partial<BlogPost>) {
    const { data, error } = await supabase.from('blog_posts').insert(post).select().single()
    if (error) throw error
    return data as BlogPost
  },

  async updatePost(id: string, post: Partial<BlogPost>) {
    const { data, error } = await supabase
      .from('blog_posts')
      .update(post)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data as BlogPost
  },

  async deletePost(id: string) {
    const { error } = await supabase.from('blog_posts').delete().eq('id', id)
    if (error) throw error
  },
}

export const commentService = {
  async getComments(postId: string) {
    const { data, error } = await supabase
      // @ts-expect-error: blog_comments is added via migration and not typed in types.ts yet
      .from('blog_comments')
      .select('*')
      .eq('post_id', postId)
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
    if (error) throw error
    return data as BlogComment[]
  },

  async addComment(comment: Partial<BlogComment>) {
    const { data, error } = await supabase
      // @ts-expect-error
      .from('blog_comments')
      .insert({ ...comment, status: 'pending' })
      .select()
      .single()
    if (error) throw error
    return data as BlogComment
  },
}
