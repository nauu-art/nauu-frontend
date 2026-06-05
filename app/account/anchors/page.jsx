'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Anchor, Trash2 } from 'lucide-react'
import { useAuth } from '../../../context/AuthContext'
import api from '../../../lib/api'
import toast from 'react-hot-toast'

export default function TodasAncorasPage() {
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
    try {
      await api.delete(`/favorites/${id}`)
      setAnchors(prev => prev.filter(w => w.id !== id))
      toast.success('Âncora removida')
    } catch { toast.error('Erro') }
  }

  if (loading) return null

  return (
    <div className="p-5 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Anchor size={18} className="text-blue-500" />
          <h1 className="text-xl font-extrabold text-gray-900">Todas as Âncoras</h1>
          <span className="text-sm text-gray-400">{anchors.length} obras</span>
        </div>
        <Link href="/account/favorites" className="text-xs font-bold text-gray-400 hover:text-gray-600">
          ← Voltar
        </Link>
      </div>

      {loadingData ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[1,2,3,4,5,6,7,8].map(i => <div key={i} className="aspect-[4/5] bg-white rounded-xl animate-pulse border border-gray-100" />)}
        </div>
      ) : anchors.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
          <Anchor size={40} className="text-gray-200 mx-auto mb-4" />
          <div className="text-gray-300 font-bold mb-2">Ainda não ancorastes nenhuma obra</div>
          <Link href="/explore" className="px-5 py-2.5 bg-blue-500 text-white font-bold text-sm rounded-xl">
            Explorar obras
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {anchors.map(w => (
            <div key={w.id} className="bg-white border border-gray-100 rounded-xl overflow-hidden hover:border-blue-200 transition-colors group">
              <Link href={`/artwork/${w.id}`} className="block">
                <div className="aspect-[4/5] bg-blue-50 overflow-hidden flex items-center justify-center">
                  {w.images?.[0]
                    ? <img src={w.images[0].imageUrl} alt={w.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    : <span className="text-blue-200 text-4xl font-extrabold">{w.title?.[0]}</span>}
                </div>
                <div className="p-2.5">
                  <div className="text-xs font-bold text-gray-900 truncate">{w.title}</div>
                  <div className="text-xs text-gray-400">{w.artist?.artistName}</div>
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
  )
}
