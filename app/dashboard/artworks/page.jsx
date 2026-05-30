'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Plus, Edit, Trash2, Eye, Heart, MessageSquare, LayoutDashboard, Image, Mail, User, LogOut, TrendingUp, BarChart2 } from 'lucide-react'
import { useAuth } from '../../../context/AuthContext'
import DashboardNav from '../../../components/ui/DashboardNav'
import api from '../../../lib/api'
import toast from 'react-hot-toast'

const availColor = (a) => a === 'AVAILABLE' ? '#2ECC71' : a === 'RESERVED' ? '#F39C12' : '#E74C3C'
const availLabel = (a) => a === 'AVAILABLE' ? 'Disponível' : a === 'RESERVED' ? 'Reservado' : 'Vendido'

export default function DashboardArtworksPage() {
  const { user, isArtist, isLoggedIn, loading, logout } = useAuth()
  const router = useRouter()
  const [artworks, setArtworks] = useState([])
  const [loadingArtworks, setLoadingArtworks] = useState(true)
  const [selectedStats, setSelectedStats] = useState(null)
  const [loadingStats, setLoadingStats] = useState(false)
  const [sort, setSort] = useState('createdAt')

  useEffect(() => {
    if (!loading && !isLoggedIn) router.push('/login')
    if (!loading && !isArtist) router.push('/')
  }, [loading, isLoggedIn, isArtist])

  useEffect(() => {
    if (isArtist) fetchArtworks()
  }, [isArtist])

  const fetchArtworks = async () => {
    try {
      const res = await api.get('/artworks/mine/all')
      setArtworks(res.data.data || [])
    } catch {}
    setLoadingArtworks(false)
  }

  const handleDelete = async (id, title) => {
    if (!confirm(`Eliminar "${title}"?`)) return
    try {
      await api.delete(`/artworks/${id}`)
      setArtworks(prev => prev.filter(w => w.id !== id))
      toast.success('Obra eliminada')
    } catch { toast.error('Erro ao eliminar') }
  }

  const fetchStats = async (artwork) => {
    if (selectedStats?.id === artwork.id) { setSelectedStats(null); return }
    setLoadingStats(true)
    try {
      const res = await api.get(`/artists/stats/artwork/${artwork.id}`)
      setSelectedStats({ ...res.data, id: artwork.id })
    } catch { toast.error('Erro ao carregar estatísticas') }
    setLoadingStats(false)
  }

  const sortedArtworks = [...artworks].sort((a, b) => {
    if (sort === 'views') return b.viewCount - a.viewCount
    if (sort === 'title') return a.title.localeCompare(b.title)
    return new Date(b.createdAt) - new Date(a.createdAt)
  })

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/artworks', label: 'As minhas obras', icon: Image, active: true },
    { href: '/dashboard/contacts', label: 'Contactos', icon: Mail },
    { href: '/dashboard/profile', label: 'Editar perfil', icon: User },
  ]

  if (loading || !user) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" /></div>

  return (
    <div className="flex min-h-screen bg-gray-50">
      <DashboardNav />

      <div className="flex-1 flex">
        {/* Lista de obras */}
        <div className={`flex-1 p-8 ${selectedStats ? 'max-w-2xl' : ''}`}>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight" style={{letterSpacing:'-0.03em'}}>As minhas obras</h1>
              <p className="text-sm text-gray-400 font-medium mt-0.5">{artworks.length} obras publicadas</p>
            </div>
            <div className="flex gap-2 items-center">
              <select value={sort} onChange={e => setSort(e.target.value)}
                className="text-sm font-semibold border border-gray-200 rounded-lg px-3 py-2 outline-none bg-white text-gray-600">
                <option value="createdAt">Mais recentes</option>
                <option value="views">Mais vistas</option>
                <option value="title">A-Z</option>
              </select>
              <Link href="/dashboard/artworks/new"
                className="flex items-center gap-2 px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-bold text-sm rounded-xl transition-colors">
                <Plus size={16} /> Nova obra
              </Link>
            </div>
          </div>

          {loadingArtworks ? (
            <div className="space-y-3">{Array.from({length:5}).map((_,i) => <div key={i} className="h-16 bg-white rounded-xl animate-pulse" />)}</div>
          ) : artworks.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-xl border border-gray-100">
              <div className="text-gray-300 font-bold text-lg mb-3">Ainda não tens obras publicadas</div>
              <Link href="/dashboard/artworks/new" className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-500 text-white font-bold text-sm rounded-xl">
                <Plus size={16} /> Publicar primeira obra
              </Link>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left px-4 py-3 text-xs font-extrabold uppercase tracking-widest text-gray-300">Obra</th>
                    <th className="text-left px-4 py-3 text-xs font-extrabold uppercase tracking-widest text-gray-300">Preço</th>
                    <th className="text-left px-4 py-3 text-xs font-extrabold uppercase tracking-widest text-gray-300">Estado</th>
                    <th className="text-center px-4 py-3 text-xs font-extrabold uppercase tracking-widest text-gray-300">Vistas</th>
                    <th className="text-right px-4 py-3 text-xs font-extrabold uppercase tracking-widest text-gray-300">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedArtworks.map(w => (
                    <>
                      <tr key={w.id} className={`border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors ${selectedStats?.id === w.id ? 'bg-blue-50' : ''}`}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-9 rounded-lg bg-blue-50 overflow-hidden flex items-center justify-center flex-shrink-0">
                              {w.images?.[0] ? <img src={w.images[0].imageUrl} alt={w.title} className="w-full h-full object-cover" /> : <span className="text-blue-200 font-extrabold text-sm">{w.title?.[0]}</span>}
                            </div>
                            <div>
                              <div className="text-sm font-bold text-gray-900">{w.title}</div>
                              <div className="text-xs text-gray-400 font-medium">{w.categories?.[0]?.category?.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm font-bold text-gray-700">
                          {w.priceOnRequest ? 'Sob consulta' : w.price ? `€ ${Number(w.price).toLocaleString('pt-PT')}` : '—'}
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{background: availColor(w.availability)+'22', color: availColor(w.availability)}}>
                            {availLabel(w.availability)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="flex items-center justify-center gap-1 text-xs font-bold text-gray-400">
                            <Eye size={12} /> {w.viewCount}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1.5 justify-end">
                            <button onClick={() => fetchStats(w)}
                              className={`w-8 h-8 border rounded-lg flex items-center justify-center transition-colors ${selectedStats?.id === w.id ? 'border-blue-400 text-blue-500 bg-blue-50' : 'border-gray-200 text-gray-400 hover:border-blue-300 hover:text-blue-500'}`}>
                              <BarChart2 size={13} />
                            </button>
                            <Link href={`/dashboard/artworks/${w.id}`}
                              className="w-8 h-8 border border-gray-200 rounded-lg flex items-center justify-center text-gray-400 hover:border-blue-300 hover:text-blue-500 transition-colors">
                              <Edit size={13} />
                            </Link>
                            <button onClick={() => handleDelete(w.id, w.title)}
                              className="w-8 h-8 border border-gray-200 rounded-lg flex items-center justify-center text-gray-400 hover:border-red-300 hover:text-red-400 transition-colors">
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    </>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Painel de estatísticas */}
        {selectedStats && (
          <div className="w-72 border-l border-gray-100 bg-white p-6 flex flex-col gap-5">
            <div>
              <div className="text-xs font-extrabold uppercase tracking-widest text-gray-300 mb-1">Estatísticas</div>
              <div className="text-base font-extrabold text-gray-900">{selectedStats.artwork?.title}</div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Vistas', value: selectedStats.artwork?.viewCount || 0, icon: Eye, color: 'text-blue-500', bg: 'bg-blue-50' },
                { label: 'Favs', value: selectedStats.favorites || 0, icon: Heart, color: 'text-pink-500', bg: 'bg-pink-50' },
                { label: 'Msgs', value: selectedStats.contacts || 0, icon: MessageSquare, color: 'text-green-500', bg: 'bg-green-50' },
              ].map(s => (
                <div key={s.label} className="border border-gray-100 rounded-xl p-3 text-center">
                  <div className={`w-8 h-8 ${s.bg} rounded-lg flex items-center justify-center mx-auto mb-2`}>
                    <s.icon size={14} className={s.color} />
                  </div>
                  <div className="text-xl font-extrabold text-gray-900">{s.value}</div>
                  <div className="text-xs text-gray-400 font-bold">{s.label}</div>
                </div>
              ))}
            </div>

            <div>
              <div className="text-xs font-extrabold uppercase tracking-widest text-gray-300 mb-3">Performance</div>
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500 font-medium">Estado</span>
                  <span className="font-bold" style={{color: availColor(selectedStats.artwork?.availability)}}>
                    {availLabel(selectedStats.artwork?.availability)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500 font-medium">Publicada em</span>
                  <span className="font-bold text-gray-700">
                    {selectedStats.artwork?.createdAt ? new Date(selectedStats.artwork.createdAt).toLocaleDateString('pt-PT') : '—'}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500 font-medium">Taxa contacto</span>
                  <span className="font-bold text-gray-700">
                    {selectedStats.artwork?.viewCount > 0
                      ? `${((selectedStats.contacts / selectedStats.artwork.viewCount) * 100).toFixed(1)}%`
                      : '—'}
                  </span>
                </div>
              </div>
            </div>

            {selectedStats.contacts > 0 && (
              <div>
                <div className="text-xs font-extrabold uppercase tracking-widest text-gray-300 mb-2">Contactos</div>
                <div className="flex flex-wrap gap-1.5">
                  {selectedStats.contactDates?.map((date, i) => (
                    <span key={i} className="text-xs font-bold px-2 py-1 bg-green-50 text-green-600 rounded-lg">
                      {new Date(date).toLocaleDateString('pt-PT', { day: 'numeric', month: 'short' })}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <Link href={`/artwork/${artworks.find(w => w.id === selectedStats.id)?.id}`}
              className="text-xs font-bold text-blue-500 hover:text-blue-600">
              Ver obra pública →
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
