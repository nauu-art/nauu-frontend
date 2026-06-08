'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Anchor, Trash2, ExternalLink } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import api from '../../lib/api'
import toast from 'react-hot-toast'

export default function AnchorsPage() {
  const { isLoggedIn, loading } = useAuth()
  const router = useRouter()
  const [anchors, setAnchors] = useState([])
  const [loadingData, setLoadingData] = useState(true)

  useEffect(() => {
    if (!loading && !isLoggedIn) router.push('/login')
  }, [loading, isLoggedIn])

  useEffect(() => {
    if (!isLoggedIn) return
    api.get('/favorites')
      .then(res => setAnchors(res.data || []))
      .catch(() => {})
      .finally(() => setLoadingData(false))
  }, [isLoggedIn])

  const handleRemove = async (id) => {
    // Optimistic UI
    setAnchors(prev => prev.filter(w => w.id !== id))
    try {
      await api.delete(`/favorites/${id}`)
    } catch {
      toast.error('Erro ao remover')
      // Reverter se falhar
      api.get('/favorites').then(res => setAnchors(res.data || []))
    }
  }

  if (loading) return null

  return (
    <div className="min-h-screen">
      <div className="max-w-5xl mx-auto px-5 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Anchor size={24} className="text-blue-500" />
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">As Minhas Âncoras</h1>
            <p className="text-sm text-gray-400 mt-0.5">{anchors.length} obras guardadas</p>
          </div>
        </div>

        {loadingData ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1,2,3,4,5,6,7,8].map(i => <div key={i} className="aspect-[4/5] bg-white rounded-xl animate-pulse border border-gray-100" />)}
          </div>
        ) : anchors.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-2xl border border-gray-100">
            <Anchor size={48} className="text-gray-200 mx-auto mb-4" />
            <div className="text-gray-300 font-bold text-xl mb-2">Ainda não ancorastes nenhuma obra</div>
            <p className="text-gray-400 text-sm mb-6">Clica na âncora em qualquer obra para a guardar aqui.</p>
            <Link href="/explore" className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold text-sm rounded-xl">
              Explorar obras
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {anchors.map(w => (
              <div key={w.id} className="bg-white border border-gray-100 rounded-xl overflow-hidden hover:border-blue-200 transition-colors group">
                <Link href={`/artwork/${w.id}`} className="block">
                  <div className="aspect-[4/5] bg-blue-50 overflow-hidden">
                    {w.images?.[0]
                      ? <img src={w.images[0].imageUrl} alt={w.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      : <div className="w-full h-full flex items-center justify-center text-blue-200 text-4xl font-extrabold">{w.title?.[0]}</div>}
                  </div>
                  <div className="p-3">
                    <div className="text-xs font-bold text-gray-900 truncate">{w.title}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{w.artist?.artistName}</div>
                    <div className="text-xs font-bold text-gray-700 mt-1">
                      {w.priceOnRequest ? 'Sob consulta' : w.price ? `€ ${Number(w.price).toFixed(2)}` : '—'}
                    </div>
                  </div>
                </Link>
                <button onClick={() => handleRemove(w.id)}
                  className="w-full flex items-center justify-center gap-1 py-1.5 text-xs text-gray-300 hover:text-red-400 hover:bg-red-50 transition-colors border-t border-gray-50">
                  <Trash2 size={11} /> Remover âncora
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
