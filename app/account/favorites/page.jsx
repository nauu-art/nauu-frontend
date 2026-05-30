'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Heart, Trash2 } from 'lucide-react'
import { useAuth } from '../../../context/AuthContext'
import { useLocale } from '../../../context/LocaleContext'
import api from '../../../lib/api'
import toast from 'react-hot-toast'

const availColor = (a) => a === 'AVAILABLE' ? '#2ECC71' : a === 'RESERVED' ? '#F39C12' : '#E74C3C'

export default function FavoritosPage() {
  const { isLoggedIn, loading } = useAuth()
  const { t } = useLocale()
  const router = useRouter()
  const [artworks, setArtworks] = useState([])
  const [loadingFavs, setLoadingFavs] = useState(true)

  useEffect(() => {
    if (!loading && !isLoggedIn) router.push('/login')
  }, [loading, isLoggedIn])

  useEffect(() => {
    if (isLoggedIn) {
      api.get('/favorites')
        .then(res => setArtworks(res.data || []))
        .catch(() => {})
        .finally(() => setLoadingFavs(false))
    }
  }, [isLoggedIn])

  const handleRemove = async (id, title) => {
    try {
      await api.delete(`/favorites/${id}`)
      setArtworks(prev => prev.filter(w => w.id !== id))
      toast.success(`"${title}" removido dos favoritos`)
    } catch { toast.error(t('common.error')) }
  }

  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" /></div>

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-5 md:px-10 py-10">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-pink-100 rounded-xl flex items-center justify-center">
            <Heart size={18} className="text-pink-500" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-gray-900" style={{letterSpacing:'-0.03em'}}>{t('nav.favorites')}</h1>
            <p className="text-sm text-gray-400 font-medium mt-0.5">{artworks.length} obras guardadas</p>
          </div>
        </div>

        {loadingFavs ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({length: 4}).map((_, i) => <div key={i} className="aspect-[4/5] bg-white rounded-xl animate-pulse" />)}
          </div>
        ) : artworks.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
            <Heart size={40} className="text-gray-200 mx-auto mb-4" />
            <div className="text-gray-300 font-bold text-lg mb-2">Ainda não tens favoritos</div>
            <p className="text-gray-400 text-sm font-medium mb-6">Explora o catálogo e guarda as obras que mais gostas.</p>
            <Link href="/explore" className="inline-block px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-bold text-sm rounded-xl transition-colors">
              {t('nav.explore')}
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {artworks.map(w => (
              <div key={w.id} className="bg-white border border-gray-100 rounded-xl overflow-hidden hover:border-blue-200 transition-colors group">
                <Link href={`/artwork/${w.id}`} className="block">
                  <div className="aspect-[4/5] bg-blue-50 overflow-hidden flex items-center justify-center">
                    {w.images?.[0]
                      ? <img src={w.images[0].imageUrl} alt={w.title} className="w-full h-full object-cover" />
                      : <span className="text-blue-200 text-4xl font-extrabold">{w.title?.[0]}</span>}
                  </div>
                  <div className="p-3">
                    <div className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-1">{w.categories?.[0]?.category?.name}</div>
                    <div className="text-sm font-bold text-gray-900 leading-tight mb-1">{w.title}</div>
                    <div className="text-xs text-gray-400 font-medium">{w.artist?.artistName}</div>
                  </div>
                </Link>
                <div className="flex justify-between items-center px-3 py-2 border-t border-gray-50">
                  <span className="text-sm font-bold text-gray-900">
                    {w.priceOnRequest ? t('artwork.on_request') : w.price ? `€ ${Number(w.price).toLocaleString('pt-PT')}` : '—'}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 text-xs font-semibold" style={{color: availColor(w.availability)}}>
                      <span className="w-1.5 h-1.5 rounded-full" style={{background: availColor(w.availability)}}></span>
                      {t(`artwork.${w.availability?.toLowerCase()}`)}
                    </span>
                    <button onClick={() => handleRemove(w.id, w.title)}
                      className="w-7 h-7 flex items-center justify-center text-gray-300 hover:text-red-400 hover:bg-red-50 rounded-lg transition-colors">
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
