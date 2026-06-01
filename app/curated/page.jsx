'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import api from '../../lib/api'
import ArtworkCard from '../../components/ui/ArtworkCard'
import ArtistCard from '../../components/ui/ArtistCard'

export default function CuratedPage() {
  const [collections, setCollections] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/curated').then(res => setCollections(res.data || [])).catch(() => {}).finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="max-w-5xl mx-auto px-5 py-12">
      <div className="h-8 w-48 bg-gray-100 rounded animate-pulse mb-8" />
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">{Array.from({length:6}).map((_,i) => <div key={i} className="aspect-[4/5] bg-gray-100 rounded-xl animate-pulse" />)}</div>
    </div>
  )

  return (
    <div className="min-h-screen">
      <div className="max-w-5xl mx-auto px-5 md:px-10 py-12">
        <div className="mb-10">
          <div className="text-xs font-extrabold uppercase tracking-widest text-blue-400 mb-2">Curated by nauu</div>
          <h1 className="text-3xl font-extrabold tracking-tight mb-2" style={{letterSpacing:'-0.03em'}}>Seleções editoriais</h1>
          <p className="text-gray-400 font-medium">Coleções cuidadosamente selecionadas pela equipa nauu.art</p>
        </div>

        {collections.length === 0 ? (
          <div className="text-center py-20 text-gray-300 font-bold">Em breve</div>
        ) : (
          <div className="flex flex-col gap-16">
            {collections.map(col => (
              <section key={col.id}>
                <div className="flex items-end justify-between mb-5">
                  <div>
                    <h2 className="text-xl font-extrabold tracking-tight">{col.title}</h2>
                    {col.description && <p className="text-sm text-gray-400 font-medium mt-1 max-w-lg">{col.description}</p>}
                  </div>
                  <Link href={`/curated/${col.slug}`} className="text-sm font-bold text-blue-500 hover:text-blue-600 flex-shrink-0 ml-4">
                    Ver tudo →
                  </Link>
                </div>

                {/* Grid de itens */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {col.items?.slice(0, 6).map(item => (
                    item.artwork ? (
                      <ArtworkCard key={item.id} artwork={item.artwork} showArtist />
                    ) : item.artist ? (
                      <ArtistCard key={item.id} artist={item.artist} />
                    ) : null
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
