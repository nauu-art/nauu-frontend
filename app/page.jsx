'use client'
import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { Search, TrendingUp, Clock, Star, Flame } from 'lucide-react'
import api from '../lib/api'
import { useLocale } from '../context/LocaleContext'
import { useAuth } from '../context/AuthContext'
import Newsletter from '../components/ui/Newsletter'
import AddToCollection from '../components/ui/AddToCollection'
import ArtworkCard from '../components/ui/ArtworkCard'
import ArtistCard from '../components/ui/ArtistCard'

const availColor = (a) => a === 'AVAILABLE' ? '#2ECC71' : a === 'RESERVED' ? '#F39C12' : '#E74C3C'

const CATEGORIES = [
  { key: 'pintura', pt: 'Pintura', slug: 'pintura' },
  { key: 'fotografia', pt: 'Fotografia', slug: 'fotografia' },
  { key: 'arte_digital', pt: 'Arte Digital', slug: 'arte-digital' },
  { key: 'ilustracao', pt: 'Ilustração', slug: 'desenho-ilustracao' },
  { key: 'escultura', pt: 'Escultura', slug: 'escultura' },
  { key: 'ceramica', pt: 'Cerâmica', slug: 'ceramica-olaria' },
  { key: 'gravura', pt: 'Gravura', slug: 'gravura-impressao' },
  { key: 'street_art', pt: 'Street Art', slug: 'street-art-graffiti' },
]

const CAT_SLUG_MAP = {
  'Pintura': 'pintura', 'Fotografia': 'fotografia', 'Arte Digital': 'arte_digital',
  'Desenho & Ilustração': 'ilustracao', 'Escultura': 'escultura', 'Cerâmica & Olaria': 'ceramica',
  'Gravura & Impressão': 'gravura', 'Têxtil & Arte Fibra': 'textil', 'Street Art & Graffiti': 'street_art',
  'Design Gráfico': 'design_grafico', 'Artesanato': 'artesanato', 'Joalharia & Ourivesaria': 'joalharia',
  'Caligrafia & Lettering': 'caligrafia', 'Arte Multimédia': 'arte_multimedia', 'Performance & Instalação': 'performance'
}

