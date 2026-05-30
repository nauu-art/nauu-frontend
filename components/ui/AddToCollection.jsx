'use client'
import { useState, useEffect } from 'react'
import { Heart, FolderHeart, Plus, X, Check } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import api from '../../lib/api'
import toast from 'react-hot-toast'
import Link from 'next/link'

export default function AddToCollection({ artworkId, className = '' }) {
  const { isLoggedIn } = useAuth()
  const [open, setOpen] = useState(false)
  const [collections, setCollections] = useState([])
  const [faved, setFaved] = useState(false)
  const [loading, setLoading] = useState(false)
  const [added, setAdded] = useState({})

  useEffect(() => {
    if (!isLoggedIn) return
    api.get('/favorites').then(res => {
      setFaved((res.data || []).some(f => f.id === artworkId))
    }).catch(() => {})
  }, [isLoggedIn, artworkId])

  const handleOpen = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!isLoggedIn) { toast.error('Faz login para guardar favoritos'); return }
    setLoading(true)
    try {
      const [favsRes, collsRes] = await Promise.all([
        api.post(`/favorites/${artworkId}`).catch(() => api.delete(`/favorites/${artworkId}`)),
        api.get('/collections')
      ])
      setFaved(true)
      setCollections(collsRes.data || [])
      setOpen(true)
    } catch {}
    setLoading(false)
  }

  const toggleFav = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!isLoggedIn) { toast.error('Faz login para guardar favoritos'); return }
    if (loading) return
    setLoading(true)
    try {
      if (faved) {
        await api.delete(`/favorites/${artworkId}`)
        setFaved(false)
        toast.success('Removido dos favoritos')
      } else {
        await api.post(`/favorites/${artworkId}`)
        setFaved(true)
        toast.success('Guardado! ❤️')
        const res = await api.get('/collections')
        setCollections(res.data || [])
        if (res.data?.length > 0) setOpen(true)
      }
    } catch { toast.error('Erro') }
    setLoading(false)
  }

  const addToCollection = async (collectionId) => {
    try {
      await api.post(`/collections/${collectionId}/items`, { artworkId })
      setAdded(prev => ({...prev, [collectionId]: true}))
      toast.success('Adicionado à coleção!')
    } catch { toast.error('Já está nesta coleção') }
  }

  return (
    <>
      <button onClick={toggleFav} disabled={loading}
        className={`flex items-center justify-center w-8 h-8 rounded-full transition-all shadow-sm ${faved ? 'bg-red-500 text-white' : 'bg-white/90 text-gray-400 hover:text-red-500'} ${className}`}>
        <Heart size={14} fill={faved ? 'currentColor' : 'none'} />
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setOpen(false)}>
          <div className="bg-white rounded-2xl p-5 w-full max-w-xs" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-extrabold text-gray-900">Adicionar a coleção</h3>
              <button onClick={() => setOpen(false)}><X size={16} className="text-gray-400" /></button>
            </div>
            {collections.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-sm text-gray-400 font-medium mb-3">Ainda não tens coleções.</p>
                <Link href="/account/collections" onClick={() => setOpen(false)}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-500 text-white font-bold text-sm rounded-xl">
                  <Plus size={14} /> Criar coleção
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {collections.map(col => (
                  <button key={col.id} onClick={() => addToCollection(col.id)}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${added[col.id] ? 'border-green-300 bg-green-50' : 'border-gray-200 hover:border-blue-300'}`}>
                    <FolderHeart size={16} className={added[col.id] ? 'text-green-500' : 'text-blue-400'} />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold text-gray-900 truncate">{col.name}</div>
                      <div className="text-xs text-gray-400">{col._count?.items || 0} obras</div>
                    </div>
                    {added[col.id] && <Check size={14} className="text-green-500 flex-shrink-0" />}
                  </button>
                ))}
                <Link href="/account/collections" onClick={() => setOpen(false)}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 border border-dashed border-gray-200 text-gray-400 hover:border-blue-300 hover:text-blue-500 font-bold text-sm rounded-xl transition-colors mt-1">
                  <Plus size={14} /> Nova coleção
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
