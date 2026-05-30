'use client'
import { useEffect, useState } from 'react'
import { Download, X } from 'lucide-react'

export default function PWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [showBanner, setShowBanner] = useState(false)

  useEffect(() => {
    // Registar service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(console.error)
    }

    // Mostrar banner de instalação
    const handler = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      const dismissed = localStorage.getItem('pwa-dismissed')
      if (!dismissed) setShowBanner(true)
    }

    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    setDeferredPrompt(null)
    setShowBanner(false)
  }

  const handleDismiss = () => {
    setShowBanner(false)
    localStorage.setItem('pwa-dismissed', '1')
  }

  if (!showBanner) return null

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 md:left-auto md:right-6 md:bottom-6 md:w-80">
      <div className="bg-black text-white rounded-2xl p-4 shadow-2xl flex items-center gap-3">
        <img src="/icon-72.png" alt="nauu.art" className="w-12 h-12 rounded-xl flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="text-sm font-extrabold">Instalar nauu.art</div>
          <div className="text-xs text-gray-400 font-medium">Adicionar ao ecrã inicial</div>
        </div>
        <button onClick={handleInstall}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-black font-bold text-xs rounded-lg flex-shrink-0">
          <Download size={12} /> Instalar
        </button>
        <button onClick={handleDismiss} className="text-gray-500 hover:text-white">
          <X size={16} />
        </button>
      </div>
    </div>
  )
}
