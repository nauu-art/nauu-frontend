'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '../../../context/AuthContext'
import { Plus, Trash2, Lock, Globe, FolderHeart } from 'lucide-react'
import api from '../../../lib/api'
import toast from 'react-hot-toast'

export default function CollectionsPage() {
  const { isLoggedIn, loading } = useAuth()
  const router = useRouter()
  const [collections, setCollections] = useState([])
  const [loadingColls, setLoadingColls] = useState(true)
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [isPublic, setIsPublic] = useState(false)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    if (!loading && !isLoggedIn) router.push('/login')
  }, [loading, isLoggedIn])

  useEffect(() => {
    if (isLoggedIn) fetchCollections()
  }, [isLoggedIn])

  const fetchCollections = async () => {
    try {
      const res = await api.get('/collections')
      setCollections(res.data || [])
    } catch {}
    setLoadingColls(false)
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!newName) return
    setCreating(true)
    try {
      await api.post('/collections', { name: newName, description: newDesc, isPublic })
      toast.success('Coleção criada!')
      setNewName(''); setNewDesc(''); setIsPublic(false); setShowForm(false)
      fetchCollections()
    } catch { toast.error('Erro ao criar coleção') }
    setCreating(false)
  }

  const handleDelete = async (id, name) => {
    if (!confirm(`Eliminar coleção "${name}"?`)) return
    try {
      await api.delete(`/collections/${id}`)
      setCollections(prev => prev.filter(c => c.id !== id))
      toast.success('Coleção eliminada')
    } catch { toast.error('Erro') }
  }

  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" /></div>

  return (
    <div className="p-5 md:p-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <FolderHeart size={18} className="text-purple-500" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-gray-900">As minhas coleções</h1>
              <p className="text-sm text-gray-400 font-medium mt-0.5">{collections.length} coleções · adiciona obras com o ❤️ nos cards</p>
            </div>
          </div>
          <button onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-bold text-sm rounded-xl transition-colors">
            <Plus size={16} /> Nova coleção
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleCreate} className="bg-white border border-gray-100 rounded-2xl p-5 mb-6">
            <h2 className="text-sm font-extrabold text-gray-900 mb-4">Nova coleção</h2>
            <div className="flex flex-col gap-3">
              <div>
                <label className="label">Nome *</label>
                <input value={newName} onChange={e => setNewName(e.target.value)} className="input" placeholder="Ex: Arte Abstrata, Favoritos 2026…" required />
              </div>
              <div>
                <label className="label">Descrição (opcional)</label>
                <input value={newDesc} onChange={e => setNewDesc(e.target.value)} className="input" placeholder="Uma breve descrição…" />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={isPublic} onChange={e => setIsPublic(e.target.checked)} className="w-4 h-4 accent-blue-500" />
                <span className="text-sm font-semibold text-gray-600">Coleção pública</span>
              </label>
              <div className="flex gap-2">
                <button type="submit" disabled={creating}
                  className="px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-bold text-sm rounded-xl transition-colors">
                  {creating ? 'A criar…' : 'Criar coleção'}
                </button>
                <button type="button" onClick={() => setShowForm(false)}
                  className="px-4 py-2.5 border border-gray-200 text-gray-500 font-bold text-sm rounded-xl hover:border-gray-300 transition-colors">
                  Cancelar
                </button>
              </div>
            </div>
          </form>
        )}

        {loadingColls ? (
          <div className="grid grid-cols-2 gap-4">
            {Array.from({length:4}).map((_,i) => <div key={i} className="h-48 bg-white rounded-2xl animate-pulse" />)}
          </div>
        ) : collections.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
            <FolderHeart size={40} className="text-gray-200 mx-auto mb-4" />
            <div className="text-gray-300 font-bold text-lg mb-2">Ainda não tens coleções</div>
            <p className="text-gray-400 text-sm font-medium mb-6">Cria coleções para organizar as obras que mais gostas.</p>
            <button onClick={() => setShowForm(true)} className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-bold text-sm rounded-xl transition-colors">
              <Plus size={16} /> Criar primeira coleção
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {collections.map(col => (
              <Link key={col.id} href={`/collection/${col.id}`} className="block bg-white border border-gray-100 rounded-2xl overflow-hidden hover:border-blue-200 transition-colors group">
                {/* Preview das primeiras 4 obras */}
                <div className="grid grid-cols-2 gap-0.5 aspect-video bg-gray-50">
                  {col.items.slice(0, 4).map((item, i) => (
                    <div key={i} className="bg-blue-50 overflow-hidden">
                      {item.artwork.images?.[0]
                        ? <img src={item.artwork.images[0].imageUrl} alt="" className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center text-blue-200 font-extrabold text-2xl">{item.artwork.title?.[0]}</div>}
                    </div>
                  ))}
                  {Array.from({length: Math.max(0, 4 - col.items.length)}).map((_, i) => (
                    <div key={`empty-${i}`} className="bg-gray-100" />
                  ))}
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between mb-1">
                    <div className="text-sm font-extrabold text-gray-900">{col.name}</div>
                    <div className="flex items-center gap-1">
                      {col.isPublic
                        ? <Globe size={12} className="text-gray-400" />
                        : <Lock size={12} className="text-gray-400" />}
                      <button onClick={() => handleDelete(col.id, col.name)}
                        className="w-6 h-6 flex items-center justify-center text-gray-300 hover:text-red-400 transition-colors ml-1">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                  {col.description && <p className="text-xs text-gray-400 font-medium mb-2">{col.description}</p>}
                  <div className="text-xs text-gray-400 font-semibold">{col._count?.items || 0} obras</div>
                </div>
              </Link>
            ))}
          </div>
        )}
    </div>
  )
}
