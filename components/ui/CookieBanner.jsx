'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function CookieBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!localStorage.getItem('nauu_cookie_consent')) setVisible(true)
  }, [])

  const accept = () => { localStorage.setItem('nauu_cookie_consent', 'accepted'); setVisible(false) }
  const decline = () => { localStorage.setItem('nauu_cookie_consent', 'declined'); setVisible(false) }

  if (!visible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-5">
      <div className="max-w-3xl mx-auto bg-white border border-gray-200 rounded-2xl shadow-xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-gray-900 mb-0.5">🍪 Utilizamos cookies</p>
          <p className="text-xs text-gray-500 leading-relaxed">
            Usamos cookies essenciais para o funcionamento da plataforma e cookies de pagamento (Stripe).
            Consulta a nossa{' '}
            <Link href="/privacidade" className="text-blue-500 hover:underline font-bold">Política de Privacidade</Link>.
          </p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <button onClick={decline}
            className="px-4 py-2 border border-gray-200 text-gray-500 hover:border-gray-300 font-bold text-sm rounded-xl transition-colors">
            Recusar
          </button>
          <button onClick={accept}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-bold text-sm rounded-xl transition-colors">
            Aceitar
          </button>
        </div>
      </div>
    </div>
  )
}
