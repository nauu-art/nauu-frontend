'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../context/AuthContext'
import api from '../../lib/api'
import toast from 'react-hot-toast'
import { Upload, ArrowRight, ArrowLeft, Check } from 'lucide-react'
import LocationPicker from '../../components/ui/LocationPicker'

const CATEGORIES = [
  { key: 'pintura', label: 'Pintura', emoji: '🎨' },
  { key: 'fotografia', label: 'Fotografia', emoji: '📷' },
  { key: 'arte_digital', label: 'Arte Digital', emoji: '💻' },
  { key: 'ilustracao', label: 'Ilustração', emoji: '✏️' },
  { key: 'escultura', label: 'Escultura', emoji: '🗿' },
  { key: 'ceramica', label: 'Cerâmica', emoji: '🏺' },
  { key: 'gravura', label: 'Gravura', emoji: '🖨️' },
  { key: 'street_art', label: 'Street Art', emoji: '🎭' },
  { key: 'design_grafico', label: 'Design', emoji: '🎯' },
  { key: 'textil', label: 'Têxtil', emoji: '🧵' },
  { key: 'joalharia', label: 'Joalharia', emoji: '💍' },
  { key: 'performance', label: 'Performance', emoji: '🎪' },
]

export default function OnboardingPage() {
  const { user, loading, isLoggedIn } = useAuth()
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [accountType, setAccountType] = useState(null)
  const [form, setForm] = useState({ username: '', bio: '', city: '', country: 'Portugal', district: '', artistName: '' })
  const [interests, setInterests] = useState([])
  const [avatar, setAvatar] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [saving, setSaving] = useState(false)
  const [checkingUsername, setCheckingUsername] = useState(false)
  const [usernameAvailable, setUsernameAvailable] = useState(null)

  useEffect(() => {
    if (!loading && !isLoggedIn) router.push('/login')
    if (!loading && isLoggedIn && user?.onboardingCompleted) router.push('/')
    if (user?.accountType === 'ARTIST') setAccountType('artist')
    if (user?.username) setForm(f => ({ ...f, username: user.username }))
  }, [loading, isLoggedIn, user])

  const checkUsername = async (val) => {
    if (!val || val.length < 3) { setUsernameAvailable(null); return }
    setCheckingUsername(true)
    try {
      const userId = user?.id || ''
      await api.get(`/auth/check-username?username=${val}&userId=${userId}`)
      setUsernameAvailable(true)
    } catch { setUsernameAvailable(false) }
    setCheckingUsername(false)
  }

  useEffect(() => {
    if (!form.username || form.username.length < 3) { setUsernameAvailable(null); return }
    const timer = setTimeout(() => checkUsername(form.username), 600)
    return () => clearTimeout(timer)
  }, [form.username, user?.id])

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatar(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  const toggleInterest = (key) => {
    setInterests(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key])
  }

  const handleFinish = async () => {
    if (!form.username) { toast.error('Username obrigatório'); return }
    if (usernameAvailable === false) { toast.error('Username já em uso'); return }
    setSaving(true)
    try {
      if (avatar) {
        const fd = new FormData()
        fd.append('avatar', avatar)
        await api.post('/profile/avatar', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      }
      const res2 = await api.post('/profile/complete-onboarding', { ...form, interests, accountType })
      toast.success('Perfil criado!')
      window.location.href = res2.data.isArtist ? '/dashboard' : '/'
    } catch (err) { toast.error(err.response?.data?.error || 'Erro') }
    setSaving(false)
  }

  const totalSteps = accountType === 'artist' ? 2 : 3

  if (loading || !user) return null

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-lg">

        {/* Logo */}
        <div className="text-center mb-8">
          <img src="/logo.svg" alt="nauu.art" className="h-8 w-auto mx-auto mb-6" />
          {/* Progress */}
          <div className="flex items-center gap-2 justify-center">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i < step ? 'bg-blue-500' : 'bg-gray-200'} ${i === step - 1 ? 'w-8' : 'w-4'}`} />
            ))}
          </div>
        </div>

        {/* Step 1 — Tipo de conta */}
        {step === 1 && (
          <div className="text-center">
            <div className="text-4xl mb-4">👋</div>
            <h1 className="text-2xl font-extrabold tracking-tight mb-2">Bem-vindo ao nauu.art</h1>
            <p className="text-gray-400 font-medium mb-8">Como te descreves?</p>
            <div className="grid grid-cols-2 gap-4 mb-8">
              <button onClick={() => setAccountType('collector')}
                className={`p-6 rounded-2xl border-2 text-left transition-all ${accountType === 'collector' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white hover:border-blue-300'}`}>
                <div className="text-4xl mb-3">🖼️</div>
                <div className="font-extrabold text-gray-900 mb-1">Colecionador</div>
                <div className="text-xs text-gray-400 font-medium">Descobres e coleccionas arte que te inspira</div>
                {accountType === 'collector' && <div className="mt-3 text-blue-500"><Check size={16} /></div>}
              </button>
              <button onClick={() => setAccountType('artist')}
                className={`p-6 rounded-2xl border-2 text-left transition-all ${accountType === 'artist' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white hover:border-blue-300'}`}>
                <div className="text-4xl mb-3">🎨</div>
                <div className="font-extrabold text-gray-900 mb-1">Artista</div>
                <div className="text-xs text-gray-400 font-medium">Publicas e vendes as tuas obras</div>
                {accountType === 'artist' && <div className="mt-3 text-blue-500"><Check size={16} /></div>}
              </button>
            </div>
            <button onClick={() => accountType && setStep(2)} disabled={!accountType}
              className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl transition-colors disabled:opacity-40 flex items-center justify-center gap-2">
              Continuar <ArrowRight size={16} />
            </button>
          </div>
        )}

        {/* Step 2 — Perfil */}
        {step === 2 && (
          <div className="bg-white border border-gray-100 rounded-2xl p-6">
            <h2 className="text-xl font-extrabold tracking-tight mb-1">O teu perfil</h2>
            <p className="text-gray-400 font-medium text-sm mb-6">Como queres que te conheçam?</p>

            <div className="flex items-center gap-4 mb-6">
              <div className="relative cursor-pointer" onClick={() => document.getElementById('onb-avatar').click()}>
                <div className="w-20 h-20 rounded-full bg-blue-100 overflow-hidden flex items-center justify-center text-blue-500 font-extrabold text-2xl">
                  {avatarPreview
                    ? <img src={avatarPreview} className="w-full h-full object-cover" alt="" />
                    : <span>{user?.name?.[0]}</span>}
                </div>
                <div className="absolute bottom-0 right-0 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <Upload size={12} className="text-white" />
                </div>
                <input id="onb-avatar" type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
              </div>
              <div>
                <div className="font-bold text-gray-900">{user?.name}</div>
                <div className="text-xs text-gray-400">Clica para adicionar foto</div>
              </div>
            </div>

            <div className="flex flex-col gap-3 mb-6">
              {accountType === 'artist' && (
                <div>
                  <label className="label">Nome artístico *</label>
                  <input value={form.artistName} onChange={e => setForm(f => ({ ...f, artistName: e.target.value }))}
                    className="input" placeholder="O teu nome artístico" />
                </div>
              )}
              <div>
                <label className="label">Username *</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">@</span>
                  <input value={form.username}
                    onChange={e => {
                      const val = e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '')
                      setForm(f => ({ ...f, username: val }))
                      setUsernameAvailable(null)
                      const uid = user?.id
      if (val.length >= 3) setTimeout(() => checkUsername(val, uid), 600)
                    }}
                    className={`input pl-7 ${usernameAvailable === true ? 'border-green-400' : usernameAvailable === false ? 'border-red-400' : ''}`}
                    placeholder="o.teu.username" />
                  {checkingUsername && <div className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500" />}
                  {usernameAvailable === true && <Check size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500" />}
                </div>
                {usernameAvailable === false && <p className="text-xs text-red-400 mt-1">Username já em uso</p>}
              </div>
              <div>
                <label className="label">Bio</label>
                <textarea value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                  className="input resize-none" rows={3} placeholder="Conta-nos um pouco sobre ti…" />
              </div>
              <LocationPicker
                city={form.city}
                country={form.country}
                onChange={({ city, country, district }) => setForm(f => ({ ...f, city, country, district: district || '' }))}
              />
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="px-4 py-3 border border-gray-200 text-gray-500 font-bold rounded-xl hover:border-gray-300">
                <ArrowLeft size={16} />
              </button>
              {accountType === 'artist' ? (
                <button onClick={handleFinish} disabled={saving || !form.username || usernameAvailable === false}
                  className="flex-1 py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl disabled:opacity-40 flex items-center justify-center gap-2">
                  {saving ? 'A guardar…' : 'Começar'} {!saving && <Check size={16} />}
                </button>
              ) : (
                <button onClick={() => { if (form.username && usernameAvailable !== false) setStep(3) }}
                  disabled={!form.username || usernameAvailable === false}
                  className="flex-1 py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl disabled:opacity-40 flex items-center justify-center gap-2">
                  Continuar <ArrowRight size={16} />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Step 3 — Interesses */}
        {step === 3 && (
          <div className="bg-white border border-gray-100 rounded-2xl p-6">
            <h2 className="text-xl font-extrabold tracking-tight mb-1">O que te interessa?</h2>
            <p className="text-gray-400 font-medium text-sm mb-6">Seleciona as categorias que mais gostas — podes saltar este passo</p>
            <div className="grid grid-cols-3 gap-2 mb-6">
              {CATEGORIES.map(cat => (
                <button key={cat.key} onClick={() => toggleInterest(cat.key)}
                  className={`p-3 rounded-xl border-2 text-center transition-all ${interests.includes(cat.key) ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white hover:border-blue-300'}`}>
                  <div className="text-2xl mb-1">{cat.emoji}</div>
                  <div className="text-xs font-bold text-gray-700">{cat.label}</div>
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="px-4 py-3 border border-gray-200 text-gray-500 font-bold rounded-xl hover:border-gray-300">
                <ArrowLeft size={16} />
              </button>
              <button onClick={handleFinish} disabled={saving}
                className="flex-1 py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl disabled:opacity-40 flex items-center justify-center gap-2">
                {saving ? 'A guardar…' : 'Começar'} {!saving && <Check size={16} />}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
