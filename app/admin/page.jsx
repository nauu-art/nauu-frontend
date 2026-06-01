'use client'
import { useState, useEffect } from 'react'
import axios from 'axios'
import { Users, Image, Mail, Star, TrendingUp, LogOut, Search, Shield, Settings, Upload, CheckCircle, BarChart2, Layers, ChevronRight, X, Eye, Clock, CreditCard, ShoppingCart } from 'lucide-react'
import dynamic from 'next/dynamic'
const RichEditor = dynamic(() => import('../../components/ui/RichEditor'), { ssr: false })
import toast from 'react-hot-toast'

const api = axios.create({ baseURL: '/api' })

const stripeStatus = (artist) => {
  if (!artist) return null
  if (artist.stripeOnboarded) return { label: 'Ativo', color: 'text-green-400 bg-green-500/10', dot: '🟢' }
  if (artist.stripeAccountId) return { label: 'Em config.', color: 'text-yellow-400 bg-yellow-500/10', dot: '🟡' }
  return { label: 'Não ligado', color: 'text-red-400 bg-red-500/10', dot: '🔴' }
}

const approvalStatus = (status) => {
  const map = {
    APPROVED: { label: 'Aprovado', color: 'text-green-400 bg-green-500/10' },
    PENDING: { label: 'Pendente', color: 'text-yellow-400 bg-yellow-500/10' },
    REJECTED: { label: 'Rejeitado', color: 'text-red-400 bg-red-500/10' },
    DRAFT: { label: 'Rascunho', color: 'text-gray-400 bg-gray-500/10' },
  }
  return map[status] || map.DRAFT
}

const timeAgo = (date) => {
  if (!date) return '—'
  const diff = Date.now() - new Date(date)
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'Hoje'
  if (days === 1) return 'Ontem'
  if (days < 7) return `Há ${days} dias`
  if (days < 30) return `Há ${Math.floor(days/7)} sem.`
  return `Há ${Math.floor(days/30)} meses`
}

