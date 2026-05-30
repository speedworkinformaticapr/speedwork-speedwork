import { useEffect, useState } from 'react'
import { useAuth } from './use-auth'
import { supabase } from '@/lib/supabase/client'

export function useUserRole() {
  const { user } = useAuth()
  const [isAdmin, setIsAdmin] = useState(false)
  const [isClubAdmin, setIsClubAdmin] = useState(false)
  const [clubId, setClubId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    async function checkRoles() {
      if (!user) {
        if (mounted) {
          setIsAdmin(false)
          setIsClubAdmin(false)
          setClubId(null)
          setLoading(false)
        }
        return
      }

      try {
        const { data } = await supabase
          .from('profiles')
          .select('role, is_club, club_id')
          .eq('id', user.id)
          .maybeSingle()

        if (mounted) {
          if (data) {
            const role = data.role || 'user'
            setIsAdmin(role === 'admin' || role === 'master')
            setIsClubAdmin(!!data.is_club || role === 'club')
            setClubId(data.club_id || null)
          } else {
            setIsAdmin(false)
            setIsClubAdmin(false)
            setClubId(null)
          }
          setLoading(false)
        }
      } catch (e) {
        if (mounted) {
          setIsAdmin(false)
          setIsClubAdmin(false)
          setClubId(null)
          setLoading(false)
        }
      }
    }
    checkRoles()
    return () => {
      mounted = false
    }
  }, [user])

  return { isAdmin, isClubAdmin, clubId, loading }
}
