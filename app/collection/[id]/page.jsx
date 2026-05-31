'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import api from '../../../lib/api'
import ArtworkCard from '../../../components/ui/ArtworkCard'
import ArtistAvatar from '../../../components/ui/ArtistAvatar'

export default function CollectionPage() {
  const { id } = useParams()
  const [collection, setCollection] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get(`/artist-collections/collection/${id}`)
      .then(res => setCollection(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" /></div>
  if (!collection) return <div className="text-center py-24 text-gray-300 font-bold text-lg">Coleção não encontrada.</div>

  return (
    <div>
      {/* Breadcrumb */}
      <div className="px-5 md:px-10 py-3 border-b border-gray-100 flex items-center gap-2 text-xs text-gray-400 font-medium">
        <Link href="/" className="hover:text-gray-700">Início</Link>
        <ChevronRight size={12} />
        <Link href={`/${collection.artist.username}`} className="hover:text-gray-700">{collection.artist.artistName}</Link>
        <ChevronRight size={12} />
        <span className="text-gray-600">{collection.name}</span>
      </div>

      {/* Header */}
      <div className="relative">
        {collection.coverImageUrl && (
          <div className="h-48 md:h-64 overflow-hidden">
            <img src={collection.coverImageUrl} alt={collection.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0" style={{background: 'linear-gradient(to bottom, transparent, var(--bg))'}} />
          </div>
        )}
        <div className="px-5 md:px-10 py-8">
          <div className="flex items-start gap-5">
            <div className="flex-1">
              <div className="text-xs font-bold text-purple-500 uppercase tracking-widest mb-2">Coleção</div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-2" style={{letterSpacing:'-0.03em'}}>{collection.name}</h1>
              {collection.description && <p className="text-gray-500 font-medium mb-4 max-w-xl">{collection.description}</p>}
              <Link href={`/${collection.artist.username}`} className="flex items-center gap-2 w-fit hover:opacity-80 transition-opacity">
                <ArtistAvatar src={collection.artist.user?.avatarUrl} name={collection.artist.artistName} size={8} />
                <span className="text-sm font-bold text-gray-700">{collection.artist.artistName}</span>
              </Link>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="text-3xl font-extrabold text-gray-900">{collection.artworks?.length}</div>
              <div className="text-xs text-gray-400 font-bold uppercase tracking-widest">obras</div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid de obras */}
      <div className="px-5 md:px-10 pb-12">
        {collection.artworks?.length === 0 ? (
          <div className="text-center py-16 text-gray-300 font-bold">Esta coleção ainda não tem obras.</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {collection.artworks.map(w => <ArtworkCard key={w.id} artwork={w} showArtist={false} />)}
          </div>
        )}
      </div>
    </div>
  )
}
