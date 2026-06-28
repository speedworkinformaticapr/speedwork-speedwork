import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase/client'

interface Profile {
  id: string
  name?: string | null
  role?: string | null
  mfa_enabled?: boolean | null
  mfa_verified?: boolean | null
  [key: string]: any
}

interface AuthContextType {
  user: User | null
  session: Session | null
  profile: Profile | null
  roles: string[]
  activeRole: string | null
  setActiveRole: (role: string) => void
  mfaVerified: boolean
  signUp: (email: string, password: string) => Promise<{ error: any }>
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signOut: () => Promise<{ error: any }>
  loading: boolean
  validateSession: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [roles, setRoles] = useState<string[]>([])
  const [activeRoleState, setActiveRoleState] = useState<string | null>(null)
  const [mfaVerified, setMfaVerified] = useState<boolean>(false)
  const [loading, setLoading] = useState(true)

  const fetchProfileAndRoles = async (currentUser: User | null) => {
    if (!currentUser) {
      setProfile(null)
      setRoles([])
      setActiveRoleState(null)
      setMfaVerified(false)
      return
    }

    try {
      const [profileResponse, rolesResponse] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', currentUser.id).maybeSingle(),
        supabase.from('user_roles').select('role').eq('user_id', currentUser.id),
      ])

      const fetchedProfile = profileResponse.data
      const fetchedRoles = rolesResponse.data?.map((r: any) => r.role) || []

      setProfile(fetchedProfile)

      const allRoles = new Set<string>()
      if (fetchedProfile?.role) {
        allRoles.add(fetchedProfile.role.toLowerCase())
      }
      fetchedRoles.forEach((r: string) => allRoles.add(r.toLowerCase()))

      const rolesArray = Array.from(allRoles)
      setRoles(rolesArray)

      const storedRole = localStorage.getItem('activeRole')
      if (storedRole && rolesArray.includes(storedRole)) {
        setActiveRoleState(storedRole)
      } else if (rolesArray.length > 0) {
        setActiveRoleState(rolesArray[0])
        localStorage.setItem('activeRole', rolesArray[0])
      } else {
        setActiveRoleState(null)
      }

      const isMfaEnabled = fetchedProfile?.mfa_enabled ?? false
      const dbMfaVerified = fetchedProfile?.mfa_verified ?? false
      setMfaVerified(!isMfaEnabled || dbMfaVerified)
    } catch (err) {
      console.error('Error fetching roles:', err)
    }
  }

  const validateSession = async () => {
    setLoading(true)
    try {
      const {
        data: { session: currentSession },
      } = await supabase.auth.getSession()
      setSession(currentSession)
      setUser(currentSession?.user ?? null)
      if (currentSession?.user) {
        await fetchProfileAndRoles(currentSession.user)
      } else {
        setProfile(null)
        setRoles([])
        setActiveRoleState(null)
        setMfaVerified(false)
      }
    } finally {
      setLoading(false)
    }
  }

  const setActiveRole = (role: string) => {
    setActiveRoleState(role)
    localStorage.setItem('activeRole', role)
  }

  useEffect(() => {
    let mounted = true

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfileAndRoles(session.user).then(() => {
          if (mounted) setLoading(false)
        })
      } else {
        if (mounted) setLoading(false)
      }
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return
      if (event === 'INITIAL_SESSION') return

      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        setLoading(true)
        fetchProfileAndRoles(session.user).then(() => {
          if (mounted) setLoading(false)
        })
      } else {
        setProfile(null)
        setRoles([])
        setActiveRoleState(null)
        setMfaVerified(false)
        if (mounted) setLoading(false)
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/` },
    })
    return { error }
  }
  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error }
  }
  const signOut = async () => {
    if (user) {
      await supabase.from('profiles').update({ mfa_verified: false }).eq('id', user.id)
    }
    setMfaVerified(false)
    const { error } = await supabase.auth.signOut()
    return { error }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        roles,
        activeRole: activeRoleState,
        setActiveRole,
        mfaVerified,
        signUp,
        signIn,
        signOut,
        loading,
        validateSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
