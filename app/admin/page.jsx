'use client'
import { useState, useEffect } from 'react'
import axios from 'axios'
import { Users, Image, Mail, Star, TrendingUp, LogOut, Search, Shield, Settings, Upload, CheckCircle } from 'lucide-react'
import dynamic from 'next/dynamic'
const RichEditor = dynamic(() => import('../../components/ui/RichEditor'), { ssr: false })
import toast from 'react-hot-toast'

const api = axios.create({ baseURL: '/api' })

export default function AdminPage() {
  const [token, setToken] = useState(null)
  const [loginForm, setLoginForm] = useState({ email: '', password: '' })
  const [logging, setLogging] = useState(false)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [artworks, setArtworks] = useState([])
  const [search, setSearch] = useState('')
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
    if (token) { fetchStats(); fetchUsers(); fetchArtworks(); fetchSettings(); fetchContent() }
  }, [token])

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

  const handleUnauthorized = () => {
    localStorage.removeItem('nauu_admin_token')
    setToken(null)
    toast.error('Sessão expirada. Faz login novamente.')
  }

  const fetchStats = async () => { try { const r = await api.get('/admin/stats'); setStats(r.data) } catch (e) { if (e.response?.status === 401) handleUnauthorized() } }
  const fetchUsers = async () => { try { const r = await api.get(`/admin/users?limit=50&search=${search}`); setUsers(r.data.data || []) } catch {} }
  const fetchArtworks = async () => { try { const r = await api.get(`/admin/artworks?limit=50&search=${search}`); setArtworks(r.data.data || []) } catch {} }
  const fetchSettings = async () => { try { const r = await api.get('/admin/settings'); setLogoUrl(r.data.logoUrl) } catch {} }
  const fetchContent = async () => {
    try {
      const [t, p, b] = await Promise.all([
        api.get('/admin/content/termos'),
        api.get('/admin/content/privacidade'),
        api.get('/admin/blog'),
      ])
      setContentData({ termos: t.data, privacidade: p.data })
      setBlogPosts(b.data || [])
    } catch {}
  }

  const handleBan = async (id, isBanned, name) => {
    if (!confirm(`${isBanned ? 'Remover ban de' : 'Banir'} ${name}?`)) return
    try { const r = await api.put(`/admin/users/${id}/ban`); toast.success(r.data.message); fetchUsers() } catch { toast.error('Erro') }
  }
  const handlePromote = async (id, name) => {
    if (!confirm(`Promover ${name} a artista?`)) return
    try { await api.put(`/admin/users/${id}/promote`); toast.success('Promovido!'); fetchUsers() } catch (e) { toast.error(e.response?.data?.error || 'Erro') }
  }
  const handleFeatured = async (id) => { try { const r = await api.put(`/admin/artworks/${id}/featured`); toast.success(r.data.message); fetchArtworks() } catch { toast.error('Erro') } }
  const handleDeleteArtwork = async (id, title) => {
    if (!confirm(`Eliminar "${title}"?`)) return
    try { await api.delete(`/admin/artworks/${id}`); toast.success('Eliminado'); fetchArtworks() } catch { toast.error('Erro') }
  }
  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingLogo(true)
    try {
      const fd = new FormData()
      fd.append('logo', file)
      const r = await api.post('/admin/logo', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      setLogoUrl(r.data.url)
      toast.success('Logo atualizado! Faz rebuild para aplicar.')
    } catch { toast.error('Erro ao fazer upload') }
    setUploadingLogo(false)
  }

  const logout = () => { localStorage.removeItem('nauu_admin_token'); setToken(null) }

  if (!token) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mx-auto mb-4"><Shield size={24} className="text-white" /></div>
          <h1 className="text-xl font-extrabold text-white">nauu.art Admin</h1>
          <p className="text-gray-500 text-sm mt-1">Acesso restrito</p>
        </div>
        <form onSubmit={handleLogin} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 flex flex-col gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-1.5">Email</label>
            <input type="email" value={loginForm.email} onChange={e => setLoginForm(f => ({...f, email: e.target.value}))}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3.5 py-2.5 text-sm text-white outline-none focus:border-blue-500" placeholder="admin@nauu.art" required />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-1.5">Password</label>
            <input type="password" value={loginForm.password} onChange={e => setLoginForm(f => ({...f, password: e.target.value}))}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3.5 py-2.5 text-sm text-white outline-none focus:border-blue-500" placeholder="••••••••" required />
          </div>
          <button type="submit" disabled={logging} className="w-full py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl text-sm">
            {logging ? 'A entrar…' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
    { id: 'users', label: 'Utilizadores', icon: Users },
    { id: 'artworks', label: 'Obras', icon: Image },
    { id: 'settings', label: 'Definições', icon: Settings },
    { id: 'content', label: 'Conteúdo', icon: Settings },
    { id: 'blog', label: 'Blog', icon: Settings },
  ]

  return (
    <div className="flex min-h-screen bg-gray-950 text-white">
      <aside className="w-52 bg-gray-900 border-r border-gray-800 flex flex-col">
        <div className="p-5 border-b border-gray-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center"><Shield size={16} className="text-white" /></div>
            <div><div className="text-sm font-extrabold">nauu.art</div><div className="text-xs text-gray-500">Admin Panel</div></div>
          </div>
        </div>
        <nav className="flex-1 p-2">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-2.5 w-full px-3 py-2.5 rounded-lg text-sm font-semibold transition-all mb-0.5 ${activeTab === t.id ? 'bg-blue-500/20 text-blue-400' : 'text-gray-400 hover:bg-gray-800'}`}>
              <t.icon size={15} />{t.label}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-gray-800">
          <button onClick={logout} className="flex items-center gap-2.5 px-3 py-2 text-sm font-semibold text-red-400 hover:bg-red-500/10 rounded-lg w-full">
            <LogOut size={15} /> Sair
          </button>
        </div>
      </aside>

      <div className="flex-1 p-8 overflow-auto">

        {activeTab === 'dashboard' && stats && (
          <div>
            <h1 className="text-2xl font-extrabold mb-6">Dashboard</h1>
            <div className="grid grid-cols-4 gap-4 mb-8">
              {[
                { label: 'Utilizadores', value: stats.stats.totalUsers, icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10' },
                { label: 'Artistas', value: stats.stats.totalArtists, icon: Star, color: 'text-purple-400', bg: 'bg-purple-500/10' },
                { label: 'Obras', value: stats.stats.totalArtworks, icon: Image, color: 'text-green-400', bg: 'bg-green-500/10' },
                { label: 'Contactos', value: stats.stats.totalContacts, icon: Mail, color: 'text-amber-400', bg: 'bg-amber-500/10' },
              ].map(m => (
                <div key={m.label} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                  <div className="flex justify-between mb-3">
                    <div className="text-xs font-bold uppercase tracking-widest text-gray-500">{m.label}</div>
                    <div className={`w-8 h-8 ${m.bg} rounded-lg flex items-center justify-center`}><m.icon size={15} className={m.color} /></div>
                  </div>
                  <div className="text-3xl font-extrabold">{m.value}</div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-5">
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <h2 className="text-sm font-extrabold mb-4 text-gray-300">Últimos utilizadores</h2>
                {stats.recentUsers.map(u => (
                  <div key={u.id} className="flex items-center gap-3 py-2 border-b border-gray-800 last:border-0">
                    <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-extrabold text-xs">{u.name?.[0]}</div>
                    <div className="flex-1 min-w-0"><div className="text-sm font-bold truncate">{u.name}</div><div className="text-xs text-gray-500 truncate">{u.email}</div></div>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${u.accountType === 'ARTIST' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'}`}>
                      {u.accountType === 'ARTIST' ? 'Artista' : 'User'}
                    </span>
                  </div>
                ))}
              </div>
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <h2 className="text-sm font-extrabold mb-4 text-gray-300">Últimas obras</h2>
                {stats.recentArtworks.map(w => (
                  <div key={w.id} className="flex items-center gap-3 py-2 border-b border-gray-800 last:border-0">
                    <div className="w-10 h-8 rounded bg-gray-800 overflow-hidden flex-shrink-0 flex items-center justify-center text-gray-600 text-xs font-extrabold">
                      {w.images?.[0] ? <img src={w.images[0].imageUrl} className="w-full h-full object-cover" /> : w.title?.[0]}
                    </div>
                    <div className="flex-1 min-w-0"><div className="text-sm font-bold truncate">{w.title}</div><div className="text-xs text-gray-500">{w.artist?.artistName}</div></div>
                    {w.isFeatured && <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400">★</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

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
                  {['Utilizador','Tipo','Estado','Registo','Ações'].map((h,i) => (
                    <th key={h} className={`px-4 py-3 text-xs font-bold uppercase tracking-widest text-gray-500 ${i === 4 ? 'text-right' : 'text-left'}`}>{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id} className="border-b border-gray-800/50 last:border-0 hover:bg-gray-800/30">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-extrabold text-xs">{u.name?.[0]}</div>
                          <div><div className="text-sm font-bold">{u.name}</div><div className="text-xs text-gray-500">{u.email}</div></div>
                        </div>
                      </td>
                      <td className="px-4 py-3"><span className={`text-xs font-bold px-2 py-1 rounded-full ${u.accountType === 'ARTIST' ? 'bg-purple-500/20 text-purple-400' : u.accountType === 'ADMIN' ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'}`}>{u.accountType === 'ARTIST' ? 'Artista' : u.accountType === 'ADMIN' ? 'Admin' : 'User'}</span></td>
                      <td className="px-4 py-3"><span className={`text-xs font-bold px-2 py-1 rounded-full ${u.isBanned ? 'bg-red-500/20 text-red-400' : u.isEmailVerified ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>{u.isBanned ? 'Banido' : u.isEmailVerified ? 'Ativo' : 'Pendente'}</span></td>
                      <td className="px-4 py-3 text-xs text-gray-500">{new Date(u.createdAt).toLocaleDateString('pt-PT')}</td>
                      <td className="px-4 py-3"><div className="flex gap-1.5 justify-end">
                        {u.accountType === 'USER' && <button onClick={() => handlePromote(u.id, u.name)} className="text-xs font-bold px-2.5 py-1.5 bg-purple-500/20 text-purple-400 rounded-lg">→ Artista</button>}
                        {u.accountType !== 'ADMIN' && <button onClick={() => handleBan(u.id, u.isBanned, u.name)} className={`text-xs font-bold px-2.5 py-1.5 rounded-lg ${u.isBanned ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>{u.isBanned ? 'Desbanir' : 'Banir'}</button>}
                      </div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

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
                          <div className="w-12 h-9 rounded-lg bg-gray-800 overflow-hidden flex-shrink-0 flex items-center justify-center text-gray-600 text-sm font-extrabold">
                            {w.images?.[0] ? <img src={w.images[0].imageUrl} className="w-full h-full object-cover" /> : w.title?.[0]}
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

        {activeTab === 'content' && (
          <div>
            <h1 className="text-2xl font-extrabold mb-6">Conteúdo do site</h1>
            {['termos', 'privacidade'].map(key => (
              <div key={key} className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-5 max-w-2xl">
                <h2 className="text-sm font-extrabold text-gray-300 mb-4 capitalize">{key === 'termos' ? 'Termos de Uso' : 'Política de Privacidade'}</h2>
                <div className="flex flex-col gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-1.5">Título</label>
                    <input value={contentData[key]?.title || ''} onChange={e => setContentData(d => ({...d, [key]: {...d[key], title: e.target.value}}))}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3.5 py-2.5 text-sm text-white outline-none focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-1.5">Conteúdo</label>
                    <RichEditor
                      value={contentData[key]?.content || ''}
                      onChange={v => setContentData(d => ({...d, [key]: {...d[key], content: v}}))}
                      dark={true}
                    />
                  </div>
                  <button onClick={async () => {
                    setSavingContent(key)
                    try { await api.put(`/admin/content/${key}`, contentData[key]); toast.success('Guardado!') }
                    catch { toast.error('Erro') }
                    setSavingContent('')
                  }} className="px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-bold text-sm rounded-xl w-fit">
                    {savingContent === key ? 'A guardar…' : 'Guardar'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'blog' && (
          <div>
            <h1 className="text-2xl font-extrabold mb-6">Blog</h1>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6 max-w-2xl">
              <h2 className="text-sm font-extrabold text-gray-300 mb-4">Novo artigo</h2>
              <div className="flex flex-col gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-1.5">Título</label>
                  <input value={newPost.title} onChange={e => setNewPost(p => ({...p, title: e.target.value}))}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3.5 py-2.5 text-sm text-white outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-1.5">Slug (URL)</label>
                  <input value={newPost.slug} onChange={e => setNewPost(p => ({...p, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g,'-')}))}
                    placeholder="ex: novidades-marco-2026"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3.5 py-2.5 text-sm text-white outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-1.5">Conteúdo</label>
                  <RichEditor
                    value={newPost.content}
                    onChange={v => setNewPost(p => ({...p, content: v}))}
                    dark={true}
                  />
                </div>
                <button onClick={async () => {
                  if (!newPost.title || !newPost.slug || !newPost.content) { toast.error('Preenche todos os campos'); return }
                  try {
                    await api.post('/admin/blog', newPost)
                    toast.success('Artigo criado!')
                    setNewPost({ title: '', slug: '', content: '' })
                    fetchContent()
                  } catch { toast.error('Erro') }
                }} className="px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-bold text-sm rounded-xl w-fit">
                  Publicar artigo
                </button>
              </div>
            </div>

            <div className="max-w-2xl">
              <h2 className="text-sm font-extrabold text-gray-300 mb-3">Artigos publicados</h2>
              {blogPosts.length === 0 ? (
                <div className="text-gray-500 text-sm font-medium">Ainda não há artigos.</div>
              ) : (
                <div className="flex flex-col gap-3">
                  {blogPosts.map(post => (
                    <div key={post.key} className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex justify-between items-center">
                      <div>
                        <div className="text-sm font-bold text-white">{post.title}</div>
                        <div className="text-xs text-gray-500 font-medium mt-0.5">/{post.key.replace('blog_', '')} · {new Date(post.updatedAt).toLocaleDateString('pt-PT')}</div>
                      </div>
                      <button onClick={async () => {
                        if (!confirm('Eliminar este artigo?')) return
                        try { await api.delete(`/admin/blog/${post.key}`); toast.success('Eliminado'); fetchContent() }
                        catch { toast.error('Erro') }
                      }} className="text-xs font-bold px-2.5 py-1.5 bg-red-500/20 text-red-400 rounded-lg">Eliminar</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div>
            <h1 className="text-2xl font-extrabold mb-6">Definições</h1>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-5 max-w-lg">
              <h2 className="text-sm font-extrabold text-gray-300 mb-1">Logo do site</h2>
              <p className="text-xs text-gray-500 font-medium mb-5">Faz upload do logo em SVG ou PNG.</p>
              {logoUrl && (
                <div className="bg-white rounded-xl p-6 mb-5 flex items-center justify-center">
                  <img src={logoUrl} alt="Logo atual" className="h-16 object-contain" />
                </div>
              )}
              <label className={`flex flex-col items-center justify-center gap-3 border-2 border-dashed rounded-xl p-8 cursor-pointer transition-all ${uploadingLogo ? 'border-blue-500 bg-blue-500/10' : 'border-gray-700 hover:border-blue-500 hover:bg-blue-500/5'}`}>
                <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                  {uploadingLogo ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-400" /> : <Upload size={20} className="text-blue-400" />}
                </div>
                <div className="text-center">
                  <div className="text-sm font-bold text-white mb-1">{uploadingLogo ? 'A fazer upload…' : 'Clica para fazer upload'}</div>
                  <div className="text-xs text-gray-500">SVG recomendado · PNG também aceite</div>
                </div>
                <input type="file" accept=".svg,image/svg+xml,image/png" onChange={handleLogoUpload} className="hidden" disabled={uploadingLogo} />
              </label>
              {logoUrl && <div className="flex items-center gap-2 mt-4 text-xs text-green-400 font-semibold"><CheckCircle size={14} /> Logo em {logoUrl.split('?')[0]}</div>}
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 max-w-lg">
              <h2 className="text-sm font-extrabold text-gray-300 mb-1">Aplicar alterações</h2>
              <p className="text-xs text-gray-500 font-medium mb-4">Após upload do logo, faz rebuild do frontend.</p>
              <div className="bg-gray-800 rounded-lg p-3 font-mono text-xs text-green-400 select-all">
                cd /var/www/nauu/frontend && npm run build && pm2 restart nauu-frontend
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
