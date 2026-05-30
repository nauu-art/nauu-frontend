'use client'
import Link from 'next/link'
import AddToCollection from './AddToCollection'
import AvailabilityBadge from './AvailabilityBadge'
import PriceTag from './PriceTag'
import { useLocale } from '../../context/LocaleContext'

const CAT_SLUG_MAP = {
  'Pintura': 'pintura', 'Fotografia': 'fotografia', 'Arte Digital': 'arte_digital',
  'Desenho & Ilustração': 'ilustracao', 'Escultura': 'escultura', 'Cerâmica & Olaria': 'ceramica',
  'Gravura & Impressão': 'gravura', 'Têxtil & Arte Fibra': 'textil', 'Street Art & Graffiti': 'street_art',
  'Design Gráfico': 'design_grafico', 'Artesanato': 'artesanato', 'Joalharia & Ourivesaria': 'joalharia',
  'Caligrafia & Lettering': 'caligrafia', 'Arte Multimédia': 'arte_multimedia', 'Performance & Instalação': 'performance'
}

export default function ArtworkCard({ artwork: w, aspect = '4/5', showArtist = true }) {
  const { t } = useLocale()
  const catName = w.categories?.[0]?.category?.name
  const catSlug = CAT_SLUG_MAP[catName]
  const catLabel = catSlug ? (t(`categories.${catSlug}`) || catName) : (catName || '')

  return (
    <Link href={`/artwork/${w.id}`}
      className="block rounded-xl overflow-hidden border border-gray-100 hover:border-blue-200 transition-colors group">
      <div className="relative bg-blue-50 overflow-hidden" style={{ aspectRatio: aspect }}>
        {w.images?.[0] ? (
          <img src={w.images[0].imageUrl} alt={w.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-blue-200 text-5xl font-extrabold">{w.title?.[0]}</span>
          </div>
        )}
        {w.isFeatured && (
          <div className="absolute top-2 left-2 bg-amber-400 text-white text-xs font-bold px-2 py-0.5 rounded-full">⭐</div>
        )}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <AddToCollection artworkId={w.id} />
        </div>
      </div>
      <div className="p-3 bg-white">
        {catLabel && (
          <div className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-1">{catLabel}</div>
        )}
        <div className="text-sm font-bold text-gray-900 leading-tight">{w.title}</div>
        {showArtist && w.artist?.artistName && (
          <div className="text-xs text-gray-400 mt-0.5 font-medium">{w.artist.artistName}</div>
        )}
        <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-50">
          <PriceTag price={w.price} priceOnRequest={w.priceOnRequest} className="text-sm font-bold text-gray-900" />
          <AvailabilityBadge availability={w.availability} />
        </div>
      </div>
    </Link>
  )
}
