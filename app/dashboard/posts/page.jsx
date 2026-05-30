'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '../../../context/AuthContext'
import { LayoutDashboard, Image, Mail, User, LogOut, Plus, Edit, Trash2, Eye, EyeOff, FileText } from 'lucide-react'
import DashboardNav from '../../../components/ui/DashboardNav'
import api from '../../../lib/api'
import toast from 'react-hot-toast'
import dynamic from 'next/dynamic'
const RichEditor = dynamic(() => import('../../../components/ui/RichEditor'), { ssr: false })

export default function PostsPage() {
  const { user, isArtist, isLoggedIn, loading, logout } = useAuth()
  const router = useRouter()
  const [posts, setPosts] = useState([])
  const [loadingPosts, setLoadingPosts] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ title: '', content: '', published: true })
  const [saving, setSaving] = useState(false)
  const [coverFile, setCoverFile] = useState(null)
  const [coverPreview, setCoverPreview] = useState(null)

  useEffect(() => {
    if (!loading && !isLoggedIn) router.push('/login')
    if (!loading && !isArtist) router.push('/')
  }, [loading, isLoggedIn, isArtist])

  useEffect(() => {
    if (isArtist) fetchPosts()
  }, [isArtist])

  const fetchPosts = async () => {
    try {
      const res = await api.get('/posts/my')
      setPosts(res.data || [])
    } catch {}
    setLoadingPosts(false)
  }

  const handleEdit = (post) => {
    setEditing(post.id)
    setForm({ title: post.title, content: post.content, published: post.published })
    setCoverPreview(post.imageUrl)
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleCoverChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setCoverFile(file)
    setCoverPreview(URL.createObjectURL(file))
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.title || !form.content) { toast.error('Título e conteúdo obrigatórios'); return }
    setSaving(true)
    try {
      let postId
      if (editing) {
        await api.put(`/posts/${editing}`, form)
        postId = editing
        toast.success('Post atualizado!')
      } else {
        const res = await api.post('/posts', form)
        postId = res.data.id
        toast.success('Post publicado! 🎉')
      }

      // Upload capa se selecionada
      if (coverFile && postId) {
        const fd = new FormData()
        fd.append('cover', coverFile)
        await api.post(`/posts/${postId}/cover`, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      }

      setShowForm(false)
      setEditing(null)
      setForm({ title: '', content: '', published: true })
      setCoverFile(null)
      setCoverPreview(null)
      fetchPosts()
    } catch { toast.error('Erro ao guardar') }
    setSaving(false)
  }

  const handleDelete = async (id, title) => {
    if (!confirm(`Eliminar "${title}"?`)) return
    try {
      await api.delete(`/posts/${id}`)
      setPosts(prev => prev.filter(p => p.id !== id))
      toast.success('Post eliminado')
    } catch { toast.error('Erro') }
  }

  const togglePublished = async (post) => {
    try {
      await api.put(`/posts/${post.id}`, { ...post, published: !post.published })
      setPosts(prev => prev.map(p => p.id === post.id ? { ...p, published: !p.published } : p))
      toast.success(post.published ? 'Post ocultado' : 'Post publicado')
    } catch { toast.error('Erro') }
  }

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/artworks', label: 'As minhas obras', icon: Image },
    { href: '/dashboard/posts', label: 'Posts', icon: FileText, active: true },
    { href: '/dashboard/contacts', label: 'Contactos', icon: Mail },
    { href: '/dashboard/profile', label: 'Editar perfil', icon: User },
  ]

  if (loading || !user) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" /></div>

  return (
    <div className="flex min-h-screen bg-gray-50">
      <DashboardNav />

      <div className="flex-1 p-8 max-w-3xl">
        <div className="flex justify-between items-center mb-7">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight" style={{letterSpacing:'-0.03em'}}>Posts</h1>
            <p className="text-sm text-gray-400 font-medium mt-0.5">Partilha o teu processo criativo com os teus seguidores</p>
          </div>
          {!showForm && (
            <button onClick={() => { setShowForm(true); setEditing(null); setForm({ title: '', content: '', published: true }); setCoverPreview(null) }}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-bold text-sm rounded-xl transition-colors">
              <Plus size={16} /> Novo post
            </button>
          )}
        </div>

        {/* Formulário */}
        {showForm && (
          <form onSubmit={handleSave} className="bg-white border border-gray-100 rounded-2xl p-6 mb-6">
            <h2 className="text-base font-extrabold text-gray-900 mb-5">{editing ? 'Editar post' : 'Novo post'}</h2>

            {/* Capa */}
            <div className="mb-4">
              <label className="label">Imagem de capa</label>
              <div className="relative h-40 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl overflow-hidden hover:border-blue-300 transition-colors cursor-pointer"
                onClick={() => document.getElementById('cover-input').click()}>
                {coverPreview
                  ? <img src={coverPreview} alt="" className="w-full h-full object-cover" />
                  : <div className="flex flex-col items-center justify-center h-full text-gray-300">
                      <Image size={28} className="mb-2" />
                      <span className="text-sm font-bold">Clica para adicionar capa</span>
                    </div>}
                <input id="cover-input" type="file" accept="image/*" onChange={handleCoverChange} className="hidden" />
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <div>
                <label className="label">Título *</label>
                <input value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))}
                  className="input text-lg font-bold" placeholder="O título do teu post…" required />
              </div>
              <div>
                <label className="label">Conteúdo *</label>
                <RichEditor
                  value={form.content}
                  onChange={v => setForm(f => ({...f, content: v}))}
                  placeholder="Escreve sobre o teu processo criativo, inspirações, novidades…"
                />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.published} onChange={e => setForm(f => ({...f, published: e.target.checked}))} className="w-4 h-4 accent-blue-500" />
                <span className="text-sm font-semibold text-gray-600">Publicar imediatamente</span>
              </label>
              <div className="flex gap-2 pt-1">
                <button type="submit" disabled={saving}
                  className="flex-1 py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold text-sm rounded-xl transition-colors">
                  {saving ? 'A guardar…' : editing ? 'Guardar alterações' : 'Publicar post'}
                </button>
                <button type="button" onClick={() => { setShowForm(false); setEditing(null) }}
                  className="px-4 py-3 border border-gray-200 text-gray-500 font-bold text-sm rounded-xl hover:border-gray-300 transition-colors">
                  Cancelar
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Lista de posts */}
        {loadingPosts ? (
          <div className="space-y-3">{Array.from({length:3}).map((_,i) => <div key={i} className="h-24 bg-white rounded-2xl animate-pulse" />)}</div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
            <FileText size={40} className="text-gray-200 mx-auto mb-4" />
            <div className="text-gray-300 font-bold text-lg mb-2">Ainda não tens posts</div>
            <p className="text-gray-400 text-sm font-medium mb-6">Partilha o teu processo criativo, bastidores e inspirações.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {posts.map(post => (
              <div key={post.id} className="bg-white border border-gray-100 rounded-2xl overflow-hidden hover:border-blue-100 transition-colors">
                <div className="flex gap-4 p-4">
                  {post.imageUrl && (
                    <div className="w-24 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-gray-50">
                      <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-base font-extrabold text-gray-900 leading-tight">{post.title}</div>
                        <div className="text-xs text-gray-400 font-medium mt-0.5">
                          {new Date(post.createdAt).toLocaleDateString('pt-PT', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </div>
                      </div>
                      <span className={`flex-shrink-0 text-xs font-bold px-2 py-0.5 rounded-full ${post.published ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                        {post.published ? 'Publicado' : 'Rascunho'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 font-medium mt-1.5 line-clamp-2"
                      dangerouslySetInnerHTML={{ __html: post.content?.replace(/<[^>]*>/g, '').slice(0, 120) + '…' }} />
                  </div>
                </div>
                <div className="flex gap-1 px-4 pb-3 border-t border-gray-50 pt-2.5">
                  <button onClick={() => handleEdit(post)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-gray-500 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
                    <Edit size={12} /> Editar
                  </button>
                  <button onClick={() => togglePublished(post)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                    {post.published ? <><EyeOff size={12} /> Ocultar</> : <><Eye size={12} /> Publicar</>}
                  </button>
                  <button onClick={() => handleDelete(post.id, post.title)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 size={12} /> Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
