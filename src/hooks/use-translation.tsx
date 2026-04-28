import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { pt } from '@/lib/i18n/pt'
import { en } from '@/lib/i18n/en'

type Language = 'pt' | 'en'

interface TranslationContextType {
  t: (key: string, params?: Record<string, string | number>) => string
  language: Language
  setLanguage: (lang: Language) => void
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined)

export const useTranslation = () => {
  const context = useContext(TranslationContext)
  if (!context) throw new Error('useTranslation must be used within a TranslationProvider')
  return context
}

export const TranslationProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('language')
    if (saved === 'pt' || saved === 'en') return saved
    return navigator.language.startsWith('pt') ? 'pt' : 'en'
  })

  useEffect(() => {
    localStorage.setItem('language', language)
    document.documentElement.lang = language
  }, [language])

  const t = (key: string, params?: Record<string, string | number>) => {
    const keys = key.split('.')
    let value: any = language === 'pt' ? pt : en

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k]
      } else {
        return key // fallback to key if missing
      }
    }

    if (typeof value !== 'string') return key

    if (params) {
      return value.replace(/\{\{([^}]+)\}\}/g, (_, match) =>
        String(params[match.trim()] ?? `{{${match}}}`),
      )
    }

    return value
  }

  return (
    <TranslationContext.Provider value={{ t, language, setLanguage }}>
      {children}
    </TranslationContext.Provider>
  )
}
