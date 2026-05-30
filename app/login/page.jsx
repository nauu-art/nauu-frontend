'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import api from '../../lib/api'
import { useAuth } from '../../context/AuthContext'
import { useLocale } from '../../context/LocaleContext'

export default function LoginPage() {
  const { login } = useAuth()
  const { t } = useLocale()
  const router = useRouter()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await api.post('/auth/login', form)
      login(res.data.token, res.data.user)
      toast.success(t('auth.welcome_back'))
      router.push(res.data.user.accountType === 'ARTIST' ? '/dashboard' : '/feed')
    } catch (err) {
      toast.error(err.response?.data?.error || t('common.error'))
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/"><img src="/logo.svg" alt="nauu.art" className="h-8 w-auto mx-auto" /></Link>
          <p className="text-gray-400 text-sm font-medium mt-2">{t('auth.login_title')}</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl p-7 shadow-sm">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="label">{t('auth.email')}</label>
              <input type="email" value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))}
                className="input" placeholder="o.teu@email.com" required />
            </div>
            <div>
              <label className="label">{t('auth.password')}</label>
              <input type="password" value={form.password} onChange={e => setForm(f => ({...f, password: e.target.value}))}
                className="input" placeholder="••••••••" required />
            </div>
            <div className="text-right">
              <Link href="/forgot-password" className="text-xs font-bold text-blue-500 hover:text-blue-600">
                {t('auth.forgot_password')}
              </Link>
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl transition-colors">
              {loading ? t('auth.logging_in') : t('auth.login_btn')}
            </button>
          </form>
        </div>
        <p className="text-center text-sm text-gray-400 font-medium mt-5">
          {t('auth.no_account')}{' '}
          <Link href="/register" className="text-blue-500 font-bold hover:text-blue-600">{t('auth.register_link')}</Link>
        </p>
      </div>
    </div>
  )
}
