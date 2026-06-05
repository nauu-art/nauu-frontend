'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Anchor, Package, Star, Plus, Trash2, ChevronRight } from 'lucide-react'
import { useAuth } from '../../../context/AuthContext'
import api from '../../../lib/api'
import toast from 'react-hot-toast'

export default function AncorasPage() {
  const { isLoggedIn, loading } = useAuth()
  const router = useRouter()
  const [anchors, setAnchors] = useState([])
  const [collections, setCollections] = useState([])
  const [loadingData, setLoadingData] = useState(true)

  useEffect(() => {
    if (!loading && !isLoggedIn) router.push('/login')
  }, [loading, isLoggedIn])

  useEffect(() => {
    if (!isLoggedIn) return
    Promise.all([
      api.get('/favorites'),
      api.get('/collections'),
    ]).then(([favsRes, colsRes]) => {
      setAnchors(favsRes.data || [])
      setCollections(colsRes.data || [])
    }).catch(() => {}).finally(() => setLoadingData(false))
  }, [isLoggedIn])

  const handleRemoveAnchor = async (id, title) => {
    try {
      await api.delete(`/favorites/${id}`)
      setAnchors(prev => prev.filter(w => w.id !== id))
      toast.success('Âncora removida')
    } catch { toast.error('Erro') }
  }

  const handleDeleteChest = async (id, name) => {
    if (!confirm(`Eliminar baú "${name}"?`)) return
    try {
      await api.delete(`/collections/${id}`)
      setCollections(prev => prev.filter(c => c.id !== id))
      toast.success('Baú eliminado')
    } catch { toast.error('Erro') }
  }

  if (loading) return null

  return (
    <div className="p-5 md:p-8">

      {/* Últimas Âncoras */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Anchor size={18} className="text-blue-500" />
            <h1 className="text-xl font-extrabold text-gray-900">Últimas Âncoras</h1>
            <span className="text-sm text-gray-400 font-medium">{anchors.length} obras</span>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/account/anchors" className="text-xs font-bold px-3 py-1.5 border border-gray-200 text-gray-500 hover:border-blue-300 hover:text-blue-500 rounded-lg transition-colors flex items-center gap-1">
              <Anchor size={11} /> Ver todas
            </Link>
            <Link href="/explore" className="text-xs font-bold px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center gap-1">
              <Plus size={11} /> Explorar obras
            </Link>
          </div>
        </div>

        {loadingData ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[1,2,3,4].map(i => <div key={i} className="aspect-[4/5] bg-white rounded-xl animate-pulse border border-gray-100" />)}
          </div>
        ) : anchors.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
            <Anchor size={32} className="text-gray-200 mx-auto mb-3" />
            <div className="text-gray-300 font-bold mb-1">Ainda não ancorastes nenhuma obra</div>
            <p className="text-gray-400 text-sm mb-4">Clica na âncora em qualquer obra para a guardar aqui.</p>
            <Link href="/explore" className="px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-bold text-sm rounded-xl">
              Explorar obras
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {anchors.slice(0, 8).map(w => (
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
                <button onClick={() => handleRemoveAnchor(w.id, w.title)}
                  className="w-full flex items-center justify-center gap-1 py-1.5 text-xs text-gray-300 hover:text-red-400 hover:bg-red-50 transition-colors border-t border-gray-50">
                  <Trash2 size={11} /> Remover
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Baús */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Package size={18} className="text-blue-500" />
            <h2 className="text-xl font-extrabold text-gray-900">Baús</h2>
            <span className="text-sm text-gray-400 font-medium">{collections.length} baús</span>
          </div>
<Link href="/account/collections" className="text-xs font-bold px-3 py-1.5 border border-gray-200 text-gray-500 hover:border-blue-300 hover:text-blue-500 rounded-lg transition-colors flex items-center gap-1">
            <Package size={11} /> Gerir baús
          </Link>
        </div>

        {loadingData ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[1,2,3,4].map(i => <div key={i} className="h-32 bg-white rounded-xl animate-pulse border border-gray-100" />)}
          </div>
        ) : collections.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
            <Package size={32} className="text-gray-200 mx-auto mb-3" />
            <div className="text-gray-300 font-bold mb-1">Ainda não tens baús</div>
            <p className="text-gray-400 text-sm mb-4">Mantém pressionado a âncora numa obra para criar um baú.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {collections.map(col => (
              <Link key={col.id} href={`/collection/${col.id}`}
                className="bg-white border border-gray-100 rounded-xl overflow-hidden hover:border-blue-200 transition-colors group block">
                {/* Preview 4 obras */}
                <div className="grid grid-cols-2 gap-0.5 aspect-square bg-gray-50">
                  {col.items?.slice(0, 4).map((item, i) => (
                    <div key={i} className="bg-gray-100 overflow-hidden">
                      {item.artwork?.images?.[0]
                        ? <img src={item.artwork.images[0].imageUrl} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        : <div className="w-full h-full" />}
                    </div>
                  ))}
                  {Array.from({length: Math.max(0, 4 - (col.items?.length || 0))}).map((_, i) => (
                    <div key={`e-${i}`} className="bg-gray-100" />
                  ))}
                </div>
                <div className="p-3 flex items-center gap-2">
                  {col.isDefault
                    ? <Star size={14} className="text-amber-400 flex-shrink-0" fill="currentColor" />
                    : <Package size={14} className="text-blue-400 flex-shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-extrabold text-gray-900 truncate">{col.name}</div>
                    <div className="text-xs text-gray-400">{col._count?.items || 0} obras</div>
                  </div>
                  <button
                    onClick={e => { e.preventDefault(); e.stopPropagation(); handleDeleteChest(col.id, col.name) }}
                    className="w-6 h-6 flex items-center justify-center text-gray-200 hover:text-red-400 transition-colors flex-shrink-0">
                    <Trash2 size={12} />
                  </button>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}
