import { createContext, useContext, useEffect, useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'
import { useSystemData } from '@/hooks/use-system-data'

type Theme = 'dark' | 'light' | 'system'

type ThemeProviderProps = {
  children: React.ReactNode
  storageKey?: string
  defaultTheme?: Theme
}

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const initialState: ThemeProviderState = {
  theme: 'system',
  setTheme: () => null,
}

const ThemeContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
  children,
  storageKey = 'footgolf-theme',
  defaultTheme = 'system',
  ...props
}: ThemeProviderProps) {
  const { user } = useAuth()
  const { data: systemData } = useSystemData()

  const getInitialTheme = (): Theme => {
    const stored = localStorage.getItem(storageKey) as Theme
    if (stored) return stored
    return systemData?.dark_mode ? 'dark' : 'light'
  }

  const [theme, setTheme] = useState<Theme>(getInitialTheme)

  // Sincroniza com as configurações globais caso não haja tema salvo
  useEffect(() => {
    if (!localStorage.getItem(storageKey) && systemData) {
      setTheme(systemData.dark_mode ? 'dark' : 'light')
    }
  }, [systemData?.dark_mode, storageKey])

  // Restaura o tema salvo no perfil do usuário ao fazer login
  useEffect(() => {
    if (user?.user_metadata?.theme && user.user_metadata.theme !== theme) {
      setTheme(user.user_metadata.theme as Theme)
      localStorage.setItem(storageKey, user.user_metadata.theme)
    }
  }, [user, storageKey, theme])

  useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove('light', 'dark')

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
      root.classList.add(systemTheme)
      return
    }

    root.classList.add(theme)
  }, [theme])

  const value = {
    theme,
    setTheme: (newTheme: Theme) => {
      localStorage.setItem(storageKey, newTheme)
      setTheme(newTheme)
      if (user) {
        supabase.auth.updateUser({
          data: { theme: newTheme },
        })
      }
    },
  }

  return (
    <ThemeContext.Provider {...props} value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (context === undefined) throw new Error('useTheme must be used within a ThemeProvider')
  return context
}
