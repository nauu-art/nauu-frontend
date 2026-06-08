'use client'
import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { Search, TrendingUp, Clock, Star, Flame, SlidersHorizontal, X, ChevronDown } from 'lucide-react'
import api from '../lib/api'
import { useLocale } from '../context/LocaleContext'
import { useAuth } from '../context/AuthContext'
import Newsletter from '../components/ui/Newsletter'
import AnchorButton from '../components/ui/AnchorButton'
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


function HeroFan({ artworks, loading }) {
  const [vw, setVw] = useState(390)
  useEffect(() => {
    const check = () => setVw(window.innerWidth)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const isMobile = vw < 768
  const N = 11 // número de cards
  const mid = Math.floor(N / 2)

  // card ocupa ~20% da largura do ecrã, mínimo 80px máximo 180px
  const cardW = Math.min(180, Math.max(80, vw * 0.18))
  // espaçamento entre centros — cartas sobrepõem-se bastante
  const step = cardW * 0.62
  // rotação máxima nos extremos
  const maxRot = isMobile ? 6 : 8

  // preencher com repetição
  const pool = artworks.length > 0 ? artworks : []
  const items = loading
    ? Array(N).fill(null)
    : Array.from({length: N}, (_, i) => pool.length > 0 ? pool[i % pool.length] : null)

  return (
    <div style={{
      position:'relative', width:'100%', overflow:'visible',
      height: isMobile ? `${cardW * 1.4}px` : `${cardW * 1.5}px`,
      marginTop:'16px', marginBottom:'8px', flexShrink:0
    }}>
      {items.map((w, i) => {
        const offset = i - mid
        const tx = offset * step
        const rotate = offset * maxRot
        const scale = 1 - Math.abs(offset) * 0.04
        const zIndex = N - Math.abs(offset)
        const img = w?.images?.[0]?.imageUrl
        return (
          <Link key={i} href={w ? `/artwork/${w.id}` : '#'}
            onMouseEnter={e => { e.currentTarget.style.transform = `translateX(calc(-50% + ${tx}px)) rotate(0deg) scale(${scale * 1.12})`; e.currentTarget.style.zIndex = 999; e.currentTarget.style.boxShadow = '0 24px 60px rgba(0,0,0,0.9)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = `translateX(calc(-50% + ${tx}px)) rotate(${rotate}deg) scale(${scale})`; e.currentTarget.style.zIndex = zIndex; e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.7)' }}
            style={{
              position:'absolute',
              left:'50%',
              bottom:0,
              transform:`translateX(calc(-50% + ${tx}px)) rotate(${rotate}deg) scale(${scale})`,
              transformOrigin:'bottom center',
              zIndex,
              width:`${cardW}px`,
              borderRadius:`${cardW * 0.1}px`,
              overflow:'hidden',
              boxShadow:'0 12px 40px rgba(0,0,0,0.7)',
              border:'1.5px solid rgba(255,255,255,0.1)',
              textDecoration:'none',
              display:'block',
              flexShrink:0,
              transition:'transform 0.2s ease, z-index 0s, box-shadow 0.2s ease',
            }}>
            <div style={{aspectRatio:'3/4', background:'#1a1a1a', position:'relative'}}>
              {img
                ? <img src={img} alt={w?.title} style={{width:'100%',height:'100%',objectFit:'cover',display:'block'}} />
                : <div style={{width:'100%',height:'100%',background:'#222'}} />}
              {w && (
                <div style={{
                  position:'absolute',bottom:0,left:0,right:0,
                  padding:'16px 8px 8px',
                  background:'linear-gradient(transparent,rgba(0,0,0,0.9))'
                }}>
                  <div style={{fontSize:'10px',fontWeight:700,color:'white',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{w.title}</div>
                  <div style={{fontSize:'9px',color:'rgba(255,255,255,0.4)'}}>{w.artist?.artistName}</div>
                </div>
              )}
            </div>
          </Link>
        )
      })}
    </div>
  )
}

export default function HomePage() {
  const { t } = useLocale()
  const { isLoggedIn, loading: authLoading } = useAuth()
  const [artworks, setArtworks] = useState([])
  const [heroArtworks, setHeroArtworks] = useState([])
  const [followingIds, setFollowingIds] = useState([])
  const [artists, setArtists] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState('createdAt_desc')
  const [activeCategory, setActiveCategory] = useState('')
  const [search, setSearch] = useState('')
  const [stats, setStats] = useState({ artworks: 0, artists: 0 })
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [sortOpen, setSortOpen] = useState(false)

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
    if (isLoggedIn) {
      api.get('/follow/following').then(res => {
        setFollowingIds((res.data || []).map(f => f.id || f.artistId))
      }).catch(() => {})
    }
  }, [isLoggedIn])

  useEffect(() => {
    // Carregar obras do hero uma vez só, sem filtros
    api.get('/artworks?limit=12&sort=createdAt_desc').then(res => {
      setHeroArtworks(res.data.data || [])
    }).catch(() => {})
  }, [])

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
    <div className="min-h-screen" style={{background:"var(--bg)"}}>
      {/* HERO */}
      <div className="relative" style={{background:'linear-gradient(180deg, #0a0a0a 0%, #111 60%, var(--bg) 100%)', minHeight:'auto', paddingTop:'8px', paddingBottom:'16px', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center'}}>
        {/* Grid background */}
        <div style={{position:'absolute',inset:0,backgroundImage:'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',backgroundSize:'40px 40px',pointerEvents:'none'}} />

        {/* Texto hero */}
        <div className="relative z-10 text-center px-5 pt-4 pb-0">
          <h1 className="font-extrabold text-white"
            style={{fontSize:'clamp(2.2rem,7vw,4rem)',letterSpacing:'-0.04em',lineHeight:1.05}}>
            {t('home.hero_title')}<br/>
            <span style={{color:'#60a5fa'}}>{t('home.hero_title2')}</span>
          </h1>
        </div>

        {/* Fan de obras */}
        <HeroFan artworks={heroArtworks} loading={heroArtworks.length === 0} />
      </div>

      <div className="px-5 md:px-10 py-8">
        {/* Mobile: botão de filtros compacto */}
        <div className="flex gap-2 mb-4 md:hidden">
          <div className="relative flex-1">
            <button onClick={() => { setSortOpen(!sortOpen); setFiltersOpen(false) }}
              className={`flex items-center gap-1.5 px-3 py-2.5 border rounded-xl text-xs font-bold w-full justify-between transition-all ${sortOpen ? 'bg-blue-500 border-blue-500 text-white' : 'border-gray-200 text-gray-500 bg-white'}`}>
              <span className="flex items-center gap-1.5">
                {FILTERS.find(f => f.id === activeFilter)?.icon && (() => { const Icon = FILTERS.find(f => f.id === activeFilter).icon; return <Icon size={11} /> })()}
                {FILTERS.find(f => f.id === activeFilter)?.label}
              </span>
              <ChevronDown size={12} />
            </button>
            {sortOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 rounded-xl border border-gray-200 shadow-lg overflow-hidden z-30" style={{backgroundColor:'var(--bg-card)'}}>
                {FILTERS.map(f => (
                  <button key={f.id} onClick={() => { setActiveFilter(f.id); setActiveCategory(''); setSortOpen(false) }}
                    className={`flex items-center gap-2 w-full px-3 py-2.5 text-xs font-bold text-left transition-all ${activeFilter === f.id ? 'text-blue-500 bg-blue-50' : 'text-gray-600'}`}>
                    <f.icon size={12} /> {f.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button onClick={() => { setFiltersOpen(true); setSortOpen(false) }}
            className={`flex items-center gap-1.5 px-3 py-2.5 border rounded-xl text-xs font-bold flex-shrink-0 transition-all ${activeCategory ? 'bg-blue-500 border-blue-500 text-white' : 'border-gray-200 text-gray-500 bg-white'}`}>
            <SlidersHorizontal size={14} />
            {activeCategory && <span>1</span>}
          </button>
        </div>

        {/* Desktop: filtros completos */}
        <div className="hidden md:flex flex-wrap gap-2 items-center mb-6 overflow-x-auto pb-1">
          <div className="flex gap-2">
            {FILTERS.map(f => (
              <button key={f.id} onClick={() => { setActiveFilter(f.id); setActiveCategory('') }}
                className={`flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl border transition-all whitespace-nowrap ${activeFilter === f.id && !activeCategory ? 'bg-blue-500 border-blue-500 text-white' : 'border-gray-200 text-gray-500 hover:border-blue-300 hover:text-blue-500 bg-white'}`}>
                <f.icon size={12} /> {f.label}
              </button>
            ))}
          </div>
          <div className="w-px h-5 bg-gray-200" />
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

        {/* Drawer de categorias mobile */}
        {filtersOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div className="absolute inset-0 bg-black/40" onClick={() => setFiltersOpen(false)} />
            <div className="absolute bottom-0 left-0 right-0 rounded-t-2xl p-5 pb-8" style={{backgroundColor:'var(--bg-card)'}}>
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-extrabold">Categorias</span>
                <button onClick={() => setFiltersOpen(false)} className="text-gray-400 p-1"><X size={18} /></button>
              </div>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map(cat => (
                  <button key={cat.key} onClick={() => { setActiveCategory(activeCategory === cat.key ? '' : cat.key); setFiltersOpen(false) }}
                    className={`text-xs font-bold px-3 py-2 rounded-full border transition-all ${activeCategory === cat.key ? 'bg-blue-500 border-blue-500 text-white' : 'border-gray-200 text-gray-500 bg-white'}`}>
                    {t(`categories.${cat.key}`) || cat.pt}
                  </button>
                ))}
              </div>
              {activeCategory && (
                <button onClick={() => { setActiveCategory(''); setFiltersOpen(false) }}
                  className="mt-4 w-full py-2.5 text-xs font-bold text-red-400 border border-red-100 rounded-xl">
                  Limpar filtro
                </button>
              )}
            </div>
          </div>
        )}

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
            {artworks.map(w => <ArtworkCard key={w.id} artwork={w} followingIds={followingIds} />)}
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
