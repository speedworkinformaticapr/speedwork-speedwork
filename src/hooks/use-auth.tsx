import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase/client'

export interface Profile {
  id: string
  email: string
  name: string | null
  role: string
}

interface AuthContextType {
  user: User | null
  session: Session | null
  profile: Profile | null
  roles: string[]
  activeRole: string | null
  setActiveRole: (role: string) => void
  signUp: (
    email: string,
    password: string,
    metaData?: any,
  ) => Promise<{ user: User | null; session: Session | null; error: any }>
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signOut: () => Promise<{ error: any }>
  loading: boolean
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
  const [activeRole, setActiveRoleState] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const setActiveRole = (role: string) => {
    setActiveRoleState(role)
    localStorage.setItem('activeRole', role)
  }

  useEffect(() => {
    const fetchProfileAndRoles = async (userId: string, userEmail?: string) => {
      try {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle()

        if (profileError) {
          console.error('Error fetching profile:', profileError)
        }

        if (profileData) {
          setProfile(profileData as Profile)
        } else {
          setProfile(null)
        }

        let userRoles: string[] = []
        try {
          const { data: rolesData, error: rolesError } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', userId)

          if (!rolesError && rolesData) {
            userRoles = rolesData.map((r: any) => r.role)
          }
        } catch (e) {
          // ignore if table doesn't exist
        }

        // Combine roles from user_roles and profiles tables to prevent lockouts
        if (profileData?.role && !userRoles.includes(profileData.role)) {
          userRoles.push(profileData.role)
        }

        // Hardcoded admins to ensure they never lose access
        const adminEmails = [
          'ias2371@gmail.com',
          'souzaivan31@gmail.com',
          'admin@footgolfpr.com.br',
        ]
        const emailToCheck = profileData?.email || userEmail || ''

        if (
          adminEmails.includes(emailToCheck) &&
          !userRoles.includes('master') &&
          !userRoles.includes('admin')
        ) {
          userRoles.push('master')
        }

        if (userRoles.length === 0) {
          userRoles = ['user']
        }

        // Deduplicate roles just in case
        userRoles = Array.from(new Set(userRoles))

        setRoles(userRoles)

        const savedRole = localStorage.getItem('activeRole')
        if (savedRole && userRoles.includes(savedRole)) {
          setActiveRoleState(savedRole)
        } else {
          // If 'master' or 'admin' is available, prefer it as default immediately
          const defaultRole = userRoles.includes('master')
            ? 'master'
            : userRoles.includes('admin')
              ? 'admin'
              : userRoles[0]

          setActiveRoleState(defaultRole)
          localStorage.setItem('activeRole', defaultRole)
        }
      } catch (error) {
        console.error('Error fetching profile and roles:', error)
      }
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfileAndRoles(session.user.id, session.user.email).finally(() => setLoading(false))
      } else {
        setProfile(null)
        setRoles([])
        setActiveRoleState(null)
        localStorage.removeItem('activeRole')
        setLoading(false)
      }
    })

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfileAndRoles(session.user.id, session.user.email).finally(() => setLoading(false))
      } else {
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const signUp = async (email: string, password: string, metaData?: any) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: metaData,
      },
    })
    return { user: data?.user || null, session: data?.session || null, error }
  }

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error }
  }

  const signOut = async () => {
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
        activeRole,
        setActiveRole,
        signUp,
        signIn,
        signOut,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
