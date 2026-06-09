'use client'
import { createContext, useContext, useState, useEffect } from 'react'
import api from '../lib/api'

const FeaturesContext = createContext({ ar: true, colorPalette: true })

export function FeaturesProvider({ children }) {
  const [features, setFeatures] = useState({ ar: true, colorPalette: true })

  useEffect(() => {
    api.get('/settings').then(r => setFeatures(r.data)).catch(() => {})
  }, [])

  return (
    <FeaturesContext.Provider value={features}>
      {children}
    </FeaturesContext.Provider>
  )
}

export function useFeatures() {
  return useContext(FeaturesContext)
}
