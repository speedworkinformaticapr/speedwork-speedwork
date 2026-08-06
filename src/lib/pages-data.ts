import { supabase } from '@/lib/supabase/client'
import { getCachedData, setCachedData } from '@/lib/cache'

const PAGES_CACHE_KEY = 'pages_data'
const PAGES_TTL = 5 * 60 * 1000

let fetchPromise: Promise<any[]> | null = null

export async function fetchPages(): Promise<any[]> {
  const cached = getCachedData<any[]>(PAGES_CACHE_KEY, PAGES_TTL)
  if (cached) return cached

  if (!fetchPromise) {
    fetchPromise = supabase
      .from('pages')
      .select('id, title, slug')
      .eq('is_published', true)
      .order('display_order', { ascending: true })
      .then(({ data, error }) => {
        if (error) throw error
        const pages = data || []
        setCachedData(PAGES_CACHE_KEY, pages)
        fetchPromise = null
        return pages
      })
      .catch((err) => {
        console.error('Error fetching pages:', err)
        fetchPromise = null
        return []
      })
  }

  return fetchPromise
}
