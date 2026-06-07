'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Calendar, User } from 'lucide-react'
import api from '../../../lib/api'
import AnchorButton from '../../../components/ui/AnchorButton'

function PostCarousel({ urls }) {
  const [current, setCurrent] = useState(0)
  if (!urls?.length) return null
  if (urls.length === 1) return (
    <div className="rounded-2xl overflow-hidden mb-6 aspect-video">
      <img src={urls[0]} alt="" className="w-full h-full object-cover" />
    </div>
  )
  return (
    <div className="relative aspect-video rounded-2xl overflow-hidden mb-6">
      <img src={urls[current]} alt="" className="w-full h-full object-cover" />
      <button onClick={() => setCurrent((current - 1 + urls.length) % urls.length)}
        className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/40 text-white rounded-full flex items-center justify-center hover:bg-black/60">
        <ChevronLeft size={18} />
      </button>
      <button onClick={() => setCurrent((current + 1) % urls.length)}
        className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/40 text-white rounded-full flex items-center justify-center hover:bg-black/60">
        <ChevronRight size={18} />
      </button>
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
        {urls.map((_, i) => (
          <div key={i} onClick={() => setCurrent(i)}
            className={`w-2 h-2 rounded-full cursor-pointer transition-all ${i === current ? 'bg-white scale-110' : 'bg-white/50'}`} />
        ))}
      </div>
    </div>
  )
}

export default function PostPage() {
  const { id } = useParams()
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Tentar posts de artistas primeiro, depois genéricos
    api.get(`/posts/${id}`).catch(() => api.get(`/posts-generic/${id}`))
      .then(res => setPost(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
    </div>
  )
  if (!post) return (
    <div className="text-center py-24 text-gray-300 font-bold text-lg">Post não encontrado</div>
  )

  const mediaUrls = post.mediaUrls ? (() => { try { return JSON.parse(post.mediaUrls) } catch { return [] } })() : post.imageUrl ? [post.imageUrl] : []
  const authorName = post.user?.artistProfile?.artistName || post.user?.name
  const authorUsername = post.user?.artistProfile?.username || post.user?.username
  const authorAvatar = post.user?.avatarUrl
  const profilePath = post.user?.artistProfile ? `/${authorUsername}` : `/u/${authorUsername}`

  return (
    <div className="min-h-screen">
      <div className="max-w-2xl mx-auto px-5 py-10">
        {/* Autor */}
        <div className="flex items-center justify-between mb-6">
          <Link href={profilePath} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 rounded-full bg-blue-100 overflow-hidden flex items-center justify-center text-blue-500 font-extrabold">
              {authorAvatar ? <img src={authorAvatar} className="w-full h-full object-cover" alt="" /> : authorName?.[0]}
            </div>
            <div>
              <div className="font-extrabold text-gray-900">{authorName}</div>
              <div className="text-xs text-gray-400 flex items-center gap-1">
                <Calendar size={11} />
                {new Date(post.createdAt).toLocaleDateString('pt-PT', { day: 'numeric', month: 'long', year: 'numeric' })}
              </div>
            </div>
          </Link>
          <Link href={profilePath} className="text-xs font-bold text-blue-500 hover:text-blue-600 flex items-center gap-1">
            ← Ver perfil
          </Link>
        </div>

        {/* Título */}
        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-6" style={{letterSpacing:'-0.02em'}}>
          {post.title}
        </h1>

        {/* Imagens */}
        <PostCarousel urls={mediaUrls} />

        {/* Conteúdo */}
        <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: post.content }} />
      </div>
    </div>
  )
}
