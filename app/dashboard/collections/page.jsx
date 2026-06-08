'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../../context/AuthContext'
import DashboardNav from '../../../components/ui/DashboardNav'
import api from '../../../lib/api'
import toast from 'react-hot-toast'
import { Plus, Edit, Trash2, Image, Upload } from 'lucide-react'
import Link from 'next/link'

export default function DashboardCollectionsPage() {
  const { user, isArtist, isLoggedIn, loading } = useAuth()
  const router = useRouter()
  const [collections, setCollections] = useState([])
  const [loadingCols, setLoadingCols] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ name: '', description: '' })
  const [saving, setSaving] = useState(false)
  const [coverFile, setCoverFile] = useState(null)
  const [coverPreview, setCoverPreview] = useState(null)

  useEffect(() => {
    if (!loading && !isLoggedIn) router.push('/login')
    if (!loading && !isArtist) router.push('/')
  }, [loading, isLoggedIn, isArtist])

  useEffect(() => {
    if (isArtist) fetchCollections()
  }, [isArtist])

  const fetchCollections = async () => {
    setLoadingCols(true)
    try {
      const res = await api.get('/artist-collections/my/all')
      setCollections(res.data || [])
    } catch {}
    setLoadingCols(false)
  }

  const handleEdit = (col) => {
    setEditing(col.id)
    setForm({ name: col.name, description: col.description || '' })
    setCoverPreview(col.coverImageUrl)
    setCoverFile(null)
    setShowForm(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) { toast.error('Nome obrigatório'); return }
    setSaving(true)
    try {
      let colId
      if (editing) {
        await api.put(`/artist-collections/${editing}`, form)
        colId = editing
        toast.success('Coleção atualizada!')
      } else {
        const res = await api.post('/artist-collections', form)
        colId = res.data.id
        toast.success('Coleção criada!')
      }
      if (coverFile && colId) {
        const fd = new FormData()
        fd.append('cover', coverFile)
        await api.post(`/artist-collections/${colId}/cover`, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      }
      setShowForm(false)
      setEditing(null)
      setForm({ name: '', description: '' })
      setCoverFile(null)
      setCoverPreview(null)
      fetchCollections()
    } catch { toast.error('Erro ao guardar') }
    setSaving(false)
  }

  const handleDelete = async (id, name) => {
    if (!confirm(`Eliminar coleção "${name}"? As obras não serão eliminadas.`)) return
    try {
      await api.delete(`/artist-collections/${id}`)
      setCollections(prev => prev.filter(c => c.id !== id))
      toast.success('Coleção eliminada')
    } catch { toast.error('Erro') }
  }

  if (loading || !user) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" /></div>

  return (
    <div className="flex min-h-screen bg-gray-50">
      <DashboardNav />
      <div className="flex-1 md:ml-52 p-5 md:p-8 pt-20 md:pt-8 max-w-3xl">
        <div className="flex justify-between items-center mb-6 gap-3">
          <div>
            <h1 className="text-xl md:text-2xl font-extrabold tracking-tight">Coleções</h1>
            <p className="text-sm text-gray-400 font-medium mt-0.5">Agrupa as tuas obras em séries ou coleções</p>
          </div>
          {!showForm && (
            <button onClick={() => { setShowForm(true); setEditing(null); setForm({ name: '', description: '' }); setCoverPreview(null) }}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-bold text-sm rounded-xl transition-colors flex-shrink-0">
              <Plus size={16} /> Nova coleção
            </button>
          )}
        </div>

        {showForm && (
          <form onSubmit={handleSave} className="bg-white border border-gray-100 rounded-2xl p-6 mb-6">
            <h2 className="text-base font-extrabold text-gray-900 mb-5">{editing ? 'Editar coleção' : 'Nova coleção'}</h2>
            <div className="mb-4">
              <label className="label">Imagem de capa</label>
              <div className="relative h-36 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl overflow-hidden hover:border-blue-300 transition-colors cursor-pointer"
                onClick={() => document.getElementById('col-cover').click()}>
                {coverPreview
                  ? <img src={coverPreview} alt="" className="w-full h-full object-cover" />
                  : <div className="flex flex-col items-center justify-center h-full text-gray-300">
                      <Upload size={24} className="mb-2" />
                      <span className="text-sm font-bold">Clica para adicionar capa</span>
                    </div>}
                <input id="col-cover" type="file" accept="image/*" className="hidden"
                  onChange={e => { const f = e.target.files?.[0]; if(f) { setCoverFile(f); setCoverPreview(URL.createObjectURL(f)) } }} />
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <div>
                <label className="label">Nome *</label>
                <input value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))}
                  className="input" placeholder="Ex: Série Azul, Retratos de Lisboa…" required />
              </div>
              <div>
                <label className="label">Descrição</label>
                <textarea value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))}
                  className="input resize-none" rows={3} placeholder="Descreve esta coleção…" />
              </div>
              <div className="flex gap-2 pt-1">
                <button type="submit" disabled={saving}
                  className="flex-1 py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold text-sm rounded-xl">
                  {saving ? 'A guardar…' : editing ? 'Guardar alterações' : 'Criar coleção'}
                </button>
                <button type="button" onClick={() => { setShowForm(false); setEditing(null) }}
                  className="px-4 py-3 border border-gray-200 text-gray-500 font-bold text-sm rounded-xl">
                  Cancelar
                </button>
              </div>
            </div>
          </form>
        )}

        {loadingCols ? (
          <div className="space-y-3">{Array.from({length:3}).map((_,i) => <div key={i} className="h-24 bg-white rounded-2xl animate-pulse" />)}</div>
        ) : collections.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
            <div className="text-4xl mb-3">🖼️</div>
            <div className="text-gray-300 font-bold text-lg mb-2">Ainda não tens coleções</div>
            <p className="text-gray-400 text-sm font-medium">Agrupa as tuas obras em séries para contar uma história.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {collections.map(col => (
              <div key={col.id} className="bg-white border border-gray-100 rounded-2xl overflow-hidden hover:border-blue-100 transition-colors">
                <div className="flex gap-4 p-4">
                  <Link href={`/collection/${col.id}`} className="w-20 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-gray-50 flex items-center justify-center">
                    {col.coverImageUrl
                      ? <img src={col.coverImageUrl} alt={col.name} className="w-full h-full object-cover" />
                      : col.artworks?.[0]?.images?.[0]
                        ? <img src={col.artworks[0].images[0].imageUrl} alt={col.name} className="w-full h-full object-cover" />
                        : <Image size={20} className="text-gray-200" />}
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link href={`/collection/${col.id}`} className="text-base font-extrabold text-gray-900 leading-tight hover:text-blue-500 transition-colors">{col.name}</Link>
                    {col.description && <p className="text-xs text-gray-400 font-medium mt-0.5 line-clamp-1">{col.description}</p>}
                    <div className="text-xs text-blue-500 font-bold mt-1">{col._count?.artworks || 0} obras</div>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <button onClick={() => handleEdit(col)}
                      className="w-8 h-8 border border-gray-200 rounded-lg flex items-center justify-center text-gray-400 hover:border-blue-300 hover:text-blue-500 transition-colors">
                      <Edit size={13} />
                    </button>
                    <button onClick={() => handleDelete(col.id, col.name)}
                      className="w-8 h-8 border border-gray-200 rounded-lg flex items-center justify-center text-gray-400 hover:border-red-300 hover:text-red-400 transition-colors">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
