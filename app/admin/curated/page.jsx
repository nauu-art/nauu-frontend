'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../../context/AuthContext'
import api from '../../../lib/api'
import toast from 'react-hot-toast'
import { Plus, Edit, Trash2, Eye, EyeOff, ExternalLink } from 'lucide-react'
import Link from 'next/link'

export default function AdminCuratedPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [collections, setCollections] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', slug: '' })
  const [saving, setSaving] = useState(false)
  const [addItem, setAddItem] = useState(null)
  const [itemInput, setItemInput] = useState('')

  useEffect(() => {
    if (!loading && user?.accountType !== 'ADMIN') router.push('/')
    if (user?.accountType === 'ADMIN') fetchCollections()
  }, [loading, user])

  const fetchCollections = async () => {
    try {
      const res = await api.get('/curated/admin/all')
      setCollections(res.data || [])
    } catch {}
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await api.post('/curated', form)
      toast.success('Coleção criada!')
      setShowForm(false)
      setForm({ title: '', description: '', slug: '' })
      fetchCollections()
    } catch (err) { toast.error(err.response?.data?.error || 'Erro') }
    setSaving(false)
  }

  const togglePublished = async (col) => {
    try {
      await api.put(`/curated/${col.id}`, { published: !col.published })
      setCollections(prev => prev.map(c => c.id === col.id ? { ...c, published: !c.published } : c))
    } catch { toast.error('Erro') }
  }

  const handleDelete = async (id, title) => {
    if (!confirm(`Eliminar "${title}"?`)) return
    try {
      await api.delete(`/curated/${id}`)
      setCollections(prev => prev.filter(c => c.id !== id))
      toast.success('Eliminada')
    } catch { toast.error('Erro') }
  }

  const handleAddItem = async (colId) => {
    if (!itemInput.trim()) return
    try {
      // Tentar como artworkId primeiro, depois artistId
      await api.post(`/curated/${colId}/items`, { artworkId: itemInput.trim() })
      toast.success('Item adicionado!')
      setAddItem(null)
      setItemInput('')
    } catch {
      try {
        await api.post(`/curated/${colId}/items`, { artistId: itemInput.trim() })
        toast.success('Artista adicionado!')
        setAddItem(null)
        setItemInput('')
      } catch { toast.error('ID inválido') }
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-xl font-extrabold">Curadoria</h1>
            <p className="text-sm text-gray-400 mt-0.5">Seleções editoriais do nauu.art</p>
          </div>
          <div className="flex gap-2">
            <Link href="/admin" className="px-4 py-2 border border-gray-200 text-gray-500 font-bold text-sm rounded-xl hover:border-gray-300">
              ← Admin
            </Link>
            <button onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-bold text-sm rounded-xl">
              <Plus size={15} /> Nova coleção
            </button>
          </div>
        </div>

        {showForm && (
          <form onSubmit={handleCreate} className="bg-white border border-gray-100 rounded-2xl p-6 mb-6">
            <h2 className="text-sm font-extrabold mb-4">Nova coleção curada</h2>
            <div className="flex flex-col gap-3">
              <div>
                <label className="label">Título</label>
                <input value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))} className="input" placeholder="Ex: Fotografia Portuguesa" required />
              </div>
              <div>
                <label className="label">Slug (URL)</label>
                <input value={form.slug} onChange={e => setForm(f => ({...f, slug: e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}))} className="input" placeholder="fotografia-portuguesa" required />
              </div>
              <div>
                <label className="label">Descrição</label>
                <textarea value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} className="input resize-none" rows={2} />
              </div>
              <div className="flex gap-2">
                <button type="submit" disabled={saving} className="flex-1 py-2.5 bg-blue-500 text-white font-bold text-sm rounded-xl">
                  {saving ? 'A criar…' : 'Criar'}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2.5 border border-gray-200 text-gray-500 font-bold text-sm rounded-xl">Cancelar</button>
              </div>
            </div>
          </form>
        )}

        <div className="flex flex-col gap-4">
          {collections.map(col => (
            <div key={col.id} className="bg-white border border-gray-100 rounded-2xl p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="font-extrabold text-gray-900">{col.title}</div>
                  <div className="text-xs text-gray-400 mt-0.5">/curated/{col.slug} · {col._count?.items || 0} itens</div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Link href={`/curated/${col.slug}`} target="_blank"
                    className="w-8 h-8 border border-gray-200 rounded-lg flex items-center justify-center text-gray-400 hover:text-blue-500 hover:border-blue-300 transition-colors">
                    <ExternalLink size={13} />
                  </Link>
                  <button onClick={() => togglePublished(col)}
                    className={`w-8 h-8 border rounded-lg flex items-center justify-center transition-colors ${col.published ? 'border-green-200 text-green-500 hover:bg-green-50' : 'border-gray-200 text-gray-400 hover:border-gray-300'}`}>
                    {col.published ? <Eye size={13} /> : <EyeOff size={13} />}
                  </button>
                  <button onClick={() => setAddItem(addItem === col.id ? null : col.id)}
                    className="w-8 h-8 border border-gray-200 rounded-lg flex items-center justify-center text-gray-400 hover:border-blue-300 hover:text-blue-500 transition-colors">
                    <Plus size={13} />
                  </button>
                  <button onClick={() => handleDelete(col.id, col.title)}
                    className="w-8 h-8 border border-gray-200 rounded-lg flex items-center justify-center text-gray-400 hover:border-red-300 hover:text-red-400 transition-colors">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              {addItem === col.id && (
                <div className="mt-3 pt-3 border-t border-gray-50 flex gap-2">
                  <input value={itemInput} onChange={e => setItemInput(e.target.value)}
                    className="input flex-1 text-sm" placeholder="ID da obra ou artista" />
                  <button onClick={() => handleAddItem(col.id)} className="px-3 py-2 bg-blue-500 text-white font-bold text-xs rounded-lg">
                    Adicionar
                  </button>
                </div>
              )}

              <div className={`mt-2 text-xs font-bold px-2 py-0.5 rounded-full inline-block ${col.published ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                {col.published ? 'Publicado' : 'Rascunho'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
