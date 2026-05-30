'use client'
import { createContext, useContext, useState, useEffect } from 'react'

const messages = {
  pt: null,
  en: null,
  es: null,
}

const LocaleContext = createContext(null)

export const LocaleProvider = ({ children }) => {
  const [locale, setLocale] = useState('pt')
  const [t, setT] = useState({})

  useEffect(() => {
    const saved = localStorage.getItem('nauu_locale') || 'pt'
    setLocale(saved)
    loadMessages(saved)
  }, [])

  const loadMessages = async (lang) => {
    const msgs = await import(`../messages/${lang}.json`)
    setT(msgs.default)
  }

  const changeLocale = (lang) => {
    localStorage.setItem('nauu_locale', lang)
    setLocale(lang)
    loadMessages(lang)
  }

  const translate = (key) => {
    const keys = key.split('.')
    let val = t
    for (const k of keys) {
      val = val?.[k]
      if (!val) return key
    }
    return val || key
  }

  return (
    <LocaleContext.Provider value={{ locale, changeLocale, t: translate }}>
      {children}
    </LocaleContext.Provider>
  )
}

export const useLocale = () => {
  const ctx = useContext(LocaleContext)
  if (!ctx) throw new Error('useLocale deve ser usado dentro de LocaleProvider')
  return ctx
}
