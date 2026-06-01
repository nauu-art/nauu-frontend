'use client'
import { useState, useEffect } from 'react'
import { Heart, Send, Trash2 } from 'lucide-react'
import api from '../../lib/api'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import Link from 'next/link'

export default function ArtworkComments({ artworkId, artistUserId }) {
  const { user, isLoggedIn } = useAuth()
  const [comments, setComments] = useState([])
  const [likes, setLikes] = useState(0)
  const [liked, setLiked] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!artworkId) return
    const likesEndpoint = isLoggedIn ? `/interactions/artworks/${artworkId}/likes/me` : `/interactions/artworks/${artworkId}/likes`
    Promise.all([
      api.get(`/interactions/artworks/${artworkId}/comments`),
      api.get(likesEndpoint)
    ]).then(([commRes, likesRes]) => {
      setComments(commRes.data || [])
      setLikes(likesRes.data.count || 0)
      setLiked(likesRes.data.liked || false)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [artworkId, isLoggedIn])

  const handleLike = async () => {
    if (!isLoggedIn) { toast.error('Faz login para reagir'); return }
    try {
      const res = await api.post(`/interactions/artworks/${artworkId}/like`)
      setLiked(res.data.liked)
      setLikes(prev => prev + (res.data.liked ? 1 : -1))
    } catch { toast.error('Erro') }
  }

  const handleComment = async (e) => {
    e.preventDefault()
    if (!isLoggedIn) { toast.error('Faz login para comentar'); return }
    if (!newComment.trim()) return
    setSending(true)
    try {
      const res = await api.post(`/interactions/artworks/${artworkId}/comments`, { content: newComment })
      setComments(prev => [...prev, res.data])
      setNewComment('')
    } catch { toast.error('Erro ao comentar') }
    setSending(false)
  }

  const handleDelete = async (commentId) => {
    try {
      await api.delete(`/interactions/artworks/${artworkId}/comments/${commentId}`)
      setComments(prev => prev.filter(c => c.id !== commentId))
    } catch { toast.error('Erro') }
  }

  return (
    <div className="px-5 md:px-10 py-8 border-t border-gray-100">
      {/* Likes */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={handleLike}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 font-bold text-sm transition-all ${liked ? 'border-red-400 bg-red-50 text-red-500' : 'border-gray-200 text-gray-500 hover:border-red-300 hover:text-red-400'}`}>
          <Heart size={16} fill={liked ? 'currentColor' : 'none'} />
          {likes} {likes === 1 ? 'reação' : 'reações'}
        </button>
      </div>

      {/* Comentários */}
      <h3 className="text-base font-extrabold text-gray-900 mb-4">
        Comentários {comments.length > 0 && <span className="text-gray-300 font-bold ml-1">({comments.length})</span>}
      </h3>

      {loading ? (
        <div className="space-y-3">{Array.from({length:2}).map((_,i) => <div key={i} className="h-16 bg-gray-50 rounded-xl animate-pulse" />)}</div>
      ) : (
        <div className="flex flex-col gap-3 mb-5">
          {comments.length === 0 && <p className="text-sm text-gray-300 font-medium">Sê o primeiro a comentar.</p>}
          {comments.map(c => (
            <div key={c.id} className="flex gap-3 group">
              <div className="w-8 h-8 rounded-full bg-blue-100 overflow-hidden flex items-center justify-center text-blue-500 font-extrabold text-xs flex-shrink-0 mt-0.5">
                {c.user?.avatarUrl ? <img src={c.user.avatarUrl} className="w-full h-full object-cover" alt="" /> : c.user?.name?.[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="bg-gray-50 rounded-2xl rounded-tl-sm px-4 py-3">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <Link href={c.user?.username ? `/u/${c.user.username}` : '#'} className="text-xs font-extrabold text-gray-700 hover:text-blue-500 transition-colors">
                      {c.user?.name}
                    </Link>
                    {(user?.id === c.userId || user?.id === artistUserId) && (
                      <button onClick={() => handleDelete(c.id)} className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 transition-all">
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 font-medium leading-relaxed">{c.content}</p>
                </div>
                <div className="text-xs text-gray-400 mt-1 ml-4">
                  {new Date(c.createdAt).toLocaleDateString('pt-PT', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Input novo comentário */}
      {isLoggedIn ? (
        <form onSubmit={handleComment} className="flex gap-3 items-start">
          <div className="w-8 h-8 rounded-full bg-blue-100 overflow-hidden flex items-center justify-center text-blue-500 font-extrabold text-xs flex-shrink-0 mt-1">
            {user?.avatarUrl ? <img src={user.avatarUrl} className="w-full h-full object-cover" alt="" /> : user?.name?.[0]}
          </div>
          <div className="flex-1 flex gap-2">
            <input value={newComment} onChange={e => setNewComment(e.target.value)}
              placeholder="Escreve um comentário…"
              className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium outline-none focus:border-blue-300 transition-colors" />
            <button type="submit" disabled={sending || !newComment.trim()}
              className="p-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl disabled:opacity-40 transition-colors flex-shrink-0">
              <Send size={15} />
            </button>
          </div>
        </form>
      ) : (
        <p className="text-sm text-gray-400 font-medium">
          <Link href="/login" className="text-blue-500 font-bold hover:text-blue-600">Faz login</Link> para comentar.
        </p>
      )}
    </div>
  )
}
