'use client'
const CAT_SLUG_MAP = {
  'Pintura': 'pintura', 'Fotografia': 'fotografia', 'Arte Digital': 'arte_digital',
  'Desenho & Ilustração': 'ilustracao', 'Escultura': 'escultura', 'Cerâmica & Olaria': 'ceramica',
  'Gravura & Impressão': 'gravura', 'Têxtil & Arte Fibra': 'textil', 'Street Art & Graffiti': 'street_art',
  'Design Gráfico': 'design_grafico', 'Artesanato': 'artesanato', 'Joalharia & Ourivesaria': 'joalharia',
  'Caligrafia & Lettering': 'caligrafia', 'Arte Multimédia': 'arte_multimedia', 'Performance & Instalação': 'performance'
}
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Search, X, ChevronDown, SlidersHorizontal, MapPin, Globe, Flag } from 'lucide-react'
import api from '../../lib/api'
import { useLocale } from '../../context/LocaleContext'
import { DISTRITOS_CONCELHOS, getDistritoFromConcelho } from '../../lib/portugal'
import FollowButton from '../../components/ui/FollowButton'

const DISTRITOS = Object.keys(DISTRITOS_CONCELHOS)

const COUNTRIES = [
  'Brasil', 'Espanha', 'França', 'Reino Unido', 'Alemanha',
  'Itália', 'Estados Unidos', 'Países Baixos', 'Bélgica', 'Suíça', 'Outro'
]

const CATEGORIES = [
  { key: 'pintura', pt: 'Pintura', slug: 'pintura' },
  { key: 'fotografia', pt: 'Fotografia', slug: 'fotografia' },
  { key: 'arte_digital', pt: 'Arte Digital', slug: 'arte-digital' },
  { key: 'ilustracao', pt: 'Ilustração', slug: 'desenho-ilustracao' },
  { key: 'escultura', pt: 'Escultura', slug: 'escultura' },
  { key: 'ceramica', pt: 'Cerâmica', slug: 'ceramica-olaria' },
  { key: 'gravura', pt: 'Gravura', slug: 'gravura-impressao' },
  { key: 'textil', pt: 'Têxtil', slug: 'textil-arte-fibra' },
  { key: 'street_art', pt: 'Street Art', slug: 'street-art-graffiti' },
  { key: 'design_grafico', pt: 'Design Gráfico', slug: 'design-grafico' },
  { key: 'artesanato', pt: 'Artesanato', slug: 'artesanato' },
  { key: 'joalharia', pt: 'Joalharia', slug: 'joalharia-ourivesaria' },
  { key: 'caligrafia', pt: 'Caligrafia', slug: 'caligrafia-lettering' },
  { key: 'arte_multimedia', pt: 'Arte Multimédia', slug: 'arte-multimedia' },
  { key: 'performance', pt: 'Performance', slug: 'performance-instalacao' },
]

const slugMap = {
  'Pintura': 'pintura',
  'Fotografia': 'fotografia',
  'Arte Digital': 'arte-digital',
  'Ilustração': 'desenho-ilustracao',
  'Escultura': 'escultura',
  'Cerâmica': 'ceramica-olaria',
  'Gravura': 'gravura-impressao',
  'Têxtil': 'textil-arte-fibra',
  'Street Art': 'street-art-graffiti',
  'Design Gráfico': 'design-grafico',
  'Artesanato': 'artesanato',
  'Joalharia': 'joalharia-ourivesaria',
  'Caligrafia': 'caligrafia-lettering',
  'Arte Multimédia': 'arte-multimedia',
  'Performance': 'performance-instalacao',
}

