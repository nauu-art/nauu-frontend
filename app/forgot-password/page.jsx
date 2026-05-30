'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useLocale } from '../../context/LocaleContext'
import { Mail, CheckCircle } from 'lucide-react'
import api from '../../lib/api'
import toast from 'react-hot-toast'

export default function ForgotPasswordPage() {
  const { t } = useLocale()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/auth/forgot-password', { email })
      setSent(true)
    } catch { toast.error(t('common.error')) }
    setLoading(false)
  }

  if (sent) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
          <CheckCircle size={32} className="text-green-500" />
        </div>
        <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Email enviado!</h1>
        <p className="text-sm text-gray-500 font-medium mb-6 leading-relaxed">
          Se o email existir na nossa base de dados, receberás um link para redefinir a tua password. Verifica também o spam.
        </p>
        <Link href="/login" className="inline-block px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold text-sm rounded-xl transition-colors">
          Voltar ao login
        </Link>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/"><img src="/logo.svg" alt="nauu.art" className="h-8 w-auto mx-auto mb-4" /></Link>
          <h1 className="text-xl font-extrabold text-gray-900 mb-1">Recuperar password</h1>
          <p className="text-sm text-gray-400 font-medium">Envia-nos o teu email e enviamos um link.</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl p-7 shadow-sm">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="label">{t('auth.email')}</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                className="input" placeholder="o.teu@email.com" required />
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl transition-colors">
              {loading ? 'A enviar…' : 'Enviar link de recuperação'}
            </button>
          </form>
        </div>
        <p className="text-center text-sm text-gray-400 font-medium mt-5">
          <Link href="/login" className="text-blue-500 font-bold hover:text-blue-600">← Voltar ao login</Link>
        </p>
      </div>
    </div>
  )
}
