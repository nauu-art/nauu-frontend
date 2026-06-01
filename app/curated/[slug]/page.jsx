'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import api from '../../../lib/api'
import ArtworkCard from '../../../components/ui/ArtworkCard'
import ArtistCard from '../../../components/ui/ArtistCard'
import { ChevronRight } from 'lucide-react'

export default function CuratedCollectionPage() {
  const { slug } = useParams()
  const [collection, setCollection] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get(`/curated/${slug}`).then(res => setCollection(res.data)).catch(() => {}).finally(() => setLoading(false))
  }, [slug])

  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" /></div>
  if (!collection) return <div className="text-center py-24 text-gray-300 font-bold">Coleção não encontrada</div>

  const artworks = collection.items?.filter(i => i.artwork).map(i => i.artwork) || []
  const artists = collection.items?.filter(i => i.artist).map(i => i.artist) || []

  return (
    <div className="min-h-screen">
      {/* Breadcrumb */}
      <div className="px-5 md:px-10 py-3 border-b border-gray-100 flex items-center gap-2 text-xs text-gray-400 font-medium">
        <Link href="/" className="hover:text-gray-700">Início</Link>
        <ChevronRight size={12} />
        <Link href="/curated" className="hover:text-gray-700">Curated</Link>
        <ChevronRight size={12} />
        <span className="text-gray-600">{collection.title}</span>
      </div>

      {/* Header */}
      {collection.coverImageUrl && (
        <div className="h-48 md:h-64 overflow-hidden">
          <img src={collection.coverImageUrl} alt={collection.title} className="w-full h-full object-cover" />
        </div>
      )}

      <div className="max-w-5xl mx-auto px-5 md:px-10 py-8">
        <div className="text-xs font-extrabold uppercase tracking-widest text-blue-400 mb-2">Curated by nauu</div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-2" style={{letterSpacing:'-0.03em'}}>{collection.title}</h1>
        {collection.description && <p className="text-gray-500 font-medium mb-8 max-w-xl">{collection.description}</p>}

        {artists.length > 0 && (
          <div className="mb-10">
            <h2 className="text-sm font-extrabold uppercase tracking-widest text-gray-300 mb-4">Artistas</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {artists.map(a => <ArtistCard key={a.id} artist={a} />)}
            </div>
          </div>
        )}

        {artworks.length > 0 && (
          <div>
            <h2 className="text-sm font-extrabold uppercase tracking-widest text-gray-300 mb-4">Obras</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {artworks.map(w => <ArtworkCard key={w.id} artwork={w} showArtist />)}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
