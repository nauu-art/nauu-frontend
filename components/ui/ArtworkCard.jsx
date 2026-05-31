'use client'
import Link from 'next/link'
import AddToCollection from './AddToCollection'
import ImageCarousel from './ImageCarousel'
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
    <div className="rounded-xl overflow-hidden border border-gray-100 hover:border-blue-200 transition-colors group">
      <div className="relative">
        <ImageCarousel images={w.images} title={w.title} aspect={aspect} />
        {w.isFeatured && (
          <div className="absolute top-2 left-2 bg-amber-400 text-white text-xs font-bold px-2 py-0.5 rounded-full z-10">⭐</div>
        )}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          <AddToCollection artworkId={w.id} />
        </div>
      </div>
      <Link href={`/artwork/${w.id}`} className="block p-3 bg-white hover:bg-gray-50 transition-colors">
        <div className="flex items-center justify-between gap-2 mb-1">
          {catLabel && <div className="text-xs font-bold text-blue-400 uppercase tracking-wider">{catLabel}</div>}
          {w.collection && (
            <span className="text-xs font-bold text-purple-500 bg-purple-50 px-1.5 py-0.5 rounded truncate max-w-[100px]">
              {w.collection.name}
            </span>
          )}
        </div>
        <div className="text-sm font-bold text-gray-900 leading-tight">{w.title}</div>
        {showArtist && w.artist?.artistName && (
          <div className="text-xs text-gray-400 mt-0.5 font-medium">{w.artist.artistName}</div>
        )}
        <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-50">
          <PriceTag price={w.price} priceOnRequest={w.priceOnRequest} className="text-sm font-bold text-gray-900" />
          <AvailabilityBadge availability={w.availability} />
        </div>
      </Link>
    </div>
  )
}