export default function AdminPage() {
  const [token, setToken] = useState(null)
  const [loginForm, setLoginForm] = useState({ email: '', password: '' })
  const [logging, setLogging] = useState(false)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [artists, setArtists] = useState([])
  const [artworks, setArtworks] = useState([])
  const [search, setSearch] = useState('')
  const [artistFilter, setArtistFilter] = useState('all')
  const [selectedUser, setSelectedUser] = useState(null)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [logoUrl, setLogoUrl] = useState(null)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [contentData, setContentData] = useState({ termos: { title: '', content: '' }, privacidade: { title: '', content: '' } })
  const [blogPosts, setBlogPosts] = useState([])
  const [newPost, setNewPost] = useState({ title: '', slug: '', content: '' })
  const [savingContent, setSavingContent] = useState('')

  useEffect(() => {
    const t = localStorage.getItem('nauu_admin_token')
    if (t) { setToken(t); api.defaults.headers.common['Authorization'] = `Bearer ${t}` }
  }, [])

  useEffect(() => {
    if (token) { fetchStats(); fetchUsers(); fetchArtists(); fetchArtworks(); fetchSettings(); fetchContent() }
  }, [token])

  const handleUnauthorized = () => {
    localStorage.removeItem('nauu_admin_token')
    setToken(null)
    api.defaults.headers.common['Authorization'] = ''
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setLogging(true)
    try {
      const res = await api.post('/admin/login', loginForm)
      localStorage.setItem('nauu_admin_token', res.data.token)
      api.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`
      setToken(res.data.token)
      toast.success('Bem-vindo, admin!')
    } catch { toast.error('Credenciais inválidas') }
    setLogging(false)
  }

  const fetchStats = async () => { try { const r = await api.get('/admin/stats'); setStats(r.data) } catch (e) { if (e.response?.status === 401) handleUnauthorized() } }
  const fetchUsers = async () => { try { const r = await api.get(`/admin/users?limit=100&search=${search}&type=USER`); setUsers(r.data.data || []) } catch {} }
  const fetchArtists = async () => {
    const statusParam = artistFilter !== 'all' ? `&status=${artistFilter}` : ''
    try { const r = await api.get(`/admin/users?limit=100&search=${search}&type=ARTIST${statusParam}`); setArtists(r.data.data || []) } catch {}
  }
  const fetchArtworks = async () => { try { const r = await api.get(`/admin/artworks?limit=100&search=${search}`); setArtworks(r.data.data || []) } catch {} }
  const fetchSettings = async () => { try { const r = await api.get('/admin/settings'); setLogoUrl(r.data.logoUrl) } catch {} }
  const fetchContent = async () => {
    try {
      const [t, p] = await Promise.all([api.get('/admin/content/termos'), api.get('/admin/content/privacidade')])
      setContentData({ termos: t.data, privacidade: p.data })
    } catch {}
  }

  const fetchUserDetail = async (id) => {
    setLoadingDetail(true)
    try {
      const r = await api.get(`/admin/users/${id}`)
      setSelectedUser(r.data)
    } catch { toast.error('Erro ao carregar utilizador') }
    setLoadingDetail(false)
  }

  const handleBan = async (id, banned, name) => {
    if (!confirm(`${banned ? 'Desbanir' : 'Banir'} ${name}?`)) return
    try { const r = await api.put(`/admin/users/${id}/ban`); toast.success(r.data.message); fetchUsers(); fetchArtists() } catch { toast.error('Erro') }
  }
  const handlePromote = async (id, name) => {
    if (!confirm(`Promover ${name} a artista?`)) return
    try { await api.put(`/admin/users/${id}/promote`); toast.success('Promovido!'); fetchUsers(); fetchArtists() } catch (e) { toast.error(e.response?.data?.error || 'Erro') }
  }
  const handleDelete = async (id, name) => {
    if (!confirm(`Eliminar permanentemente "${name}"? Esta ação é irreversível.`)) return
    try {
      await api.delete(`/admin/users/${id}`)
      toast.success('Utilizador eliminado')
      fetchUsers(); fetchArtists()
      if (selectedUser?.id === id) setSelectedUser(null)
    } catch (e) { toast.error(e.response?.data?.error || 'Erro') }
  }

  const handleApprove = async (artistId, status, name) => {
    const labels = { APPROVED: 'Aprovar', REJECTED: 'Rejeitar', PENDING: 'Colocar pendente' }
    if (!confirm(`${labels[status]} ${name}?`)) return
    try { await api.put(`/admin/artists/${artistId}/approve`, { status }); toast.success('Atualizado!'); fetchArtists(); if (selectedUser) fetchUserDetail(selectedUser.id) } catch { toast.error('Erro') }
  }
  const handleFeatured = async (id) => { try { await api.put(`/admin/artworks/${id}/featured`); fetchArtworks() } catch { toast.error('Erro') } }
  const handleDeleteArtwork = async (id, title) => {
    if (!confirm(`Eliminar "${title}"?`)) return
    try { await api.delete(`/admin/artworks/${id}`); toast.success('Eliminada'); fetchArtworks() } catch { toast.error('Erro') }
  }
  const handleSaveContent = async (key) => {
    setSavingContent(key)
    try { await api.put(`/admin/content/${key}`, contentData[key]); toast.success('Guardado!') } catch { toast.error('Erro') }
    setSavingContent('')
  }
  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0]; if (!file) return
    setUploadingLogo(true)
    try {
      const fd = new FormData(); fd.append('logo', file)
      const r = await api.post('/admin/logo', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      setLogoUrl(r.data.url); toast.success('Logo atualizado!')
    } catch { toast.error('Erro ao fazer upload') }
    setUploadingLogo(false)
  }

  const pendingArtists = artists.filter(a => a.artistProfile?.status === 'PENDING').length

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
    { id: 'artists', label: 'Artistas', icon: Star, badge: pendingArtists },
    { id: 'users', label: 'Utilizadores', icon: Users },
    { id: 'artworks', label: 'Obras', icon: Image },
    { id: 'blog', label: 'Blog', icon: Mail },
    { id: 'settings', label: 'Definições', icon: Settings },
  ]

  if (!token) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <form onSubmit={handleLogin} className="bg-gray-900 border border-gray-800 rounded-2xl p-8 w-full max-w-sm">
        <div className="flex justify-center mb-6"><div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center"><Shield size={22} className="text-blue-400" /></div></div>
        <h1 className="text-xl font-extrabold text-center mb-1">nauu.art Admin</h1>
        <p className="text-sm text-gray-500 text-center mb-6">Acesso restrito</p>
        <div className="flex flex-col gap-3">
          <input type="email" placeholder="EMAIL" value={loginForm.email} onChange={e => setLoginForm(f => ({...f, email: e.target.value}))}
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-500 placeholder:text-gray-600 placeholder:text-xs placeholder:tracking-widest" required />
          <input type="password" placeholder="PASSWORD" value={loginForm.password} onChange={e => setLoginForm(f => ({...f, password: e.target.value}))}
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-500 placeholder:text-gray-600 placeholder:text-xs placeholder:tracking-widest" required />
          <button type="submit" disabled={logging} className="py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-bold text-sm rounded-lg transition-colors">
            {logging ? 'A entrar…' : 'Entrar'}
          </button>
        </div>
      </form>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-950 text-white flex">
      {/* Sidebar */}
      <div className="w-52 bg-gray-900 border-r border-gray-800 flex flex-col flex-shrink-0">
        <div className="px-5 py-4 border-b border-gray-800">
          <div className="text-sm font-extrabold text-white">nauu.art</div>
          <div className="text-xs text-gray-500">Admin Panel</div>
        </div>
        <nav className="flex-1 py-3 px-2">
          {tabs.map(t => (
            <button key={t.id} onClick={() => { setActiveTab(t.id); setSearch('') }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-semibold transition-colors mb-0.5 ${activeTab === t.id ? 'bg-blue-500/20 text-blue-400' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}>
              <t.icon size={15} />
              {t.label}
              {t.badge > 0 && <span className="ml-auto bg-yellow-500 text-black text-xs font-extrabold px-1.5 py-0.5 rounded-full">{t.badge}</span>}
            </button>
          ))}
        </nav>
        <button onClick={() => { localStorage.removeItem('nauu_admin_token'); setToken(null) }}
          className="flex items-center gap-2 px-5 py-4 text-sm text-gray-500 hover:text-red-400 transition-colors border-t border-gray-800">
          <LogOut size={14} /> Sair
        </button>
      </div>

      {/* Main */}
      <div className="flex-1 overflow-auto">
        <div className="p-6 max-w-6xl mx-auto">

          {/* Dashboard */}
          {activeTab === 'dashboard' && stats && (
            <div>
              <h1 className="text-2xl font-extrabold mb-6">Dashboard</h1>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {[
                  { label: 'Artistas Pendentes', value: pendingArtists, icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
                  { label: 'Artistas Ativos', value: artists.filter(a => a.artistProfile?.status === 'APPROVED').length, icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-500/10' },
                  { label: 'Obras Publicadas', value: stats.stats?.totalArtworks || 0, icon: Image, color: 'text-blue-400', bg: 'bg-blue-500/10' },
                  { label: 'Utilizadores', value: stats.stats?.totalUsers || 0, icon: Users, color: 'text-purple-400', bg: 'bg-purple-500/10' },
                ].map(m => (
                  <div key={m.label} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="text-xs font-bold uppercase tracking-widest text-gray-500">{m.label}</div>
                      <div className={`w-8 h-8 ${m.bg} rounded-lg flex items-center justify-center`}><m.icon size={14} className={m.color} /></div>
                    </div>
                    <div className="text-3xl font-extrabold">{m.value}</div>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                  <h2 className="text-sm font-extrabold uppercase tracking-widest text-gray-500 mb-4">Últimos utilizadores</h2>
                  <div className="flex flex-col gap-3">
                    {stats.recentUsers?.map(u => (
                      <div key={u.id} className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-extrabold text-xs flex-shrink-0">{u.name?.[0]}</div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-bold truncate">{u.name}</div>
                          <div className="text-xs text-gray-500 truncate">{u.email}</div>
                        </div>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${u.accountType === 'ARTIST' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'}`}>{u.accountType === 'ARTIST' ? 'Artista' : 'User'}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                  <h2 className="text-sm font-extrabold uppercase tracking-widest text-gray-500 mb-4">Últimas obras</h2>
                  <div className="flex flex-col gap-3">
                    {stats.recentArtworks?.map(w => (
                      <div key={w.id} className="flex items-center gap-3">
                        <div className="w-10 h-8 rounded-lg bg-gray-800 overflow-hidden flex-shrink-0">
                          {w.images?.[0] ? <img src={w.images[0].imageUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs">{w.title?.[0]}</div>}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-bold truncate">{w.title}</div>
                          <div className="text-xs text-gray-500">{w.artist?.artistName}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Artistas */}
          {activeTab === 'artists' && (
            <div>
              <div className="flex justify-between items-center mb-6 gap-3 flex-wrap">
                <h1 className="text-2xl font-extrabold">Artistas</h1>
                <div className="flex items-center gap-2">
                  <div className="flex gap-1 bg-gray-900 border border-gray-800 rounded-lg p-1">
                    {[['all','Todos'],['PENDING','Pendentes'],['APPROVED','Aprovados'],['REJECTED','Rejeitados']].map(([v,l]) => (
                      <button key={v} onClick={() => { setArtistFilter(v); setTimeout(fetchArtists, 50) }}
                        className={`text-xs font-bold px-3 py-1.5 rounded-md transition-colors ${artistFilter === v ? 'bg-blue-500 text-white' : 'text-gray-400 hover:text-white'}`}>{l}</button>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 bg-gray-900 border border-gray-800 rounded-lg px-3 py-2">
                    <Search size={14} className="text-gray-500" />
                    <input value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && fetchArtists()}
                      placeholder="Pesquisar…" className="bg-transparent outline-none text-sm w-32 placeholder:text-gray-600" />
                  </div>
                </div>
              </div>
              <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                <table className="w-full">
                  <thead><tr className="border-b border-gray-800">
                    {['Artista','Aprovação','Stripe','Obras','Vendas','Último login','Ações'].map((h,i) => (
                      <th key={h} className={`px-4 py-3 text-xs font-bold uppercase tracking-widest text-gray-500 ${i === 6 ? 'text-right' : 'text-left'}`}>{h}</th>
                    ))}
                  </tr></thead>
                  <tbody>
                    {artists.map(u => {
                      const stripe = stripeStatus(u.artistProfile)
                      const approval = approvalStatus(u.artistProfile?.status)
                      return (
                        <tr key={u.id} className="border-b border-gray-800/50 last:border-0 hover:bg-gray-800/30 cursor-pointer" onClick={() => fetchUserDetail(u.id)}>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 font-extrabold text-xs">{u.name?.[0]}</div>
                              <div>
                                <div className="text-sm font-bold">{u.artistProfile?.artistName || u.name}</div>
                                <div className="text-xs text-gray-500">{u.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3"><span className={`text-xs font-bold px-2 py-1 rounded-full ${approval.color}`}>{approval.label}</span></td>
                          <td className="px-4 py-3">{stripe ? <span className={`text-xs font-bold px-2 py-1 rounded-full ${stripe.color}`}>{stripe.dot} {stripe.label}</span> : '—'}</td>
                          <td className="px-4 py-3 text-sm font-bold">{u.artistProfile?._count?.artworks ?? '—'}</td>
                          <td className="px-4 py-3 text-sm font-bold">{u._count?.orders ?? 0}</td>
                          <td className="px-4 py-3 text-xs text-gray-500">{timeAgo(u.lastLoginAt)}</td>
                          <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                            <div className="flex gap-1.5 justify-end flex-wrap">
                              {u.artistProfile?.status !== 'APPROVED' && <button onClick={() => handleApprove(u.artistProfile?.id, 'APPROVED', u.name)} className="text-xs font-bold px-2 py-1 bg-green-500/20 text-green-400 rounded-lg">Aprovar</button>}
                              {u.artistProfile?.status !== 'REJECTED' && <button onClick={() => handleApprove(u.artistProfile?.id, 'REJECTED', u.name)} className="text-xs font-bold px-2 py-1 bg-red-500/20 text-red-400 rounded-lg">Rejeitar</button>}
                              {u.accountType !== 'ADMIN' && <button onClick={() => handleBan(u.id, u.isBanned, u.name)} className={`text-xs font-bold px-2 py-1 rounded-lg ${u.isBanned ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>{u.isBanned ? 'Desbanir' : 'Banir'}</button>}
                              {u.accountType !== 'ADMIN' && <button onClick={() => handleDelete(u.id, u.name)} className="text-xs font-bold px-2 py-1 bg-gray-700 text-gray-400 hover:bg-red-500/20 hover:text-red-400 rounded-lg transition-colors">🗑</button>}
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Utilizadores */}
          {activeTab === 'users' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-extrabold">Utilizadores</h1>
                <div className="flex items-center gap-2 bg-gray-900 border border-gray-800 rounded-lg px-3 py-2">
                  <Search size={14} className="text-gray-500" />
                  <input value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && fetchUsers()}
                    placeholder="Pesquisar…" className="bg-transparent outline-none text-sm w-40 placeholder:text-gray-600" />
                </div>
              </div>
              <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                <table className="w-full">
                  <thead><tr className="border-b border-gray-800">
                    {['Utilizador','Estado','Registo','Último login','Ações'].map((h,i) => (
                      <th key={h} className={`px-4 py-3 text-xs font-bold uppercase tracking-widest text-gray-500 ${i === 4 ? 'text-right' : 'text-left'}`}>{h}</th>
                    ))}
                  </tr></thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u.id} className="border-b border-gray-800/50 last:border-0 hover:bg-gray-800/30 cursor-pointer" onClick={() => fetchUserDetail(u.id)}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-extrabold text-xs">{u.name?.[0]}</div>
                            <div><div className="text-sm font-bold">{u.name}</div><div className="text-xs text-gray-500">{u.email}</div></div>
                          </div>
                        </td>
                        <td className="px-4 py-3"><span className={`text-xs font-bold px-2 py-1 rounded-full ${u.isBanned ? 'bg-red-500/20 text-red-400' : u.isEmailVerified ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>{u.isBanned ? 'Banido' : u.isEmailVerified ? 'Ativo' : 'Pendente'}</span></td>
                        <td className="px-4 py-3 text-xs text-gray-500">{new Date(u.createdAt).toLocaleDateString('pt-PT')}</td>
                        <td className="px-4 py-3 text-xs text-gray-500">{timeAgo(u.lastLoginAt)}</td>
                        <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                          <div className="flex gap-1.5 justify-end">
                            <button onClick={() => handlePromote(u.id, u.name)} className="text-xs font-bold px-2.5 py-1.5 bg-purple-500/20 text-purple-400 rounded-lg">→ Artista</button>
                            <button onClick={() => handleBan(u.id, u.isBanned, u.name)} className={`text-xs font-bold px-2.5 py-1.5 rounded-lg ${u.isBanned ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>{u.isBanned ? 'Desbanir' : 'Banir'}</button>
                            <button onClick={() => handleDelete(u.id, u.name)} className="text-xs font-bold px-2.5 py-1.5 bg-gray-700 text-gray-400 hover:bg-red-500/20 hover:text-red-400 rounded-lg transition-colors">🗑</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Obras */}
          {activeTab === 'artworks' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-extrabold">Obras</h1>
                <div className="flex items-center gap-2 bg-gray-900 border border-gray-800 rounded-lg px-3 py-2">
                  <Search size={14} className="text-gray-500" />
                  <input value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && fetchArtworks()}
                    placeholder="Pesquisar…" className="bg-transparent outline-none text-sm w-40 placeholder:text-gray-600" />
                </div>
              </div>
              <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                <table className="w-full">
                  <thead><tr className="border-b border-gray-800">
                    {['Obra','Artista','Preço','Destaque','Ações'].map((h,i) => (
                      <th key={h} className={`px-4 py-3 text-xs font-bold uppercase tracking-widest text-gray-500 ${i === 4 ? 'text-right' : 'text-left'}`}>{h}</th>
                    ))}
                  </tr></thead>
                  <tbody>
                    {artworks.map(w => (
                      <tr key={w.id} className="border-b border-gray-800/50 last:border-0 hover:bg-gray-800/30">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-9 rounded-lg bg-gray-800 overflow-hidden flex-shrink-0">
                              {w.images?.[0] ? <img src={w.images[0].imageUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs">{w.title?.[0]}</div>}
                            </div>
                            <div className="text-sm font-bold">{w.title}</div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-400">{w.artist?.artistName}</td>
                        <td className="px-4 py-3 text-sm font-bold">{w.priceOnRequest ? 'Sob consulta' : w.price ? `€ ${Number(w.price).toLocaleString('pt-PT')}` : '—'}</td>
                        <td className="px-4 py-3"><span className={`text-xs font-bold px-2 py-1 rounded-full ${w.isFeatured ? 'bg-amber-500/20 text-amber-400' : 'bg-gray-800 text-gray-500'}`}>{w.isFeatured ? '★ Destaque' : 'Normal'}</span></td>
                        <td className="px-4 py-3"><div className="flex gap-1.5 justify-end">
                          <button onClick={() => handleFeatured(w.id)} className={`text-xs font-bold px-2.5 py-1.5 rounded-lg ${w.isFeatured ? 'bg-gray-800 text-gray-400' : 'bg-amber-500/20 text-amber-400'}`}>{w.isFeatured ? 'Remover' : '★ Destacar'}</button>
                          <button onClick={() => handleDeleteArtwork(w.id, w.title)} className="text-xs font-bold px-2.5 py-1.5 bg-red-500/20 text-red-400 rounded-lg">Eliminar</button>
                        </div></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Blog */}
          {activeTab === 'blog' && (
            <div>
              <h1 className="text-2xl font-extrabold mb-6">Blog</h1>
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 mb-6">
                <h2 className="text-sm font-extrabold uppercase tracking-widest text-gray-500 mb-4">Novo post</h2>
                <div className="flex flex-col gap-3">
                  <input value={newPost.title} onChange={e => setNewPost(f => ({...f, title: e.target.value}))} placeholder="Título" className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm outline-none" />
                  <input value={newPost.slug} onChange={e => setNewPost(f => ({...f, slug: e.target.value.toLowerCase().replace(/\s+/g,'-')}))} placeholder="slug-do-post" className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm outline-none" />
                  <RichEditor value={newPost.content} onChange={v => setNewPost(f => ({...f, content: v}))} placeholder="Conteúdo…" />
                  <button onClick={async () => { try { await api.post('/admin/blog', newPost); toast.success('Post criado!'); setNewPost({ title:'', slug:'', content:'' }); const r = await api.get('/admin/blog'); setBlogPosts(r.data) } catch (e) { toast.error(e.response?.data?.error || 'Erro') } }} className="py-2 bg-blue-500 hover:bg-blue-600 text-white font-bold text-sm rounded-lg">Publicar</button>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                {blogPosts.map(p => (
                  <div key={p.key} className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex justify-between items-center">
                    <div><div className="font-bold">{p.title}</div><div className="text-xs text-gray-500">{p.key}</div></div>
                    <button onClick={async () => { if (!confirm('Eliminar post?')) return; await api.delete(`/admin/blog/${p.key}`); const r = await api.get('/admin/blog'); setBlogPosts(r.data) }} className="text-xs font-bold px-3 py-1.5 bg-red-500/20 text-red-400 rounded-lg">Eliminar</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Definições */}
          {activeTab === 'settings' && (
            <div>
              <h1 className="text-2xl font-extrabold mb-6">Definições</h1>
              <div className="grid gap-6">
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                  <h2 className="text-sm font-extrabold uppercase tracking-widest text-gray-500 mb-4">Logo</h2>
                  {logoUrl && <img src={logoUrl} alt="Logo" className="h-10 mb-4 opacity-80" />}
                  <label className="flex items-center gap-2 cursor-pointer w-fit px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm font-bold text-gray-300 hover:border-blue-500 transition-colors">
                    <Upload size={14} /> {uploadingLogo ? 'A fazer upload…' : 'Fazer upload do logo'}
                    <input type="file" accept=".svg,.png,.jpg" className="hidden" onChange={handleLogoUpload} />
                  </label>
                </div>
                {['termos','privacidade'].map(key => (
                  <div key={key} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                    <h2 className="text-sm font-extrabold uppercase tracking-widest text-gray-500 mb-4">{key === 'termos' ? 'Termos De Uso' : 'Política De Privacidade'}</h2>
                    <div className="flex flex-col gap-3">
                      <div><label className="text-xs font-bold uppercase text-gray-500 mb-1 block">Título</label>
                        <input value={contentData[key]?.title || ''} onChange={e => setContentData(d => ({...d, [key]: {...d[key], title: e.target.value}}))} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm outline-none" /></div>
                      <div><label className="text-xs font-bold uppercase text-gray-500 mb-1 block">Conteúdo</label>
                        <RichEditor value={contentData[key]?.content || ''} onChange={v => setContentData(d => ({...d, [key]: {...d[key], content: v}}))} /></div>
                      <button onClick={() => handleSaveContent(key)} disabled={savingContent === key} className="py-2 bg-blue-500 hover:bg-blue-600 text-white font-bold text-sm rounded-lg w-fit px-6">
                        {savingContent === key ? 'A guardar…' : 'Guardar'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Drawer de detalhe do utilizador */}
      {(selectedUser || loadingDetail) && (
        <div className="fixed inset-0 bg-black/60 z-50 flex justify-end" onClick={() => setSelectedUser(null)}>
          <div className="w-full max-w-md bg-gray-900 border-l border-gray-800 overflow-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
              <h2 className="font-extrabold">Perfil</h2>
              <button onClick={() => setSelectedUser(null)} className="text-gray-500 hover:text-white"><X size={18} /></button>
            </div>
            {loadingDetail ? (
              <div className="flex items-center justify-center h-48 text-gray-500">A carregar…</div>
            ) : selectedUser && (
              <div className="p-5 flex flex-col gap-5">
                {/* Info */}
                <div>
                  <div className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">Informação</div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-extrabold text-lg">{selectedUser.name?.[0]}</div>
                    <div><div className="font-extrabold">{selectedUser.name}</div><div className="text-sm text-gray-500">{selectedUser.email}</div></div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="bg-gray-800 rounded-lg p-2.5"><div className="text-xs text-gray-500 mb-1">Registo</div><div className="font-bold">{new Date(selectedUser.createdAt).toLocaleDateString('pt-PT')}</div></div>
                    <div className="bg-gray-800 rounded-lg p-2.5"><div className="text-xs text-gray-500 mb-1">Último login</div><div className="font-bold">{timeAgo(selectedUser.lastLoginAt)}</div></div>
                    <div className="bg-gray-800 rounded-lg p-2.5"><div className="text-xs text-gray-500 mb-1">País</div><div className="font-bold">{selectedUser.country || '—'}</div></div>
                    <div className="bg-gray-800 rounded-lg p-2.5"><div className="text-xs text-gray-500 mb-1">Cidade</div><div className="font-bold">{selectedUser.city || '—'}</div></div>
                  </div>
                </div>

                {/* Stats */}
                <div>
                  <div className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">Estatísticas</div>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    {selectedUser.artistProfile && <div className="bg-gray-800 rounded-lg p-2.5 text-center"><div className="text-lg font-extrabold">{selectedUser.artistProfile._count?.artworks || 0}</div><div className="text-xs text-gray-500">Obras</div></div>}
                    <div className="bg-gray-800 rounded-lg p-2.5 text-center"><div className="text-lg font-extrabold">{selectedUser._count?.orders || 0}</div><div className="text-xs text-gray-500">Vendas</div></div>
                    {selectedUser.artistProfile && <div className="bg-gray-800 rounded-lg p-2.5 text-center"><div className="text-lg font-extrabold">{selectedUser.artistProfile._count?.followers || 0}</div><div className="text-xs text-gray-500">Seguidores</div></div>}
                    <div className="bg-gray-800 rounded-lg p-2.5 text-center"><div className="text-lg font-extrabold">{selectedUser._count?.favorites || 0}</div><div className="text-xs text-gray-500">Favoritos</div></div>
                    <div className="bg-gray-800 rounded-lg p-2.5 text-center"><div className="text-lg font-extrabold">{selectedUser._count?.posts || 0}</div><div className="text-xs text-gray-500">Posts</div></div>
                  </div>
                </div>

                {/* Financeiro */}
                {selectedUser.artistProfile && (
                  <div>
                    <div className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">Financeiro</div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="bg-gray-800 rounded-lg p-2.5">
                        <div className="text-xs text-gray-500 mb-1">Stripe</div>
                        {(() => { const s = stripeStatus(selectedUser.artistProfile); return s ? <div className={`font-bold text-xs ${s.color.split(' ')[0]}`}>{s.dot} {s.label}</div> : <div className="font-bold text-gray-500">—</div> })()}
                      </div>
                      <div className="bg-gray-800 rounded-lg p-2.5"><div className="text-xs text-gray-500 mb-1">Receita total</div><div className="font-bold">€ {(selectedUser.totalRevenue || 0).toFixed(2)}</div></div>
                    </div>
                  </div>
                )}

                {/* Aprovação */}
                {selectedUser.artistProfile && (
                  <div>
                    <div className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">Aprovação</div>
                    <div className="flex gap-2">
                      <button onClick={() => handleApprove(selectedUser.artistProfile.id, 'APPROVED', selectedUser.name)} className="flex-1 py-2 bg-green-500/20 text-green-400 font-bold text-sm rounded-lg hover:bg-green-500/30 transition-colors">Aprovar</button>
                      <button onClick={() => handleApprove(selectedUser.artistProfile.id, 'PENDING', selectedUser.name)} className="flex-1 py-2 bg-yellow-500/20 text-yellow-400 font-bold text-sm rounded-lg hover:bg-yellow-500/30 transition-colors">Pendente</button>
                      <button onClick={() => handleApprove(selectedUser.artistProfile.id, 'REJECTED', selectedUser.name)} className="flex-1 py-2 bg-red-500/20 text-red-400 font-bold text-sm rounded-lg hover:bg-red-500/30 transition-colors">Rejeitar</button>
                    </div>
                  </div>
                )}

                {/* Ações */}
                <div>
                  <div className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">Ações</div>
                  <div className="flex gap-2">
                    {selectedUser.accountType === 'USER' && <button onClick={() => { handlePromote(selectedUser.id, selectedUser.name); setSelectedUser(null) }} className="flex-1 py-2 bg-purple-500/20 text-purple-400 font-bold text-sm rounded-lg">→ Artista</button>}
                    {selectedUser.accountType !== 'ADMIN' && <button onClick={() => { handleBan(selectedUser.id, selectedUser.isBanned, selectedUser.name); setSelectedUser(null) }} className={`flex-1 py-2 font-bold text-sm rounded-lg ${selectedUser.isBanned ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>{selectedUser.isBanned ? 'Desbanir' : 'Banir'}</button>}
                    {selectedUser.accountType !== 'ADMIN' && <button onClick={() => handleDelete(selectedUser.id, selectedUser.name)} className="flex-1 py-2 bg-gray-700 text-gray-400 hover:bg-red-500/20 hover:text-red-400 font-bold text-sm rounded-lg transition-colors">Eliminar conta</button>}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
