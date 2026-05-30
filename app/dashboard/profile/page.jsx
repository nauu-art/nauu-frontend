'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '../../../context/AuthContext'
import { LayoutDashboard, Image, Mail, User, LogOut, Save, Camera } from 'lucide-react'
import DashboardNav from '../../../components/ui/DashboardNav'
import api from '../../../lib/api'
import LocationPicker from '../../../components/ui/LocationPicker'
import toast from 'react-hot-toast'

export default function DashboardProfilePage() {
  const { user, isArtist, isLoggedIn, loading, logout } = useAuth()
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [uploadingCover, setUploadingCover] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [profile, setProfile] = useState(null)
  const avatarRef = useRef()
  const [form, setForm] = useState({
    artistName: '', bio: '', city: '', country: '',
    contactEmail: '', phone: '', websiteUrl: '',
    instagramUrl: '', behanceUrl: '', linkedinUrl: '',
    categoryIds: [],
  })
  const [categories, setCategories] = useState([])

  useEffect(() => {
    if (!loading && !isLoggedIn) router.push('/login')
    if (!loading && !isArtist) router.push('/')
  }, [loading, isLoggedIn, isArtist])

  useEffect(() => {
    api.get('/categories').then(res => setCategories(res.data || [])).catch(() => {})
  }, [])

  useEffect(() => {
    if (isArtist && user) {
      api.get('/auth/me').then(res => {
        const p = res.data.artistProfile
        if (p) {
          setProfile(p)
          setForm({
            artistName: p.artistName || '',
            bio: p.bio || '',
            city: p.city || '',
            country: p.country || '',
            contactEmail: p.contactEmail || '',
            phone: p.phone || '',
            websiteUrl: p.websiteUrl || '',
            instagramUrl: p.instagramUrl || '',
            behanceUrl: p.behanceUrl || '',
            linkedinUrl: p.linkedinUrl || '',
            categoryIds: p.categories?.map(c => c.categoryId) || [],
          })
        }
      }).catch(() => {})
    }
  }, [isArtist, user])

  const set = (k, v) => setForm(f => ({...f, [k]: v}))

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await api.put('/artists/profile', form)
      toast.success('Perfil atualizado!')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erro ao guardar')
    }
    setSaving(false)
  }

  const handleAvatar = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarPreview(URL.createObjectURL(file))
    setUploadingAvatar(true)
    try {
      const fd = new FormData()
      fd.append('avatar', file)
      await api.post('/artists/profile/avatar', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      toast.success('Foto atualizada!')
    } catch { toast.error('Erro ao fazer upload'); setAvatarPreview(null) }
    setUploadingAvatar(false)
  }

  const handleCover = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingCover(true)
    try {
      const fd = new FormData()
      fd.append('cover', file)
      await api.post('/artists/profile/cover', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      toast.success('Capa atualizada!')
      window.location.reload()
    } catch { toast.error('Erro ao fazer upload') }
    setUploadingCover(false)
  }

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/artworks', label: 'As minhas obras', icon: Image },
    { href: '/dashboard/contacts', label: 'Contactos', icon: Mail },
    { href: '/dashboard/profile', label: 'Editar perfil', icon: User, active: true },
  ]

  if (loading || !user) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" /></div>

  const avatarSrc = avatarPreview || user.avatarUrl

  return (
    <div className="flex min-h-screen bg-gray-50">
      <DashboardNav />

      <div className="flex-1 p-8">
        <div className="flex justify-between items-center mb-7">
          <h1 className="text-2xl font-extrabold tracking-tight" style={{letterSpacing:'-0.03em'}}>Editar perfil</h1>
          <div className="flex gap-2">
            <Link href={`/${profile?.username}`} className="text-sm font-bold text-gray-400 hover:text-gray-600">
              Ver perfil público →
            </Link>
            <Link href="/dashboard/profile/qrcode" className="text-sm font-bold text-blue-500 hover:text-blue-600">
              📱 QR Code
            </Link>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden mb-5">
          <div className="h-36 relative overflow-hidden bg-gradient-to-r from-blue-50 to-blue-100"
            style={{backgroundImage: profile?.coverImageUrl ? `url(${profile.coverImageUrl})` : undefined, backgroundSize:'cover', backgroundPosition:'center'}}>
            <label className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
              <div className="flex items-center gap-2 bg-white/90 px-3 py-1.5 rounded-lg text-sm font-bold text-gray-700">
                <Camera size={14} /> {uploadingCover ? 'A carregar…' : 'Alterar capa'}
              </div>
              <input type="file" accept="image/*" onChange={handleCover} className="hidden" />
            </label>
          </div>
          <div className="px-6 pb-5 flex items-end gap-5 -mt-12">
            <div className="relative flex-shrink-0">
              <div className="w-24 h-24 rounded-full border-4 border-white shadow-md overflow-hidden bg-blue-400 flex items-center justify-center">
                {avatarSrc
                  ? <img src={avatarSrc} alt={user.name} className="w-full h-full object-cover" />
                  : <span className="text-white text-3xl font-extrabold">{user.name?.[0]}</span>}
              </div>
              <label className="absolute bottom-0 right-0 w-8 h-8 bg-blue-500 hover:bg-blue-600 rounded-full flex items-center justify-center cursor-pointer shadow-md transition-colors">
                {uploadingAvatar
                  ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  : <Camera size={14} className="text-white" />}
                <input type="file" accept="image/*" onChange={handleAvatar} className="hidden" ref={avatarRef} />
              </label>
            </div>
            <div className="pb-1">
              <div className="text-lg font-extrabold text-gray-900">{form.artistName || user.name}</div>
              <div className="text-sm text-gray-400">@{profile?.username}</div>
              <div className="text-xs text-blue-500 font-semibold mt-1 cursor-pointer" onClick={() => avatarRef.current?.click()}>
                {uploadingAvatar ? 'A fazer upload…' : 'Clica no círculo para alterar a foto'}
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSave} className="grid grid-cols-3 gap-5">
          <div className="col-span-2 flex flex-col gap-5">
            <div className="bg-white border border-gray-100 rounded-xl p-5">
              <h2 className="text-sm font-extrabold text-gray-900 mb-4">Informação pública</h2>
              <div className="flex flex-col gap-3">
                <div>
                  <label className="label">Nome artístico</label>
                  <input value={form.artistName} onChange={e => set('artistName', e.target.value)} className="input" placeholder="O teu nome artístico" />
                </div>
                <div>
                  <label className="label">Bio</label>
                  <textarea value={form.bio} onChange={e => set('bio', e.target.value)} className="input resize-none" rows={4} placeholder="Conta a tua história…" />
                </div>
                <LocationPicker
                  city={form.city}
                  country={form.country}
                  onChange={({ city, country }) => setForm(f => ({...f, city, country}))}
                />
              </div>
            </div>
            <div className="bg-white border border-gray-100 rounded-xl p-5">
              <h2 className="text-sm font-extrabold text-gray-900 mb-4">Especialidades</h2>
              <p className="text-xs text-gray-400 font-medium mb-3">Seleciona as categorias que melhor descrevem o teu trabalho (máx. 5)</p>
              <div className="flex flex-wrap gap-2">
                {categories.map(cat => {
                  const selected = form.categoryIds.includes(cat.id)
                  return (
                    <button key={cat.id} type="button"
                      onClick={() => {
                        if (selected) {
                          set('categoryIds', form.categoryIds.filter(id => id !== cat.id))
                        } else if (form.categoryIds.length < 5) {
                          set('categoryIds', [...form.categoryIds, cat.id])
                        }
                      }}
                      className={`text-xs font-bold px-3 py-1.5 rounded-full border-2 transition-all ${selected ? 'bg-blue-500 border-blue-500 text-white' : 'border-gray-200 text-gray-500 hover:border-blue-300 hover:text-blue-500'}`}>
                      {cat.name}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="bg-white border border-gray-100 rounded-xl p-5">
              <h2 className="text-sm font-extrabold text-gray-900 mb-4">Redes sociais</h2>
              <div className="flex flex-col gap-3">
                {[
                  ['Instagram', 'instagramUrl', 'https://instagram.com/...'],
                  ['Behance', 'behanceUrl', 'https://behance.net/...'],
                  ['LinkedIn', 'linkedinUrl', 'https://linkedin.com/in/...'],
                  ['Website', 'websiteUrl', 'https://...'],
                ].map(([label, key, placeholder]) => (
                  <div key={key}>
                    <label className="label">{label}</label>
                    <input value={form[key]} onChange={e => set(key, e.target.value)} className="input" placeholder={placeholder} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-5">
            <div className="bg-white border border-gray-100 rounded-xl p-5">
              <h2 className="text-sm font-extrabold text-gray-900 mb-4">Contacto</h2>
              <div className="flex flex-col gap-3">
                <div>
                  <label className="label">Email público</label>
                  <input type="email" value={form.contactEmail} onChange={e => set('contactEmail', e.target.value)} className="input" placeholder="o.teu@email.com" />
                </div>
                <div>
                  <label className="label">Telefone / WhatsApp</label>
                  <input value={form.phone} onChange={e => set('phone', e.target.value)} className="input" placeholder="+351 9xx xxx xxx" />
                </div>
              </div>
            </div>
            <button type="submit" disabled={saving}
              className="w-full flex items-center justify-center gap-2 py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl transition-colors">
              <Save size={16} /> {saving ? 'A guardar…' : 'Guardar alterações'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
