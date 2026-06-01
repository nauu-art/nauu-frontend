'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '../../../context/AuthContext'
import { useLocale } from '../../../context/LocaleContext'
import { User, Heart, Mail, LogOut, Save, ArrowRight, Bell, FolderHeart, Key, Trash2, Package, FileText } from 'lucide-react'
import api from '../../../lib/api'
import toast from 'react-hot-toast'

export default function AccountProfilePage() {
  const { user, isLoggedIn, isArtist, loading, logout } = useAuth()
  const { t } = useLocale()
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ name: '' })
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [savingPw, setSavingPw] = useState(false)
  const [deletePassword, setDeletePassword] = useState('')
  const [deletingAccount, setDeletingAccount] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  useEffect(() => {
    if (!loading && !isLoggedIn) router.push('/login')
  }, [loading, isLoggedIn])

  useEffect(() => {
    if (user) setForm({ name: user.name || '' })
  }, [user])

  const handleChangePassword = async (e) => {
    e.preventDefault()
    if (pwForm.newPassword !== pwForm.confirmPassword) { toast.error('As passwords não coincidem'); return }
    setSavingPw(true)
    try {
      await api.put('/auth/change-password', { currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword })
      toast.success('Password alterada!')
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err) { toast.error(err.response?.data?.error || 'Erro') }
    setSavingPw(false)
  }

  const handleDeleteAccount = async () => {
    setDeletingAccount(true)
    try {
      await api.delete('/auth/account', { data: { password: deletePassword } })
      toast.success('Conta eliminada')
      logout()
      router.push('/')
    } catch (err) { toast.error(err.response?.data?.error || 'Erro') }
    setDeletingAccount(false)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await api.put('/auth/profile', { name: form.name })
      toast.success('Perfil atualizado!')
    } catch { toast.error(t('common.error')) }
    setSaving(false)
  }

  if (loading || !user) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" /></div>

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-xl mx-auto px-5 py-12">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
            <User size={18} className="text-blue-500" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-gray-900" style={{letterSpacing:'-0.03em'}}>{t('nav.profile')}</h1>
            <p className="text-sm text-gray-400 font-medium mt-0.5">{user.email}</p>
          </div>
        </div>

        {/* Avatar */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 mb-4 flex items-center gap-5">
          <div className="w-16 h-16 rounded-full bg-blue-400 flex items-center justify-center text-white text-2xl font-extrabold overflow-hidden flex-shrink-0">
            {user.avatarUrl ? <img src={user.avatarUrl} className="w-full h-full object-cover" alt="" /> : user.name?.[0]}
          </div>
          <div>
            <div className="text-base font-extrabold text-gray-900">{user.name}</div>
            <div className="text-sm text-gray-400 font-medium mt-0.5">
              {isArtist ? 'Artista' : 'Utilizador'}
            </div>
          </div>
        </div>

        {/* Banner para artistas */}
        {isArtist && (
          <Link href="/dashboard/profile"
            className="flex items-center justify-between bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-4 hover:bg-blue-100 transition-colors group">
            <div>
              <div className="text-sm font-extrabold text-blue-700 mb-0.5">Perfil de artista</div>
              <div className="text-xs text-blue-500 font-medium">Edita a tua bio, foto, redes sociais e mais no dashboard</div>
            </div>
            <ArrowRight size={18} className="text-blue-400 group-hover:translate-x-1 transition-transform flex-shrink-0" />
          </Link>
        )}

        {/* Formulário */}
        <form onSubmit={handleSave} className="bg-white border border-gray-100 rounded-2xl p-6 mb-4">
          <h2 className="text-sm font-extrabold text-gray-900 mb-4">Informação pessoal</h2>
          <div className="flex flex-col gap-3">
            <div>
              <label className="label">{t('auth.full_name')}</label>
              <input value={form.name} onChange={e => setForm({ name: e.target.value })} className="input" />
            </div>
            <div>
              <label className="label">{t('auth.email')}</label>
              <input value={user.email} disabled className="input opacity-50 cursor-not-allowed" />
              <p className="text-xs text-gray-400 font-medium mt-1">O email não pode ser alterado.</p>
            </div>
          </div>
          <button type="submit" disabled={saving}
            className="mt-4 flex items-center gap-2 px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-bold text-sm rounded-xl transition-colors">
            <Save size={15} /> {saving ? t('common.saving') : t('common.save')}
          </button>
        </form>

        {/* Links rápidos */}
        <div className="bg-white border border-gray-100 rounded-2xl p-4 mb-4">
          <h2 className="text-sm font-extrabold text-gray-900 mb-3">Acesso rápido</h2>
          <div className="flex flex-col gap-1">
            <Link href="/account/collections" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors">
              <FolderHeart size={15} className="text-gray-400" />
              <span className="text-sm font-semibold text-gray-700">As minhas coleções</span>
            </Link>
            <Link href="/account/favorites" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors">
              <Heart size={15} className="text-gray-400" />
              <span className="text-sm font-semibold text-gray-700">{t('nav.favorites')}</span>
            </Link>
            <Link href="/account/contacts" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors">
              <Mail size={15} className="text-gray-400" />
              <span className="text-sm font-semibold text-gray-700">Contactos enviados</span>
            </Link>
            <Link href="/account/posts" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors">
              <FileText size={15} className="text-gray-400" />
              <span className="text-sm font-semibold text-gray-700">Os meus posts</span>
            </Link>
            <Link href="/account/orders" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors">
              <Package size={15} className="text-gray-400" />
              <span className="text-sm font-semibold text-gray-700">As minhas compras</span>
            </Link>
            <Link href="/account/notifications" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors">
              <Bell size={15} className="text-gray-400" />
              <span className="text-sm font-semibold text-gray-700">Notificações</span>
            </Link>
            {isArtist && (
              <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors">
                <ArrowRight size={15} className="text-gray-400" />
                <span className="text-sm font-semibold text-gray-700">Dashboard de artista</span>
              </Link>
            )}
          </div>
        </div>

        {/* Mudar password */}
        <form onSubmit={handleChangePassword} className="bg-white border border-gray-100 rounded-2xl p-6 mb-4">
          <h2 className="text-sm font-extrabold text-gray-900 mb-4 flex items-center gap-2">
            <Key size={15} className="text-gray-400" /> Mudar password
          </h2>
          <div className="flex flex-col gap-3">
            <div>
              <label className="label">Password atual</label>
              <input type="password" value={pwForm.currentPassword} onChange={e => setPwForm(f => ({...f, currentPassword: e.target.value}))} className="input" placeholder="••••••••" />
            </div>
            <div>
              <label className="label">Nova password</label>
              <input type="password" value={pwForm.newPassword} onChange={e => setPwForm(f => ({...f, newPassword: e.target.value}))} className="input" placeholder="Mínimo 8 caracteres" />
            </div>
            <div>
              <label className="label">Confirmar nova password</label>
              <input type="password" value={pwForm.confirmPassword} onChange={e => setPwForm(f => ({...f, confirmPassword: e.target.value}))} className="input" placeholder="••••••••" />
            </div>
          </div>
          <button type="submit" disabled={savingPw}
            className="mt-4 flex items-center gap-2 px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-bold text-sm rounded-xl transition-colors">
            <Key size={15} /> {savingPw ? 'A guardar…' : 'Alterar password'}
          </button>
        </form>

        {/* Apagar conta */}
        <div className="bg-white border border-red-100 rounded-2xl p-6 mb-4">
          <h2 className="text-sm font-extrabold text-red-500 mb-2 flex items-center gap-2">
            <Trash2 size={15} /> Apagar conta
          </h2>
          <p className="text-xs text-gray-400 font-medium mb-4">Esta ação é irreversível. Todos os teus dados serão eliminados permanentemente.</p>
          {!showDeleteConfirm ? (
            <button onClick={() => setShowDeleteConfirm(true)}
              className="px-4 py-2 border border-red-200 text-red-400 hover:bg-red-50 font-bold text-sm rounded-xl transition-colors">
              Apagar a minha conta
            </button>
          ) : (
            <div className="flex flex-col gap-3">
              <div>
                <label className="label">Confirma com a tua password</label>
                <input type="password" value={deletePassword} onChange={e => setDeletePassword(e.target.value)}
                  className="input border-red-200 focus:border-red-400" placeholder="••••••••" />
              </div>
              <div className="flex gap-2">
                <button onClick={() => { setShowDeleteConfirm(false); setDeletePassword('') }}
                  className="flex-1 py-2.5 border border-gray-200 text-gray-500 font-bold text-sm rounded-xl">
                  Cancelar
                </button>
                <button onClick={handleDeleteAccount} disabled={deletingAccount || !deletePassword}
                  className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white font-bold text-sm rounded-xl disabled:opacity-50">
                  {deletingAccount ? 'A apagar…' : 'Apagar definitivamente'}
                </button>
              </div>
            </div>
          )}
        </div>

        <button onClick={() => { logout(); router.push('/') }}
          className="flex items-center gap-2 text-sm font-bold text-red-400 hover:text-red-500 transition-colors px-3 py-2">
          <LogOut size={15} /> {t('nav.logout')}
        </button>
      </div>
    </div>
  )
}
