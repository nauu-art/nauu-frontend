'use client'
import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useLocale } from '../../../context/LocaleContext'
import { CheckCircle, XCircle } from 'lucide-react'
import api from '../../../lib/api'
import toast from 'react-hot-toast'

export default function ResetPasswordPage() {
  const { token } = useParams()
  const { t } = useLocale()
  const router = useRouter()
  const [form, setForm] = useState({ password: '', confirm: '' })
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password !== form.confirm) { toast.error('Passwords não coincidem'); return }
    if (form.password.length < 8) { toast.error('Mínimo 8 caracteres'); return }
    setLoading(true)
    try {
      await api.post(`/auth/reset-password/${token}`, { password: form.password })
      setDone(true)
    } catch { setError(true) }
    setLoading(false)
  }

  if (done) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
          <CheckCircle size={32} className="text-green-500" />
        </div>
        <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Password atualizada!</h1>
        <p className="text-sm text-gray-500 font-medium mb-6">Já podes fazer login com a nova password.</p>
        <Link href="/login" className="inline-block px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold text-sm rounded-xl transition-colors">
          Fazer login
        </Link>
      </div>
    </div>
  )

  if (error) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-5">
          <XCircle size={32} className="text-red-400" />
        </div>
        <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Link inválido</h1>
        <p className="text-sm text-gray-500 font-medium mb-6">O link expirou ou é inválido. Pede um novo.</p>
        <Link href="/forgot-password" className="inline-block px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold text-sm rounded-xl transition-colors">
          Pedir novo link
        </Link>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/"><img src="/logo.svg" alt="nauu.art" className="h-8 w-auto mx-auto mb-4" /></Link>
          <h1 className="text-xl font-extrabold text-gray-900 mb-1">Nova password</h1>
          <p className="text-sm text-gray-400 font-medium">Define a tua nova password.</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl p-7 shadow-sm">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="label">Nova password</label>
              <input type="password" value={form.password} onChange={e => setForm(f => ({...f, password: e.target.value}))}
                className="input" placeholder="Mínimo 8 caracteres" required />
            </div>
            <div>
              <label className="label">Confirmar password</label>
              <input type="password" value={form.confirm} onChange={e => setForm(f => ({...f, confirm: e.target.value}))}
                className="input" placeholder="••••••••" required />
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl transition-colors">
              {loading ? 'A guardar…' : 'Definir nova password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
