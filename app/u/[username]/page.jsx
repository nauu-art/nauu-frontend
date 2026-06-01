'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { MapPin, Calendar } from 'lucide-react'
import api from '../../../lib/api'
import { useAuth } from '../../../context/AuthContext'
import toast from 'react-hot-toast'

export default function UserProfilePage() {
  const { username } = useParams()
  const { user: me, isLoggedIn } = useAuth()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [following, setFollowing] = useState(false)
  const [posts, setPosts] = useState([])
  const [activeTab, setActiveTab] = useState('colecoes')
  const [followLoading, setFollowLoading] = useState(false)

  useEffect(() => {
    api.get(`/profile/${username}`).then(res => setProfile(res.data)).catch(() => {}).finally(() => setLoading(false))
    api.get(`/posts-generic/user/${username}`).then(res => setPosts(res.data || [])).catch(() => {})
  }, [username])

  useEffect(() => {
    if (isLoggedIn && profile) {
      api.get(`/profile/follow/${profile.id}`)
        .then(res => setFollowing(res.data.following))
        .catch(() => {})
    }
  }, [isLoggedIn, profile])

  const handleFollow = async () => {
    if (!isLoggedIn) { toast.error('Faz login para seguir'); return }
    setFollowLoading(true)
    try {
      const res = await api.post(`/profile/follow/${profile.id}`)
      setFollowing(res.data.following)
      setProfile(prev => ({
        ...prev,
        _count: { ...prev._count, userFollowers: prev._count.userFollowers + (res.data.following ? 1 : -1) }
      }))
    } catch { toast.error('Erro') }
    setFollowLoading(false)
  }

  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" /></div>
  if (!profile) return <div className="text-center py-24 text-gray-300 font-bold text-lg">Utilizador não encontrado</div>

  const isMe = me?.id === profile.id

  // Se for artista redirecionar para /<username>
  if (profile.accountType === 'ARTIST' && profile.artistProfile?.username) {
    if (typeof window !== 'undefined') window.location.href = `/${profile.artistProfile.username}`
    return null
  }

  return (
    <div className="min-h-screen">
      <div className="px-5 md:px-10 py-10 border-b border-gray-100">
        <div className="max-w-3xl mx-auto flex items-start gap-6">
          <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-blue-100 overflow-hidden flex items-center justify-center text-blue-500 font-extrabold text-3xl flex-shrink-0">
            {profile.avatarUrl
              ? <img src={profile.avatarUrl} alt={profile.name} className="w-full h-full object-cover" />
              : profile.name?.[0]}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <h1 className="text-2xl font-extrabold tracking-tight">{profile.name}</h1>
                <p className="text-sm text-gray-400 font-medium">@{profile.username}</p>
              </div>
              {!isMe ? (
                <button onClick={handleFollow} disabled={followLoading}
                  className={`px-5 py-2 font-bold text-sm rounded-xl border-2 transition-all ${following ? 'border-blue-500 bg-blue-500 text-white' : 'border-blue-500 text-blue-500 hover:bg-blue-50'}`}>
                  {followLoading ? '…' : following ? 'A seguir' : 'Seguir'}
                </button>
              ) : (
                <Link href="/account/profile" className="px-5 py-2 font-bold text-sm rounded-xl border-2 border-gray-200 text-gray-500 hover:border-gray-300">
                  Editar perfil
                </Link>
              )}
            </div>

            {profile.bio && <p className="text-sm text-gray-500 font-medium mt-3 max-w-lg">{profile.bio}</p>}

            <div className="flex items-center gap-4 mt-3 flex-wrap">
              {profile.city && (
                <div className="flex items-center gap-1 text-xs text-gray-400 font-medium">
                  <MapPin size={12} /> {profile.city}{profile.country ? `, ${profile.country}` : ''}
                </div>
              )}
              <div className="flex items-center gap-1 text-xs text-gray-400 font-medium">
                <Calendar size={12} /> Membro desde {new Date(profile.createdAt).toLocaleDateString('pt-PT', { month: 'long', year: 'numeric' })}
              </div>
            </div>

            <div className="flex gap-6 mt-4">
              <div>
                <div className="text-lg font-extrabold">{profile._count?.userFollowers || 0}</div>
                <div className="text-xs text-gray-400 font-bold uppercase tracking-wider">seguidores</div>
              </div>
              <div>
                <div className="text-lg font-extrabold">{profile._count?.userFollowing || 0}</div>
                <div className="text-xs text-gray-400 font-bold uppercase tracking-wider">a seguir</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-5 md:px-10 py-8">
        {/* Tabs */}
        {(profile.collections?.length > 0 || posts.length > 0) && (
          <div className="flex border-b border-gray-100 mb-6 gap-1">
            <button onClick={() => setActiveTab('colecoes')}
              className={`px-4 py-2.5 text-sm font-bold transition-all ${activeTab === 'colecoes' ? 'text-blue-500 border-b-2 border-blue-500 -mb-px' : 'text-gray-400 hover:text-gray-600'}`}>
              🖼️ Coleções <span className="ml-1 text-xs bg-blue-50 text-blue-400 px-1.5 py-0.5 rounded-full">{profile.collections?.length || 0}</span>
            </button>
            {posts.length > 0 && (
              <button onClick={() => setActiveTab('posts')}
                className={`px-4 py-2.5 text-sm font-bold transition-all ${activeTab === 'posts' ? 'text-blue-500 border-b-2 border-blue-500 -mb-px' : 'text-gray-400 hover:text-gray-600'}`}>
                ✍️ Posts <span className="ml-1 text-xs bg-blue-50 text-blue-400 px-1.5 py-0.5 rounded-full">{posts.length}</span>
              </button>
            )}
          </div>
        )}

        {activeTab === 'posts' && (
          <div className="flex flex-col gap-4">
            {posts.map(post => (
              <div key={post.id} className="bg-white border border-gray-100 rounded-2xl overflow-hidden hover:border-blue-100 transition-colors">
                {post.imageUrl && <div className="h-40 overflow-hidden"><img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover" /></div>}
                <div className="p-5">
                  <div className="text-base font-extrabold text-gray-900 mb-1">{post.title}</div>
                  <div className="text-xs text-gray-400 mb-3">{new Date(post.createdAt).toLocaleDateString('pt-PT', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                  <p className="text-sm text-gray-500 font-medium line-clamp-3" dangerouslySetInnerHTML={{ __html: (post.content || '').replace(/<[^>]*>/g, '').slice(0, 200) + '…' }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'colecoes' && profile.collections?.length > 0 ? (
          <div>
            <h2 className="text-lg font-extrabold tracking-tight mb-5">Coleções</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {profile.collections.map(col => (
                <Link key={col.id} href={`/collection/${col.id}`}
                  className="bg-white border border-gray-100 rounded-2xl overflow-hidden hover:border-blue-200 hover:shadow-md transition-all group">
                  <div className="h-32 bg-gray-50 overflow-hidden grid grid-cols-3 gap-0.5">
                    {col.items?.slice(0, 3).map((item, i) => (
                      <div key={i} className="overflow-hidden bg-gray-100">
                        {item.artwork?.images?.[0] && <img src={item.artwork.images[0].imageUrl} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />}
                      </div>
                    ))}
                    {!col.items?.length && <div className="col-span-3 flex items-center justify-center text-3xl">🖼️</div>}
                  </div>
                  <div className="p-4">
                    <div className="font-extrabold text-gray-900 mb-0.5">{col.name}</div>
                    <div className="text-xs text-blue-500 font-bold">{col.items?.length || 0} obras</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ) : activeTab === 'colecoes' ? (
          <div className="text-center py-20">
            <div className="text-4xl mb-3">🖼️</div>
            <div className="text-gray-300 font-bold">Sem coleções públicas ainda</div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
