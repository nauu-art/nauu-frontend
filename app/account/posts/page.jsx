'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../../context/AuthContext'
import { Plus, Edit, Trash2, Eye, EyeOff, FileText } from 'lucide-react'
import api from '../../../lib/api'
import toast from 'react-hot-toast'
import dynamic from 'next/dynamic'
const RichEditor = dynamic(() => import('../../../components/ui/RichEditor'), { ssr: false })

export default function UserPostsPage() {
  const { isLoggedIn, loading } = useAuth()
  const router = useRouter()
  const [posts, setPosts] = useState([])
  const [loadingPosts, setLoadingPosts] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ title: '', content: '', published: true, sendNewsletter: false })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!loading && !isLoggedIn) router.push('/login')
  }, [loading, isLoggedIn])

  useEffect(() => {
    if (isLoggedIn) fetchPosts()
  }, [isLoggedIn])

  const fetchPosts = async () => {
    try {
      const res = await api.get('/posts-generic/my')
      setPosts(res.data || [])
    } catch {}
    setLoadingPosts(false)
  }

  const handleEdit = (post) => {
    setEditing(post.id)
    setForm({ title: post.title, content: post.content, published: post.published })
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.title || !form.content) { toast.error('Título e conteúdo obrigatórios'); return }
    setSaving(true)
    try {
      if (editing) {
        await api.put(`/posts-generic/${editing}`, { ...form, sendNewsletter: false })
        toast.success('Post atualizado!')
      } else {
        await api.post('/posts-generic', form)
        toast.success('Post publicado!')
      }
      setShowForm(false)
      setEditing(null)
      setForm({ title: '', content: '', published: true })
      fetchPosts()
    } catch { toast.error('Erro ao guardar') }
    setSaving(false)
  }

  const handleDelete = async (id) => {
    if (!confirm('Eliminar este post?')) return
    try {
      await api.delete(`/posts-generic/${id}`)
      setPosts(prev => prev.filter(p => p.id !== id))
      toast.success('Post eliminado')
    } catch { toast.error('Erro') }
  }

  const handleTogglePublish = async (post) => {
    try {
      await api.put(`/posts-generic/${post.id}`, { ...post, published: !post.published })
      setPosts(prev => prev.map(p => p.id === post.id ? {...p, published: !p.published} : p))
      toast.success(post.published ? 'Post ocultado' : 'Post publicado')
    } catch { toast.error('Erro') }
  }

  if (loading) return null

  return (
    <div className="p-5 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <FileText size={18} className="text-blue-500" />
          <h1 className="text-xl font-extrabold text-gray-900">Os meus posts</h1>
          <span className="text-sm text-gray-400">{posts.length} posts</span>
        </div>
        <button onClick={() => { setShowForm(!showForm); setEditing(null); setForm({ title: '', content: '', published: true }) }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-bold text-sm rounded-xl transition-colors">
          <Plus size={15} /> Novo post
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSave} className="bg-white border border-gray-100 rounded-2xl p-5 mb-6">
          <h2 className="text-sm font-extrabold text-gray-900 mb-4">{editing ? 'Editar post' : 'Novo post'}</h2>
          <div className="flex flex-col gap-3">
            <div>
              <label className="label">Título *</label>
              <input value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))}
                className="input" placeholder="O título do teu post…" required />
            </div>
            <div>
              <label className="label">Conteúdo *</label>
              <RichEditor value={form.content} onChange={val => setForm(f => ({...f, content: val}))} />
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.published} onChange={e => setForm(f => ({...f, published: e.target.checked}))}
                className="w-4 h-4 accent-blue-500" />
              <span className="text-sm font-semibold text-gray-600">Publicar imediatamente</span>
            </label>
            {!editing && (
              <div className={`rounded-xl border p-3 transition-all ${form.sendNewsletter ? 'border-blue-200 bg-blue-50' : 'border-gray-200'}`}>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.sendNewsletter}
                    onChange={e => setForm(f => ({...f, sendNewsletter: e.target.checked}))}
                    className="w-4 h-4 accent-blue-500" />
                  <span className="text-sm font-semibold text-gray-700">Enviar também por email (Newsletter)</span>
                </label>
                {form.sendNewsletter && (
                  <p className="text-xs text-blue-600 mt-2 ml-6">
                    ⚠️ Este post será enviado para a caixa de entrada de todos os teus seguidores. Esta ação só pode ser feita uma vez.
                  </p>
                )}
              </div>
            )}
          </div>
          <div className="flex gap-2 mt-4">
            <button type="submit" disabled={saving}
              className="px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-bold text-sm rounded-xl">
              {saving ? 'A guardar…' : editing ? 'Guardar alterações' : 'Publicar'}
            </button>
            <button type="button" onClick={() => { setShowForm(false); setEditing(null) }}
              className="px-5 py-2.5 border border-gray-200 text-gray-500 font-bold text-sm rounded-xl">
              Cancelar
            </button>
          </div>
        </form>
      )}

      {loadingPosts ? (
        <div className="flex flex-col gap-3">{[1,2,3].map(i => <div key={i} className="h-20 bg-white rounded-xl animate-pulse border border-gray-100" />)}</div>
      ) : posts.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
          <FileText size={40} className="text-gray-200 mx-auto mb-4" />
          <div className="text-gray-300 font-bold text-lg mb-2">Ainda não tens posts</div>
          <p className="text-gray-400 text-sm mb-6">Partilha os teus pensamentos sobre arte, artistas ou obras.</p>
          <button onClick={() => setShowForm(true)}
            className="px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-bold text-sm rounded-xl">
            Criar primeiro post
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {posts.map(post => (
            <div key={post.id} className="bg-white border border-gray-100 rounded-xl p-4 hover:border-blue-100 transition-colors">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${post.published ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                      {post.published ? 'Publicado' : 'Rascunho'}
                    </span>
                    <span className="text-xs text-gray-400">{new Date(post.createdAt).toLocaleDateString('pt-PT')}</span>
                  </div>
                  <div className="font-extrabold text-gray-900 truncate">{post.title}</div>
                  <div className="text-sm text-gray-400 mt-1 line-clamp-1"
                    dangerouslySetInnerHTML={{ __html: (post.content || '').replace(/<[^>]*>/g, '').slice(0, 100) + '…' }} />
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button onClick={() => handleTogglePublish(post)}
                    className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                    title={post.published ? 'Ocultar' : 'Publicar'}>
                    {post.published ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                  <button onClick={() => handleEdit(post)}
                    className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
                    <Edit size={15} />
                  </button>
                  <button onClick={() => handleDelete(post.id)}
                    className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-400 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
