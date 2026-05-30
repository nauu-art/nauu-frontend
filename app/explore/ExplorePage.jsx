'use client'
const CAT_SLUG_MAP = {
  'Pintura': 'pintura', 'Fotografia': 'fotografia', 'Arte Digital': 'arte_digital',
  'Desenho & Ilustração': 'ilustracao', 'Escultura': 'escultura', 'Cerâmica & Olaria': 'ceramica',
  'Gravura & Impressão': 'gravura', 'Têxtil & Arte Fibra': 'textil', 'Street Art & Graffiti': 'street_art',
  'Design Gráfico': 'design_grafico', 'Artesanato': 'artesanato', 'Joalharia & Ourivesaria': 'joalharia',
  'Caligrafia & Lettering': 'caligrafia', 'Arte Multimédia': 'arte_multimedia', 'Performance & Instalação': 'performance'
}

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { Search, X, SlidersHorizontal } from 'lucide-react'
import api from '../../lib/api'
import ArtworkCard from '../../components/ui/ArtworkCard'
import { useLocale } from '../../context/LocaleContext'

export default function ExplorePage() {
  const { t } = useLocale()
  const searchParams = useSearchParams()
  const [artworks, setArtworks] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [activeCategories, setActiveCategories] = useState([])
  const [availability, setAvailability] = useState([])
  const [maxPrice, setMaxPrice] = useState(5000)
  const [sort, setSort] = useState('createdAt_desc')
  const [filtersOpen, setFiltersOpen] = useState(false)

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

  const SORTS = [
    { label: t('explore.sort_recent'), value: 'createdAt_desc' },
    { label: t('explore.sort_oldest'), value: 'createdAt_asc' },
    { label: t('explore.sort_price_asc'), value: 'price_asc' },
    { label: t('explore.sort_price_desc'), value: 'price_desc' },
    { label: t('explore.sort_views'), value: 'viewCount_desc' },
  ]

  const fetchArtworks = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('page', page)
      params.set('limit', 18)
      params.set('sort', sort)
      if (search) params.set('search', search)
      if (maxPrice < 5000) params.set('maxPrice', maxPrice)
      if (activeCategories.length > 0) {
        const slugs = activeCategories.map(k => CATEGORIES.find(c => c.key === k)?.slug).filter(Boolean)
        if (slugs.length === 1) params.set('category', slugs[0])
        else if (slugs.length > 1) params.set('categories', slugs.join(','))
      }
      if (availability.length > 0) params.set('availability', availability.join(','))
      const res = await api.get(`/artworks?${params}`)
      setArtworks(res.data.data || [])
      setTotal(res.data.pagination?.total || 0)
      setTotalPages(res.data.pagination?.totalPages || 1)
    } catch {}
    setLoading(false)
  }, [page, sort, search, activeCategories, maxPrice, availability])

  useEffect(() => { fetchArtworks() }, [fetchArtworks])

  const toggleCategory = (key) => {
    setActiveCategories(prev => prev.includes(key) ? prev.filter(c => c !== key) : [...prev, key])
    setPage(1)
  }

  const activeFiltersCount = activeCategories.length + (maxPrice < 5000 ? 1 : 0) + availability.length

  const activeTags = [
    ...activeCategories.map(c => { const cat = CATEGORIES.find(x => x.key === c); return { label: t(`categories.${c}`) || cat?.pt || c, remove: () => toggleCategory(c) } }),
    ...(maxPrice < 5000 ? [{ label: `Até €${maxPrice}`, remove: () => setMaxPrice(5000) }] : []),
    ...availability.map(v => ({ label: t(`explore.${v.toLowerCase()}`), remove: () => { setAvailability(prev => prev.filter(a => a !== v)); setPage(1) } })),
  ]

  const FilterPanel = () => (
    <div className="flex flex-col gap-6">
      <div>
        <div className="flex justify-between items-center mb-3">
          <div className="text-xs font-extrabold uppercase tracking-widest text-gray-300">{t('explore.category')}</div>
          {activeCategories.length > 0 && (
            <button onClick={() => setActiveCategories([])} className="text-xs text-blue-400 font-bold">{t('explore.clear')}</button>
          )}
        </div>
        <div className="flex flex-col gap-0.5">
          {CATEGORIES.map(cat => (
            <button key={cat.key} onClick={() => toggleCategory(cat.key)}
              className={`flex justify-between items-center px-2.5 py-2 rounded-md text-sm font-semibold transition-all text-left ${activeCategories.includes(cat.key) ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-50'}`}>
              {t(`categories.${cat.key}`) || cat.pt}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="text-xs font-extrabold uppercase tracking-widest text-gray-300 mb-3">{t('explore.max_price')}</div>
        <div className="flex justify-between text-xs font-bold text-gray-400 mb-2">
          <span>€ 0</span><span>€ {maxPrice.toLocaleString('pt-PT')}</span>
        </div>
        <input type="range" min="0" max="5000" step="50" value={maxPrice}
          onChange={e => { setMaxPrice(Number(e.target.value)); setPage(1) }} className="w-full" />
      </div>

      <div>
        <div className="text-xs font-extrabold uppercase tracking-widest text-gray-300 mb-3">{t('explore.availability')}</div>
        <div className="flex flex-col gap-1.5">
          {[['AVAILABLE', t('explore.available'),'#2ECC71'],['RESERVED', t('explore.reserved'),'#F39C12'],['SOLD', t('explore.sold'),'#E74C3C']].map(([val, label, color]) => (
            <button key={val} onClick={() => { setAvailability(prev => prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val]); setPage(1) }}
              className={`flex items-center gap-2 px-2.5 py-2 rounded-md text-sm font-semibold transition-all ${availability.includes(val) ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-50'}`}>
              <div className={`w-4 h-4 rounded border-2 flex items-center justify-center text-xs ${availability.includes(val) ? 'bg-blue-500 border-blue-500 text-white' : 'border-gray-200'}`}>
                {availability.includes(val) && '✓'}
              </div>
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{background: color}}></span>
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )

  return (
    <div className="flex min-h-screen flex-col md:flex-row">

      {/* Sidebar desktop */}
      <aside className="hidden md:flex w-56 flex-shrink-0 border-r border-gray-100 px-5 py-6 flex-col gap-6">
        <FilterPanel />
      </aside>

      {/* Drawer mobile */}
      {filtersOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setFiltersOpen(false)} />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div className="text-base font-extrabold">Filtros</div>
              <button onClick={() => setFiltersOpen(false)} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-700">
                <X size={18} />
              </button>
            </div>
            <div className="overflow-y-auto flex-1 px-5 py-4">
              <FilterPanel />
            </div>
            <div className="px-5 py-4 border-t border-gray-100">
              <button onClick={() => setFiltersOpen(false)}
                className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl transition-colors">
                Ver {total} obras
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 px-4 md:px-8 py-5">

        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-xl md:text-2xl font-extrabold tracking-tight">{t('explore.title')}</h1>
            <p className="text-xs text-gray-400 font-medium mt-0.5">{total.toLocaleString('pt-PT')} {t('explore.found').replace('{count}', '').trim()}</p>
          </div>
          <select value={sort} onChange={e => { setSort(e.target.value); setPage(1) }}
            className="text-sm font-semibold border border-gray-200 rounded-lg px-2 py-2 outline-none bg-white text-gray-600 max-w-[140px] md:max-w-none">
            {SORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>

        {/* Search + filtros mobile */}
        <div className="flex gap-2 mb-4">
          <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2.5 bg-gray-50 flex-1">
            <Search size={15} className="text-gray-300 flex-shrink-0" />
            <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
              placeholder={t('explore.search')}
              className="bg-transparent outline-none text-sm font-medium w-full placeholder:text-gray-300" />
            {search && <button onClick={() => { setSearch(''); setPage(1) }}><X size={13} className="text-gray-300" /></button>}
          </div>
          <button onClick={() => setFiltersOpen(true)}
            className={`md:hidden flex items-center gap-1.5 px-3 py-2.5 border rounded-lg text-sm font-bold transition-all ${activeFiltersCount > 0 ? 'bg-blue-500 border-blue-500 text-white' : 'border-gray-200 text-gray-500 bg-white'}`}>
            <SlidersHorizontal size={15} />
            {activeFiltersCount > 0 && <span>{activeFiltersCount}</span>}
          </button>
        </div>

        {/* Tags activas */}
        {activeTags.length > 0 && (
          <div className="flex gap-2 flex-wrap mb-4">
            {activeTags.map((tag, i) => (
              <span key={i} className="flex items-center gap-1.5 text-xs font-bold bg-blue-50 text-blue-600 px-3 py-1.5 rounded-full">
                {tag.label}<button onClick={tag.remove}><X size={12}/></button>
              </span>
            ))}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {Array.from({length:9}).map((_,i) => <div key={i} className="rounded-xl bg-gray-100 animate-pulse aspect-[4/5]" />)}
          </div>
        ) : artworks.length === 0 ? (
          <div className="text-center py-24 text-gray-300 font-bold text-lg">{t('explore.no_results')}</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {artworks.map(w => <ArtworkCard key={w.id} artwork={w} />)}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-8 pt-6 border-t border-gray-100">
            <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page===1} className="w-8 h-8 border border-gray-200 rounded-lg text-sm font-bold text-gray-400 disabled:opacity-30">‹</button>
            {Array.from({length: Math.min(5, totalPages)}, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setPage(p)} className={`w-8 h-8 border rounded-lg text-sm font-bold ${page===p ? 'bg-blue-500 border-blue-500 text-white' : 'border-gray-200 text-gray-500'}`}>{p}</button>
            ))}
            <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page===totalPages} className="w-8 h-8 border border-gray-200 rounded-lg text-sm font-bold text-gray-400 disabled:opacity-30">›</button>
          </div>
        )}
      </div>
    </div>
  )
}
