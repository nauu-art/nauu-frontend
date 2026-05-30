'use client'
import Link from 'next/link'
import { MapPin } from 'lucide-react'
import { useLocale } from '../../context/LocaleContext'
import FollowButton from './FollowButton'

const CAT_SLUG_MAP = {
  'Pintura': 'pintura', 'Fotografia': 'fotografia', 'Arte Digital': 'arte_digital',
  'Desenho & Ilustração': 'ilustracao', 'Escultura': 'escultura', 'Cerâmica & Olaria': 'ceramica',
  'Gravura & Impressão': 'gravura', 'Têxtil & Arte Fibra': 'textil', 'Street Art & Graffiti': 'street_art',
  'Design Gráfico': 'design_grafico', 'Artesanato': 'artesanato', 'Joalharia & Ourivesaria': 'joalharia',
  'Caligrafia & Lettering': 'caligrafia', 'Arte Multimédia': 'arte_multimedia', 'Performance & Instalação': 'performance'
}

export default function ArtistCard({ artist: a, showFollow = false, locationMode = 'full' }) {
  const { t } = useLocale()

  const catName = a.categories?.[0]?.category?.name
  const catSlug = CAT_SLUG_MAP[catName]
  const catLabel = catSlug ? (t(`categories.${catSlug}`) || catName) : catName

  const location = locationMode === 'portugal'
    ? a.city
    : [a.city, a.country].filter(Boolean).join(', ')

  return (
    <Link href={`/${a.username}`}
      className="group bg-white border border-gray-100 rounded-2xl overflow-hidden hover:border-blue-200 hover:shadow-md transition-all">
      <div className="aspect-square bg-blue-50 overflow-hidden">
        {a.user?.avatarUrl
          ? <img src={a.user.avatarUrl} alt={a.artistName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          : <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-extrabold text-4xl">{a.artistName?.[0]}</div>}
        {a.isFeatured && <div className="absolute top-2 right-2 w-6 h-6 bg-amber-400 rounded-full flex items-center justify-center text-xs shadow-sm">⭐</div>}
      </div>
      <div className="p-3">
        <div className="font-extrabold text-gray-900 text-sm leading-tight mb-0.5">{a.artistName}</div>
        {catLabel && (
          <div className="text-xs text-blue-500 font-bold mb-1.5 truncate">{catLabel}</div>
        )}
        {location && (
          <div className="text-xs text-gray-400 font-medium mb-2 truncate flex items-center gap-1">
            <MapPin size={10} className="flex-shrink-0" />{location}
          </div>
        )}
        <div className="flex items-center justify-between pt-2 border-t border-gray-50">
          <span className="text-xs text-gray-400 font-semibold">{a._count?.artworks || 0} {t('common.artworks')}</span>
          {showFollow && (
            <div onClick={e => e.preventDefault()}>
              <FollowButton artistId={a.id} className="text-xs px-2.5 py-1 rounded-lg border" />
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}
