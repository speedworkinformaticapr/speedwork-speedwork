import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase/client'

interface AuthContextType {
  user: User | null
  session: Session | null
  profile: any | null
  roles: string[]
  signUp: (email: string, password: string) => Promise<{ error: any }>
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
  const [profile, setProfile] = useState<any | null>(null)
  const [roles, setRoles] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProfileAndRoles = async (currentUser: User) => {
      try {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', currentUser.id)
          .single()

        setProfile(profileData)

        // Tenta buscar da tabela user_roles, ignora falha caso ela não exista
        const { data: rolesData, error: rolesError } = await supabase
          .from('user_roles' as any)
          .select('role')
          .eq('user_id', currentUser.id)

        if (rolesError) {
          console.warn(
            'Tabela user_roles não encontrada ou erro na consulta. Ignorando e utilizando o role do profile.',
          )
        }

        const userRoles = rolesData?.map((r: any) => r.role) || []

        if (profileData?.role && !userRoles.includes(profileData.role)) {
          userRoles.push(profileData.role)
        }

        setRoles(userRoles)
      } catch (err) {
        console.error('Error fetching profile/roles:', err)
      } finally {
        setLoading(false)
      }
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (!session?.user) {
        setProfile(null)
        setRoles([])
        setLoading(false)
      }
    })

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfileAndRoles(session.user)
      } else {
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
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
    const { error } = await supabase.auth.signOut()
    return { error }
  }

  return (
    <AuthContext.Provider
      value={{ user, session, profile, roles, signUp, signIn, signOut, loading }}
    >
      {children}
    </AuthContext.Provider>
  )
}
