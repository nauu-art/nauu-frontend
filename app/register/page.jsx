'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import api from '../../lib/api'
import { useLocale } from '../../context/LocaleContext'
import LocationPicker from '../../components/ui/LocationPicker'

export default function RegisterPage() {
  const { t } = useLocale()
  const router = useRouter()
  const [type, setType] = useState('USER')
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    artistName: '', username: '', city: '', country: 'Portugal',
  })

  const set = (k, v) => setForm(f => ({...f, [k]: v}))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password !== form.confirmPassword) { toast.error('Passwords não coincidem'); return }
    if (form.password.length < 8) { toast.error('Password deve ter mínimo 8 caracteres'); return }
    setLoading(true)
    try {
      const payload = { ...form, accountType: type }
      if (type === 'USER') { delete payload.username; delete payload.artistName; delete payload.city; delete payload.country }
      await api.post('/auth/register', payload)
      toast.success(t('auth.account_created'))
      router.push('/verify-email')
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
          <p className="text-gray-400 text-sm font-medium mt-2">{t('auth.register_title')}</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl p-7 shadow-sm">
          <div className="flex gap-2 mb-6">
            {[['USER', `🛒 ${t('auth.buyer')}`], ['ARTIST', `🎨 ${t('auth.artist')}`]].map(([tp, label]) => (
              <button key={tp} type="button" onClick={() => setType(tp)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${type === tp ? 'bg-blue-500 text-white' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}>
                {label}
              </button>
            ))}
          </div>
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div>
              <label className="label">{t('auth.full_name')}</label>
              <input value={form.name} onChange={e => set('name', e.target.value)} className="input" placeholder={t("auth.full_name")} required />
            </div>
            {type === 'ARTIST' && (
              <>
                <div>
                  <label className="label">{t('auth.artist_name')}</label>
                  <input value={form.artistName} onChange={e => set('artistName', e.target.value)} className="input" placeholder={t("auth.artist_name")} required />
                </div>
                <div>
                  <label className="label">{t('auth.username')}</label>
                  <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden focus-within:border-blue-400 transition-colors">
                    <span className="px-3 text-xs text-gray-300 bg-gray-50 border-r border-gray-200 py-2.5 font-bold">nauu.art/</span>
                    <input value={form.username} onChange={e => set('username', e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g,''))}
                      className="flex-1 px-3 py-2.5 text-sm outline-none font-medium" placeholder="sofiam" required />
                  </div>
                </div>
                <LocationPicker
                  city={form.city}
                  country={form.country}
                  onChange={({ city, country }) => setForm(f => ({...f, city, country}))}
                />
              </>
            )}
            <div>
              <label className="label">{t('auth.email')}</label>
              <input type="email" value={form.email} onChange={e => set('email', e.target.value)} className="input" placeholder={t("contact.email_placeholder")} required />
            </div>
            <div>
              <label className="label">{t('auth.password')}</label>
              <input type="password" value={form.password} onChange={e => set('password', e.target.value)} className="input" placeholder={t("auth.password")} required />
            </div>
            <div>
              <label className="label">{t('auth.confirm_password')}</label>
              <input type="password" value={form.confirmPassword} onChange={e => set('confirmPassword', e.target.value)} className="input" placeholder="••••••••" required />
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl transition-colors mt-2">
              {loading ? t('auth.creating') : t('auth.register_btn')}
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
