'use client'
import { useAuth } from '../../context/AuthContext'
import api from '../../lib/api'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import AnchorButton from './AnchorButton'
import ImageCarousel from './ImageCarousel'
import AvailabilityBadge from './AvailabilityBadge'
import PriceTag from './PriceTag'
import { useLocale } from '../../context/LocaleContext'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

const CAT_SLUG_MAP = {
  'Pintura': 'pintura', 'Fotografia': 'fotografia', 'Arte Digital': 'arte_digital',
  'Desenho & Ilustração': 'ilustracao', 'Escultura': 'escultura', 'Cerâmica & Olaria': 'ceramica',
  'Gravura & Impressão': 'gravura', 'Têxtil & Arte Fibra': 'textil', 'Street Art & Graffiti': 'street_art',
  'Design Gráfico': 'design_grafico', 'Artesanato': 'artesanato', 'Joalharia & Ourivesaria': 'joalharia',
  'Caligrafia & Lettering': 'caligrafia', 'Arte Multimédia': 'arte_multimedia', 'Performance & Instalação': 'performance'
}

export default function ArtworkCard({ artwork: w, aspect = '4/5', showArtist = true, followingIds = [] }) {
  const { t } = useLocale()
  const { isLoggedIn, user } = useAuth()
  const [followed, setFollowed] = useState(false)

  useEffect(() => {
    if (followingIds.length > 0 && w.artist?.id) {
      setFollowed(followingIds.includes(w.artist.id))
    }
  }, [followingIds, w.artist?.id])
  const catName = w.categories?.[0]?.category?.name
  const catSlug = CAT_SLUG_MAP[catName]
  const catLabel = catSlug ? (t(`categories.${catSlug}`) || catName) : (catName || '')
  const isOwnArtwork = user?.id && w.artist?.userId && user.id === w.artist.userId

  const router = useRouter()

  const handleFollow = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!isLoggedIn) {
      toast.error('Faz login para seguir artistas')
      router.push('/login')
      return
    }
    try {
      await api.post(`/follow/${w.artist.id}`)
      setFollowed(f => !f)
      toast.success(followed ? 'Deixaste de seguir' : 'A seguir!')
    } catch {}
  }

  return (
    <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-colors bg-white dark:bg-gray-900">

      {/* Header — artista, completamente fora de qualquer Link */}
      {showArtist && w.artist && (
        <div className="flex items-center justify-between gap-2 px-3 pt-3 pb-2" style={{position:'relative', zIndex: 10}}>
          <Link href={`/${w.artist.username}`} className="flex items-center gap-2 min-w-0 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 rounded-full bg-blue-100 overflow-hidden flex items-center justify-center text-blue-500 font-extrabold text-xs flex-shrink-0">
              {w.artist.user?.avatarUrl
                ? <img src={w.artist.user.avatarUrl} className="w-full h-full object-cover" alt="" />
                : w.artist.artistName?.[0]}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-gray-900 dark:text-white truncate leading-tight">{w.artist.artistName}</div>
              {w.artist.city && <div className="text-xs text-gray-400 truncate leading-tight">{w.artist.city}</div>}
            </div>
          </Link>
          {!isOwnArtwork && (
            <button
              type="button"
              onPointerDown={e => { e.stopPropagation(); }}
              onClick={handleFollow}
              style={{position:'relative', zIndex: 20}}
              className={`flex-shrink-0 text-xs font-bold px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${followed ? 'border-blue-400 text-blue-500 bg-blue-50' : 'border-gray-200 text-gray-500 hover:border-blue-300 hover:text-blue-500'}`}>
              {followed ? '✓ A seguir' : '+ Seguir'}
            </button>
          )}
        </div>
      )}

      {/* Imagem com overlay hover para favorito */}
      <Link href={`/artwork/${w.id}`} className="block relative group">
        <ImageCarousel images={w.images} title={w.title} aspect={aspect} />
        {w.isFeatured && (
          <div className="absolute top-2 left-2 bg-amber-400 text-white text-xs font-bold px-2 py-0.5 rounded-full z-10">⭐</div>
        )}
        <div className="absolute top-2 right-2 md:opacity-0 md:group-hover:opacity-100 transition-opacity z-10 select-none" style={{WebkitTouchCallout:"none"}}
          onClick={e => e.preventDefault()}>
          <AnchorButton artworkId={w.id} />
        </div>
      </Link>

      {/* Info */}
      <Link href={`/artwork/${w.id}`} className="block p-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
        {catLabel && <div className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-1">{catLabel}</div>}
        <div className="text-sm font-bold text-gray-900 dark:text-white leading-tight">{w.title}</div>
        <div className="flex items-center gap-2 mt-0.5">
          {w.collection?.name && <div className="text-xs text-gray-400 italic">{w.collection.name}</div>}
          {w.collection?.name && w.yearCreated && <span className="text-gray-300 text-xs">·</span>}
          {w.yearCreated && <div className="text-xs text-gray-400">{w.yearCreated}</div>}
        </div>
        <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-100 dark:border-gray-800">
          <PriceTag price={w.price} priceOnRequest={w.priceOnRequest} className="text-sm font-bold text-gray-900 dark:text-white" />
          <AvailabilityBadge availability={w.availability} />
        </div>
      </Link>

    </div>
  )
}
