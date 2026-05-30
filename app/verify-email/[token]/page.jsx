'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, XCircle, Loader } from 'lucide-react'
import api from '../../../lib/api'

export default function VerificarEmailPage() {
  const { token } = useParams()
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    api.get(`/auth/verify-email/${token}`)
      .then(() => setStatus('success'))
      .catch(() => setStatus('error'))
  }, [token])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        {status === 'loading' && (
          <>
            <Loader size={40} className="text-blue-400 animate-spin mx-auto mb-4" />
            <h1 className="text-xl font-extrabold text-gray-900 mb-2">A verificar o teu email…</h1>
            <p className="text-sm text-gray-400 font-medium">Aguarda um momento.</p>
          </>
        )}
        {status === 'success' && (
          <>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <CheckCircle size={32} className="text-green-500" />
            </div>
            <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Email verificado!</h1>
            <p className="text-sm text-gray-500 font-medium mb-6 leading-relaxed">
              A tua conta está ativa. Já podes entrar no nauu.art!
            </p>
            <Link href="/login" className="inline-block px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold text-sm rounded-xl transition-colors">
              Fazer login
            </Link>
          </>
        )}
        {status === 'error' && (
          <>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <XCircle size={32} className="text-red-400" />
            </div>
            <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Link inválido</h1>
            <p className="text-sm text-gray-500 font-medium mb-6 leading-relaxed">
              O link de verificação é inválido ou já expirou. Tenta registar-te novamente.
            </p>
            <div className="flex gap-3 justify-center">
              <Link href="/register" className="px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-bold text-sm rounded-xl transition-colors">
                Registar
              </Link>
              <Link href="/feedback" className="px-5 py-2.5 border border-gray-200 text-gray-600 font-bold text-sm rounded-xl hover:border-blue-300 transition-colors">
                Contactar suporte
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
