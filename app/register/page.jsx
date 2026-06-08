'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import api from '../../lib/api'
import { useLocale } from '../../context/LocaleContext'

export default function RegisterPage() {
  const { t } = useLocale()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', termsAccepted: false })
  const set = (k, v) => setForm(f => ({...f, [k]: v}))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.termsAccepted) { toast.error('Tens de aceitar os termos para continuar'); return }
    if (form.password !== form.confirmPassword) { toast.error('Passwords não coincidem'); return }
    if (form.password.length < 8) { toast.error('Password com mínimo 8 caracteres'); return }
    setLoading(true)
    try {
      await api.post('/auth/register', { name: form.name, email: form.email, password: form.password, accountType: 'USER' })
      toast.success('Conta criada! Verifica o teu email.')
      router.push(`/verify-email?email=${encodeURIComponent(form.email)}`)
    } catch (err) {
      toast.error(err.response?.data?.error || t('common.error'))
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/"><img src="/logo.svg" alt="nauu.art" className="h-8 w-auto mx-auto mb-4" /></Link>
          <h1 className="text-2xl font-extrabold tracking-tight">Criar conta</h1>
          <p className="text-gray-400 text-sm font-medium mt-2">Junta-te à comunidade nauu.art</p>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-7 shadow-sm">
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div>
              <label className="label">{t('auth.full_name')}</label>
              <input value={form.name} onChange={e => set('name', e.target.value)}
                className="input" placeholder="O teu nome" required />
            </div>
            <div>
              <label className="label">{t('auth.email')}</label>
              <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
                className="input" placeholder="email@exemplo.com" required />
            </div>
            <div>
              <label className="label">{t('auth.password')}</label>
              <input type="password" value={form.password} onChange={e => set('password', e.target.value)}
                className="input" placeholder="Mínimo 8 caracteres" required />
            </div>
            <div>
              <label className="label">{t('auth.confirm_password')}</label>
              <input type="password" value={form.confirmPassword} onChange={e => set('confirmPassword', e.target.value)}
                className="input" placeholder="••••••••" required />
            </div>
            <label className="flex items-start gap-2.5 cursor-pointer mt-1">
              <input type="checkbox" checked={form.termsAccepted} onChange={e => set('termsAccepted', e.target.checked)}
                className="mt-0.5 w-4 h-4 accent-blue-500 flex-shrink-0" required />
              <span className="text-xs text-gray-500 leading-relaxed">
                Li e aceito os{' '}
                <a href="/termos" target="_blank" className="text-blue-500 hover:underline font-bold">Termos e Condições</a>
                {' '}e a{' '}
                <a href="/privacidade" target="_blank" className="text-blue-500 hover:underline font-bold">Política de Privacidade</a>
              </span>
            </label>
            <button type="submit" disabled={loading || !form.termsAccepted}
              className="w-full py-3 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-colors mt-2">
              {loading ? 'A criar conta…' : 'Criar conta'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-400 font-medium mt-5">
          {t('auth.have_account')}{' '}
          <Link href="/login" className="text-blue-500 font-bold hover:text-blue-600">{t('auth.login_link')}</Link>
        </p>
      </div>
    </div>
  )
}