export default function ArtistsPage() {
  const { t, locale } = useLocale()
  const [tab, setTab] = useState('portugal') // 'portugal' | 'internacional' | 'todos'
  const [artists, setArtists] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [catOpen, setCatOpen] = useState(false)
  const [locOpen, setLocOpen] = useState(false)
  const [distrito, setDistrito] = useState('')
  const [country, setCountry] = useState('')
  const [countries, setCountries] = useState([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    api.get('/artists/countries').then(res => setCountries(res.data || [])).catch(() => {})
  }, [])

  const fetchArtists = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('page', page)
      params.set('limit', 20)
      if (search) params.set('search', search)
      if (category) params.set('category', slugMap[category] || category.toLowerCase().replace(/ /g, '-'))

      // Filtro geográfico por tab
      if (tab === 'portugal') {
        params.set('country', 'Portugal')
        if (distrito) {
          // Filtrar pelos concelhos do distrito
          const concelhos = DISTRITOS_CONCELHOS[distrito] || []
          params.set('district', distrito)
        }
      } else if (tab === 'internacional') {
        params.set('excludeCountry', 'Portugal')
        if (country) params.set('country', country)
      }

      const res = await api.get(`/artists?${params}`)
      setArtists(res.data.data || [])
      setTotal(res.data.pagination?.total || 0)
      setTotalPages(res.data.pagination?.totalPages || 1)
    } catch {}
    setLoading(false)
  }, [page, search, category, tab, distrito, country])

  useEffect(() => {
    setPage(1)
    setDistrito('')
    setCountry('')
  }, [tab])

  useEffect(() => { fetchArtists() }, [fetchArtists])

  const ArtistCard = ({ a }) => (
    <Link href={`/${a.username}`}
      className="group bg-white border border-gray-100 rounded-2xl overflow-hidden hover:border-blue-200 hover:shadow-md transition-all">
      <div className="aspect-square bg-blue-50 overflow-hidden relative">
        {a.user?.avatarUrl
          ? <img src={a.user.avatarUrl} alt={a.artistName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          : <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-extrabold text-5xl">{a.artistName?.[0]}</div>}
        {a.isFeatured && <div className="absolute top-2 right-2 w-6 h-6 bg-amber-400 rounded-full flex items-center justify-center text-xs shadow-sm">⭐</div>}
      </div>
      <div className="p-3.5">
        <div className="font-extrabold text-gray-900 text-sm leading-tight mb-0.5">{a.artistName}</div>
        {a.categories?.length > 0 && (
          <div className="text-xs text-blue-500 font-bold mb-1.5 truncate">
            {a.categories.slice(0,2).map(c => { const n = c.category?.name; const slug = CAT_SLUG_MAP[n]; return slug ? (t(`categories.${slug}`) || n) : n }).join(' · ')}
          </div>
        )}
        {(a.city || a.country) && (
          <div className="text-xs text-gray-400 font-medium mb-2.5 truncate flex items-center gap-1">
            <MapPin size={10} className="flex-shrink-0" />
            {tab === 'portugal'
              ? [a.city, getDistritoFromConcelho(a.city)].filter(Boolean).join(', ')
              : [a.city, a.country].filter(Boolean).join(', ')}
          </div>
        )}
        <div className="flex items-center justify-between pt-2 border-t border-gray-50">
          <span className="text-xs text-gray-400 font-semibold">{a._count?.artworks || 0} {t('common.artworks')}</span>
          <div onClick={e => e.preventDefault()}>
            <FollowButton artistId={a.id} className="text-xs px-2.5 py-1 rounded-lg border" />
          </div>
        </div>
      </div>
    </Link>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-5 md:px-10 py-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 mb-4" style={{letterSpacing:'-0.03em'}}>
          {t('nav.artists')}
        </h1>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
          {[
            { id: 'portugal', label: `🇵🇹 Portugal` },
            { id: 'internacional', label: `🌍 ${t('artists.tab_international')}` },
            { id: 'todos', label: t('home.filter_all') },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${tab === t.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-5 md:px-10 py-6">
        {/* Filtros — mobile */}
        <div className="flex gap-2 mb-4 md:hidden">
          <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2.5 flex-1" style={{background:'var(--bg-card)'}}>
            <Search size={14} className="text-gray-300 flex-shrink-0" />
            <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
              placeholder={t("nav.search")}
              className="bg-transparent outline-none text-sm font-medium w-full placeholder:text-gray-300" />
            {search && <button onClick={() => { setSearch(''); setPage(1) }}><X size={13} className="text-gray-300" /></button>}
          </div>
          {/* Localização dropdown */}
          <div className="relative flex items-stretch">
            <button onClick={() => { setLocOpen(!locOpen); setCatOpen(false) }}
              className={`flex items-center gap-1.5 px-3 py-2.5 border rounded-xl text-xs font-bold flex-shrink-0 transition-all ${(distrito || country) ? 'bg-blue-500 border-blue-500 text-white' : 'border-gray-200 text-gray-500'}`}
              style={{background: (distrito || country) ? undefined : 'var(--bg-card)'}}>
              {distrito || country || (tab === 'portugal' ? 'Distrito' : tab === 'internacional' ? 'País' : 'Local')}
              <ChevronDown size={12} />
            </button>
            {locOpen && (
              <div className="absolute left-0 top-full mt-1 w-48 rounded-xl border border-gray-100 shadow-xl z-[100] overflow-y-auto max-h-64" style={{backgroundColor:'var(--bg-card)',borderColor:'var(--border)'}}>
                <button onClick={() => { setDistrito(''); setCountry(''); setPage(1); setLocOpen(false) }}
                  className="flex w-full px-3 py-2.5 text-xs font-bold text-left text-gray-400 border-b border-gray-100">
                  Todos
                </button>
                {tab === 'portugal' && DISTRITOS.map(d => (
                  <button key={d} onClick={() => { setDistrito(d); setCountry(''); setPage(1); setLocOpen(false) }}
                    className={`flex w-full px-3 py-2 text-xs font-semibold text-left transition-colors ${distrito === d ? 'text-blue-500 font-bold' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                    {d}
                  </button>
                ))}
                {tab === 'internacional' && (countries.length > 0 ? countries : COUNTRIES.map(c => ({country: c}))).map(c => (
                  <button key={c.country} onClick={() => { setCountry(c.country); setDistrito(''); setPage(1); setLocOpen(false) }}
                    className={`flex w-full px-3 py-2 text-xs font-semibold text-left transition-colors ${country === c.country ? 'text-blue-500 font-bold' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                    {c.country}
                  </button>
                ))}
                {tab === 'todos' && <div className="px-3 py-3 text-xs text-gray-400 text-center">Selecciona Portugal ou Internacional primeiro</div>}
              </div>
            )}
          </div>
          {/* Categorias drawer */}
          <button onClick={() => { setCatOpen(true); setLocOpen(false) }}
            className={`flex items-center gap-1.5 px-3 py-2.5 border rounded-xl text-xs font-bold flex-shrink-0 transition-all ${category ? 'bg-blue-500 border-blue-500 text-white' : 'border-gray-200 text-gray-500'}`}
            style={{background: category ? undefined : 'var(--bg-card)'}}>
            <SlidersHorizontal size={14} />
            {category && <span>1</span>}
          </button>
        </div>

        {/* Filtros — desktop */}
        <div className="hidden md:flex gap-3 mb-6 flex-wrap items-center">
          <div className="flex items-center gap-2 border rounded-lg px-3 py-1.5 flex-1 max-w-xs" style={{background:"var(--bg-card)",borderColor:"var(--border)"}}>
            <Search size={14} className="text-gray-300 flex-shrink-0" />
            <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
              placeholder={t("nav.search")}
              className="bg-transparent outline-none text-sm font-medium w-full placeholder:text-gray-300" />
            {search && <button onClick={() => { setSearch(''); setPage(1) }}><X size={13} className="text-gray-300" /></button>}
          </div>
          {tab === 'portugal' && (
            <select value={distrito} onChange={e => { setDistrito(e.target.value); setPage(1) }}
              className="text-sm font-semibold border rounded-lg px-3 py-1.5 outline-none self-center" style={{background:"var(--bg-card)",borderColor:"var(--border)",color:"var(--text-secondary)"}}>
              <option value="">{t("common.all_districts")}</option>
              {DISTRITOS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          )}
          {tab === 'internacional' && (
            <select value={country} onChange={e => { setCountry(e.target.value); setPage(1) }}
              className="text-sm font-semibold border border-gray-200 rounded-lg px-3 py-1.5 outline-none text-gray-600 self-center" style={{background:'var(--bg-card)', borderColor:'var(--border)'}}>
              <option value="">{t("common.all_countries")}</option>
              {countries.length > 0
                ? countries.map(c => <option key={c.country} value={c.country}>{c.country} ({c.count})</option>)
                : COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          )}
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map(cat => (
              <button key={cat.key} onClick={() => { setCategory(category === cat.key ? '' : cat.key); setPage(1) }}
                className={`text-xs font-bold px-3 py-1.5 rounded-full border transition-all ${category === cat.key ? 'bg-blue-500 border-blue-500 text-white' : 'border-gray-200 text-gray-500 bg-white hover:border-blue-300 hover:text-blue-500'}`}>
                {t(`categories.${cat.key}`) || cat.pt}
              </button>
            ))}
          </div>
        </div>

        {/* Drawer categorias mobile */}
        {catOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div className="absolute inset-0 bg-black/40" onClick={() => setCatOpen(false)} />
            <div className="absolute bottom-0 left-0 right-0 rounded-t-2xl p-5 pb-8" style={{backgroundColor:'var(--bg-card)'}}>
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-extrabold">Categorias</span>
                <button onClick={() => setCatOpen(false)} className="text-gray-400 p-1"><X size={18} /></button>
              </div>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map(cat => (
                  <button key={cat.key} onClick={() => { setCategory(category === cat.key ? '' : cat.key); setPage(1); setCatOpen(false) }}
                    className={`text-xs font-bold px-3 py-2 rounded-full border transition-all ${category === cat.key ? 'bg-blue-500 border-blue-500 text-white' : 'border-gray-200 text-gray-500 bg-white'}`}>
                    {t(`categories.${cat.key}`) || cat.pt}
                  </button>
                ))}
              </div>
              {category && (
                <button onClick={() => { setCategory(''); setPage(1); setCatOpen(false) }}
                  className="mt-4 w-full py-2.5 text-xs font-bold text-red-400 border border-red-100 rounded-xl">
                  Limpar filtro
                </button>
              )}
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="text-sm text-gray-400 font-medium mb-4">
          {total > 0 ? `${total} ${total === 1 ? t("nav.artists").replace(/s$/, "") : t("nav.artists")}` : ''}
          {tab === 'portugal' && distrito ? ` ${t('artists.in_district').replace('{district}', distrito)}` : ''}
          {tab === 'internacional' && country ? ` ${t('artists.from_country').replace('{country}', country)}` : ''}
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {Array.from({length: 10}).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse">
                <div className="aspect-square bg-gray-100" />
                <div className="p-3"><div className="h-3 bg-gray-100 rounded w-24 mb-2" /><div className="h-2.5 bg-gray-100 rounded w-16" /></div>
              </div>
            ))}
          </div>
        ) : artists.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
            <div className="text-4xl mb-4">🎨</div>
            <div className="text-gray-300 font-bold text-lg mb-2">{t('artists.no_results')}</div>
            {tab === 'portugal' && (
              <p className="text-gray-400 text-sm font-medium">
                {distrito ? t('artists.no_results_district').replace('{district}', distrito) : t('artists.no_results_portugal')}<br/>
                <button onClick={() => setTab('todos')} className="text-blue-500 font-bold mt-1">{t('artists.see_all')}</button>
              </p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {artists.map(a => <ArtistCard key={a.id} a={a} />)}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-10 pt-6 border-t border-gray-100">
            <button onClick={() => setPage(p => Math.max(1,p-1))} disabled={page===1} className="w-8 h-8 border border-gray-200 rounded-lg text-sm font-bold text-gray-400 disabled:opacity-30">‹</button>
            {Array.from({length: Math.min(5, totalPages)}, (_,i) => i+1).map(p => (
              <button key={p} onClick={() => setPage(p)} className={`w-8 h-8 border rounded-lg text-sm font-bold ${page===p ? 'bg-blue-500 border-blue-500 text-white' : 'border-gray-200 text-gray-500'}`}>{p}</button>
            ))}
            <button onClick={() => setPage(p => Math.min(totalPages,p+1))} disabled={page===totalPages} className="w-8 h-8 border border-gray-200 rounded-lg text-sm font-bold text-gray-400 disabled:opacity-30">›</button>
          </div>
        )}
      </div>
    </div>
  )
}
