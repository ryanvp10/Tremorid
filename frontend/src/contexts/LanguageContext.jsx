import React, { createContext, useContext, useState, useEffect } from 'react'
import translations from '../i18n/translations'

const LanguageContext = createContext()

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('tremorid-lang') || 'en'
    }
    return 'en'
  })

  useEffect(() => {
    localStorage.setItem('tremorid-lang', lang)
  }, [lang])

  const t = (key) => {
    return translations[lang]?.[key] || translations.en?.[key] || key
  }

  const toggleLang = () => setLang(prev => {
    const next = prev === 'en' ? 'id' : 'en'
    if (typeof pendo !== 'undefined') {
      pendo.track('language_changed', {
        fromLanguage: prev,
        toLanguage: next,
      })
    }
    return next
  })

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  return useContext(LanguageContext)
}