export default function HomePage() {
  const { t } = useLocale()
  const { isLoggedIn, loading: authLoading } = useAuth()
  const [artworks, setArtworks] = useState([])
  const [artists, setArtists] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState('createdAt_desc')
  const [activeCategory, setActiveCategory] = useState('')
  const [search, setSearch] = useState('')
  const [stats, setStats] = useState({ artworks: 0, artists: 0 })

  const FILTERS = [
    { id: 'createdAt_desc', label: t('explore.sort_recent'), icon: Clock },
    { id: 'viewCount_desc', label: t('explore.sort_views'), icon: Flame },
    { id: 'featured', label: 'Destaque', icon: Star },
  ]

  const fetchArtworks = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('limit', 12)
      if (activeFilter === 'featured') params.set('featured', 'true')
      else params.set('sort', activeFilter)
      if (activeCategory) {
        const cat = CATEGORIES.find(c => c.pt === activeCategory || c.key === activeCategory)
        if (cat) params.set('category', cat.slug)
      }
      const res = await api.get(`/artworks?${params}`)
      setArtworks(res.data.data || [])
      setStats(s => ({ ...s, artworks: res.data.pagination?.total || 0 }))
    } catch {}
    setLoading(false)
  }, [activeFilter, activeCategory])

  useEffect(() => {
    fetchArtworks()
    api.get('/artists?limit=6&sort=featured').then(res => {
      setArtists(res.data.data || [])
      setStats(s => ({ ...s, artists: res.data.pagination?.total || 0 }))
    }).catch(() => {})
  }, [fetchArtworks])

  const handleSearch = (e) => {
    e.preventDefault()
    if (search.trim()) window.location.href = `/explore?search=${encodeURIComponent(search.trim())}`
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="px-5 md:px-10 py-14 border-b" style={{borderColor:"var(--border)",background:"var(--bg)"}}>
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-600 text-xs font-bold px-3 py-1.5 rounded-full mb-5">
            <TrendingUp size={12} /> {stats.artworks > 0 ? t('home.stats').replace('{artworks}', stats.artworks).replace('{artists}', stats.artists) : t('home.marketplace')}
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900 mb-4" style={{letterSpacing:'-0.035em'}}>
            {t('home.hero_title')}<br/>{t('home.hero_title2')}
          </h1>
          <p className="text-gray-500 font-medium text-base mb-8 max-w-xl mx-auto leading-relaxed">
            {t('home.hero_sub')}
          </p>
          <form onSubmit={handleSearch} className="flex gap-2 max-w-lg mx-auto mb-6">
            <div className="flex-1 flex items-center gap-2 border border-gray-200 rounded-xl px-4 py-3 bg-white shadow-sm">
              <Search size={16} className="text-gray-300 flex-shrink-0" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder={t('nav.search')}
                className="bg-transparent outline-none text-sm font-medium w-full placeholder:text-gray-300" />
            </div>
            <button type="submit" className="px-5 py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold text-sm rounded-xl transition-colors">
              {t('common.search_btn')}
            </button>
          </form>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link href="/explore" className="text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors">
              {t('home.hero_cta').replace('Publicar como artista', t('nav.explore'))} →
            </Link>
            <span className="text-gray-200">·</span>
            <Link href="/register" className="text-sm font-bold text-blue-500 hover:text-blue-600 transition-colors">
              {t('home.hero_cta')}
            </Link>
          </div>
        </div>
      </div>

      <div className="px-5 md:px-10 py-8">
        <div className="flex flex-wrap gap-2 items-center mb-6 overflow-x-auto pb-1">
          <div className="flex gap-2">
            {FILTERS.map(f => (
              <button key={f.id} onClick={() => { setActiveFilter(f.id); setActiveCategory('') }}
                className={`flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl border transition-all whitespace-nowrap ${activeFilter === f.id && !activeCategory ? 'bg-blue-500 border-blue-500 text-white' : 'border-gray-200 text-gray-500 hover:border-blue-300 hover:text-blue-500 bg-white'}`}>
                <f.icon size={12} /> {f.label}
              </button>
            ))}
          </div>
          <div className="w-px h-5 bg-gray-200 hidden md:block" />
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map(cat => (
              <button key={cat.key} onClick={() => setActiveCategory(activeCategory === cat.key ? '' : cat.key)}
                className={`text-xs font-bold px-3 py-1.5 rounded-full border transition-all whitespace-nowrap ${activeCategory === cat.key ? 'bg-blue-500 border-blue-500 text-white' : 'border-gray-200 text-gray-500 hover:border-blue-300 hover:text-blue-500 bg-white'}`}>
                {t(`categories.${cat.key}`) || cat.pt}
              </button>
            ))}
          </div>
          <Link href="/explore" className="ml-auto text-xs font-bold text-blue-500 hover:text-blue-600 whitespace-nowrap">
            {t('home.artists_see_all')}
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-12">
            {Array.from({length: 8}).map((_, i) => (
              <div key={i} className="rounded-xl bg-gray-100 animate-pulse aspect-[4/5]" />
            ))}
          </div>
        ) : artworks.length === 0 ? (
          <div className="text-center py-16 text-gray-300 font-bold">{t('explore.no_results')}</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-12">
            {artworks.map(w => <ArtworkCard key={w.id} artwork={w} />)}
          </div>
        )}

        {artists.length > 0 && (
          <div className="border-t border-gray-100 pt-10">
            <div className="flex justify-between items-center mb-6">
              <div>
                <div className="text-xs font-extrabold uppercase tracking-widest text-gray-300 mb-1">
                  {t('home.artists_title').split(' ')[0]}
                </div>
                <div className="text-xl font-extrabold tracking-tight text-gray-900" style={{letterSpacing:'-0.025em'}}>
                  {t('home.artists_title')}
                </div>
              </div>
              <Link href="/artists" className="text-sm font-bold text-blue-500 hover:text-blue-600">{t('home.artists_see_all')}</Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {artists.map(a => <ArtistCard key={a.id} artist={a} />)}
            </div>
          </div>
        )}

        {!authLoading && !isLoggedIn && (
        <div className="mt-6 rounded-2xl p-6 md:p-8 text-center border" style={{background:'var(--bg-card)', borderColor:'var(--border)'}}>
          <h2 className="text-xl font-extrabold tracking-tight mb-2" style={{letterSpacing:'-0.025em', color:'var(--text)'}}>
            {t('home.hero_cta').replace(' →', '')}
          </h2>
          <p className="font-medium text-sm mb-5 max-w-md mx-auto" style={{color:'var(--text-secondary)'}}>{t('home.hero_sub')}</p>
          <Link href="/register" className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-bold text-sm rounded-xl transition-colors">
            {t('auth.register_btn')} →
          </Link>
        </div>
        )}
      </div>
    </div>
  )
}
