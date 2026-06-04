'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '../../../context/AuthContext'
import { Save, Key, Trash2, Camera } from 'lucide-react'
import { useRef } from 'react'
import api from '../../../lib/api'
import toast from 'react-hot-toast'

export default function AccountProfilePage() {
  const { user, isLoggedIn, isArtist, loading, logout } = useAuth()
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ name: '' })
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [savingPw, setSavingPw] = useState(false)
  const [deletePassword, setDeletePassword] = useState('')
  const [deletingAccount, setDeletingAccount] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const avatarRef = useRef()

  useEffect(() => {
    if (user) setForm({ name: user.name || '' })
  }, [user])

  const handleAvatar = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarPreview(URL.createObjectURL(file))
    setUploadingAvatar(true)
    try {
      const fd = new FormData()
      fd.append('avatar', file)
      await api.post('/profile/avatar', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      toast.success('Foto atualizada!')
    } catch { toast.error('Erro ao fazer upload'); setAvatarPreview(null) }
    setUploadingAvatar(false)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await api.put('/auth/profile', { name: form.name })
      toast.success('Perfil atualizado!')
    } catch { toast.error('Erro ao guardar') }
    setSaving(false)
  }

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

  if (loading || !user) return null

  return (
    <div className="p-5 md:p-8">
      <h1 className="text-xl font-extrabold text-gray-900 mb-6">Perfil</h1>

      <div className="bg-white border border-gray-100 rounded-2xl p-5 mb-4 flex items-center gap-4">
        <div className="relative cursor-pointer group flex-shrink-0" onClick={() => avatarRef.current?.click()}>
          <div className="w-16 h-16 rounded-full bg-blue-400 flex items-center justify-center text-white text-2xl font-extrabold overflow-hidden">
            {avatarPreview ? <img src={avatarPreview} className="w-full h-full object-cover" alt="" /> : user.avatarUrl ? <img src={user.avatarUrl} className="w-full h-full object-cover" alt="" /> : user.name?.[0]}
          </div>
          <div className="absolute inset-0 rounded-full bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"><Camera size={16} className="text-white" /></div>
          <input ref={avatarRef} type="file" accept="image/*" onChange={handleAvatar} className="hidden" />
        </div>
        <div>
          <div className="font-extrabold text-gray-900">{user.name}</div>
          <div className="text-sm text-gray-400">{user.email}</div>
          <button type="button" onClick={() => avatarRef.current?.click()} className="text-xs text-blue-500 font-semibold mt-1 hover:text-blue-600 flex items-center gap-1"><Camera size={11} /> {uploadingAvatar ? "A fazer upload..." : "Alterar foto"}</button>
        </div>
      </div>



      <form onSubmit={handleSave} className="bg-white border border-gray-100 rounded-2xl p-5 mb-4">
        <h2 className="text-sm font-extrabold text-gray-900 mb-4">Informação pessoal</h2>
        <div className="flex flex-col gap-3">
          <div>
            <label className="label">Nome</label>
            <input value={form.name} onChange={e => setForm({ name: e.target.value })} className="input" />
          </div>
          <div>
            <label className="label">Email</label>
            <input value={user.email} disabled className="input opacity-50 cursor-not-allowed" />
            <p className="text-xs text-gray-400 mt-1">O email não pode ser alterado.</p>
          </div>
        </div>
        <button type="submit" disabled={saving}
          className="mt-4 flex items-center gap-2 px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-bold text-sm rounded-xl">
          <Save size={15} /> {saving ? 'A guardar…' : 'Guardar'}
        </button>
      </form>

      <form onSubmit={handleChangePassword} className="bg-white border border-gray-100 rounded-2xl p-5 mb-4">
        <h2 className="text-sm font-extrabold text-gray-900 mb-4 flex items-center gap-2">
          <Key size={15} className="text-gray-400" /> Mudar password
        </h2>
        <div className="flex flex-col gap-3">
          <div>
            <label className="label">Password atual</label>
            <input type="password" value={pwForm.currentPassword} onChange={e => setPwForm(f => ({...f, currentPassword: e.target.value}))} className="input" placeholder="••••••••" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Nova password</label>
              <input type="password" value={pwForm.newPassword} onChange={e => setPwForm(f => ({...f, newPassword: e.target.value}))} className="input" placeholder="Mínimo 8 caracteres" />
            </div>
            <div>
              <label className="label">Confirmar</label>
              <input type="password" value={pwForm.confirmPassword} onChange={e => setPwForm(f => ({...f, confirmPassword: e.target.value}))} className="input" placeholder="••••••••" />
            </div>
          </div>
        </div>
        <button type="submit" disabled={savingPw}
          className="mt-4 flex items-center gap-2 px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-bold text-sm rounded-xl">
          <Key size={15} /> {savingPw ? 'A guardar…' : 'Alterar password'}
        </button>
      </form>

      <div className="bg-white border border-red-100 rounded-2xl p-5">
        <h2 className="text-sm font-extrabold text-red-500 mb-2 flex items-center gap-2">
          <Trash2 size={15} /> Apagar conta
        </h2>
        <p className="text-xs text-gray-400 mb-4">Esta ação é irreversível. Todos os teus dados serão eliminados.</p>
        {!showDeleteConfirm ? (
          <button onClick={() => setShowDeleteConfirm(true)}
            className="px-4 py-2 border border-red-200 text-red-400 hover:bg-red-50 font-bold text-sm rounded-xl">
            Apagar a minha conta
          </button>
        ) : (
          <div className="flex flex-col gap-3">
            <input type="password" value={deletePassword} onChange={e => setDeletePassword(e.target.value)}
              className="input border-red-200" placeholder="Confirma com a tua password" />
            <div className="flex gap-2">
              <button onClick={() => { setShowDeleteConfirm(false); setDeletePassword('') }}
                className="flex-1 py-2.5 border border-gray-200 text-gray-500 font-bold text-sm rounded-xl">Cancelar</button>
              <button onClick={handleDeleteAccount} disabled={deletingAccount || !deletePassword}
                className="flex-1 py-2.5 bg-red-500 text-white font-bold text-sm rounded-xl disabled:opacity-50">
                {deletingAccount ? 'A apagar…' : 'Apagar definitivamente'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
