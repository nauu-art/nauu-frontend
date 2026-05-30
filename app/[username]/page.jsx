'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { MapPin, Mail, Globe, Link2, ExternalLink } from 'lucide-react'
import api from '../../lib/api'
import { useAuth } from '../../context/AuthContext'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import AddToCollection from '../../components/ui/AddToCollection'
import ArtistAvatar from '../../components/ui/ArtistAvatar'
import AvailabilityBadge from '../../components/ui/AvailabilityBadge'
import PriceTag from '../../components/ui/PriceTag'
import FollowButton from '../../components/ui/FollowButton'
import { useLocale } from '../../context/LocaleContext'

const availColor = (a) => a === 'AVAILABLE' ? '#2ECC71' : a === 'RESERVED' ? '#F39C12' : '#E74C3C'

export default function ArtistPage() {
  const { username } = useParams()
  const { isLoggedIn, user } = useAuth()
  const router = useRouter()
  const { t } = useLocale()
  const [artist, setArtist] = useState(null)
  const [artworks, setArtworks] = useState([])
  const [loading, setLoading] = useState(true)
  const [contactOpen, setContactOpen] = useState(false)
  const [posts, setPosts] = useState([])
  const [activeTab, setActiveTab] = useState('obras')
  const [expandedPost, setExpandedPost] = useState(null) // 'obras' | 'posts'
  const [contactForm, setContactForm] = useState({ message: '' })
  const [sending, setSending] = useState(false)

  useEffect(() => {
    Promise.all([
      api.get(`/artists/${username}`),
      api.get(`/artists/${username}/artworks?limit=12`),
    ]).then(([a, w]) => {
      setArtist(a.data)
      setArtworks(w.data.data || [])
    }).catch(() => {}).finally(() => setLoading(false))
    api.get(`/posts/artist/${username}`).then(r => setPosts(r.data || [])).catch(() => {})
  }, [username])

  const handleContact = async (e) => {
    e.preventDefault()
    if (!isLoggedIn) { router.push('/login'); return }
    if (!contactForm.message.trim()) { toast.error(t('contact.error_fields')); return }
    setSending(true)
    try {
      await api.post(`/contact/${artist.username}`, {
        name: user?.name || '',
        email: user?.email || '',
        message: contactForm.message,
      })
      toast.success(t('contact.success'))
      setContactOpen(false)
      setContactForm({ message: '' })
    } catch { toast.error(t('common.error')) }
    setSending(false)
  }

  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" /></div>
  if (!artist) return <div className="text-center py-24 text-gray-300 font-bold text-lg">{t('common.not_found')}</div>

  return (
    <div>
      {/* Cover */}
      <div className="h-48 md:h-64 relative overflow-hidden" style={{background:"linear-gradient(to bottom, #2a2a2a, #1a1a1a)"}}>
        {artist.coverImageUrl && <img src={artist.coverImageUrl} alt="" className="w-full h-full object-cover" />}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent" style={{background:"linear-gradient(to bottom, transparent, var(--bg))"}} />
      </div>

      <div className="px-5 md:px-10 relative">
        {/* Header com avatar grande */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 mb-8">
          <div className="flex items-end gap-5 -mt-16">
            {/* Avatar grande */}
            <div className="relative flex-shrink-0">
              <div className="w-28 h-28 md:w-36 md:h-36 rounded-full border-4 border-white shadow-lg overflow-hidden bg-blue-100 flex items-center justify-center">
                {artist.user?.avatarUrl
                  ? <img src={artist.user.avatarUrl} alt={artist.artistName} className="w-full h-full object-cover" />
                  : <span className="text-blue-400 text-5xl font-extrabold">{artist.artistName?.[0]}</span>
                }
              </div>
              {artist.isFeatured && (
                <div className="absolute -top-1 -right-1 w-8 h-8 bg-amber-400 rounded-full flex items-center justify-center text-base shadow-md">⭐</div>
              )}
            </div>
            <div className="pb-2">
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-gray-900" style={{letterSpacing:'-0.03em'}}>{artist.artistName}</h1>
              <p className="text-sm text-gray-400 font-medium mt-0.5">@{artist.username}</p>
              {artist.categories?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {artist.categories.map(c => (
                    <span key={c.categoryId} className="text-xs font-bold px-2.5 py-1 bg-blue-50 text-blue-500 rounded-full">
                      {c.category.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-2 pb-2 flex-wrap">
            <button onClick={() => setContactOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-bold text-sm rounded-xl transition-colors">
              <Mail size={14} /> {t('artwork.contact_artist')}
            </button>
            <FollowButton artistId={artist.id} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <div className="md:col-span-1 flex flex-col gap-5">

            {/* Stats */}
            <div className="grid grid-cols-3 border border-gray-100 rounded-xl overflow-hidden">
              {[
                { n: artist._count?.artworks || 0, l: t('artist_profile.works') },
                { n: '—', l: 'Visitas' },
                { n: '—', l: 'Favs' },
              ].map(s => (
                <div key={s.l} className="text-center py-3 border-r border-gray-100 last:border-0">
                  <div className="text-lg font-extrabold text-gray-900">{s.n}</div>
                  <div className="text-xs text-gray-400 font-bold uppercase tracking-wider">{s.l}</div>
                </div>
              ))}
            </div>

            {/* Bio */}
            {artist.bio && (
              <div>
                <div className="text-xs font-extrabold uppercase tracking-widest text-gray-300 mb-2">Bio</div>
                <p className="text-sm text-gray-500 font-medium leading-relaxed">{artist.bio}</p>
              </div>
            )}

            {/* Info */}
            <div className="flex flex-col gap-2">
              {artist.city && (
                <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                  <MapPin size={14} className="text-gray-300 flex-shrink-0" />
                  {artist.city}{artist.country ? `, ${artist.country}` : ''}
                </div>
              )}

              {artist.websiteUrl && (
                <a href={artist.websiteUrl} target="_blank" className="flex items-center gap-2 text-sm text-blue-500 font-medium hover:text-blue-600">
                  <Globe size={14} className="text-gray-300 flex-shrink-0" /> {t('artist_profile.website')}
                </a>
              )}
            </div>

            {/* Redes sociais */}
            <div className="flex gap-2">
              {artist.instagramUrl && (
                <a href={artist.instagramUrl} target="_blank" className="w-9 h-9 border border-gray-200 rounded-lg flex items-center justify-center text-gray-400 hover:border-blue-300 hover:text-blue-500 transition-colors">
                  <Link2 size={15} />
                </a>
              )}
              {artist.websiteUrl && (
                <a href={artist.websiteUrl} target="_blank" className="w-9 h-9 border border-gray-200 rounded-lg flex items-center justify-center text-gray-400 hover:border-blue-300 hover:text-blue-500 transition-colors">
                  <ExternalLink size={15} />
                </a>
              )}
            </div>
          </div>

          {/* Portfólio + Posts */}
          <div className="md:col-span-3">
            <div className="flex gap-0 border-b border-gray-100 mb-5">
              <button onClick={() => setActiveTab('obras')}
                className={`px-4 py-2.5 text-sm font-bold transition-all ${activeTab === 'obras' ? 'text-blue-500 border-b-2 border-blue-500 -mb-px' : 'text-gray-400 hover:text-gray-600'}`}>
                {t('common.portfolio') || 'Portfólio'} <span className="ml-1 text-xs bg-blue-50 text-blue-400 px-1.5 py-0.5 rounded-full font-extrabold">{artworks.length}</span>
              </button>
              <button onClick={() => setActiveTab('posts')}
                className={`px-4 py-2.5 text-sm font-bold transition-all ${activeTab === 'posts' ? 'text-blue-500 border-b-2 border-blue-500 -mb-px' : 'text-gray-400 hover:text-gray-600'}`}>
                ✍️ {t('artist_profile.posts')} <span className="ml-1 text-xs bg-blue-50 text-blue-400 px-1.5 py-0.5 rounded-full font-extrabold">{posts.length}</span>
              </button>
            </div>

            {activeTab === 'posts' && (
              <div className="flex flex-col gap-6 mb-8">
                {posts.length === 0 ? (
                  <div className="text-center py-12 text-gray-300 font-bold">{t('artist_profile.no_posts')}</div>
                ) : posts.map(post => (
                  <article key={post.id} className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
                    {post.imageUrl && (
                      <div className="h-56 overflow-hidden">
                        <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="p-6">
                      <div className="text-xs text-gray-400 font-medium mb-2">
                        {new Date(post.createdAt).toLocaleDateString('pt-PT', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </div>
                      <h3 className="text-xl font-extrabold text-gray-900 mb-3 tracking-tight" style={{letterSpacing:'-0.02em'}}>{post.title}</h3>
                      <div className={`text-gray-600 font-medium leading-relaxed text-sm ${expandedPost === post.id ? '' : 'line-clamp-3'}`}
                        dangerouslySetInnerHTML={{ __html: expandedPost === post.id ? post.content : post.content?.replace(/<[^>]*>/g, '') }} />
                    <button onClick={() => setExpandedPost(expandedPost === post.id ? null : post.id)}
                      className="text-xs font-bold text-blue-500 hover:text-blue-600 mt-2">
                      {expandedPost === post.id ? t('feed.collapse') : t('feed.read_more')}
                    </button>
                    </div>
                  </article>
                ))}
              </div>
            )}

            {activeTab === 'obras' && (
              <>
                {artworks.length === 0 ? (
                  <div className="text-center py-16 text-gray-300 font-bold">{t('explore.no_results')}</div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {artworks.map(w => (
                      <Link href={`/artwork/${w.id}`} key={w.id} className="rounded-xl overflow-hidden border border-gray-100 hover:border-blue-200 transition-colors block group">
                        <div className="relative bg-blue-50 aspect-[4/5] overflow-hidden flex items-center justify-center">
                          {w.images?.[0]
                            ? <img src={w.images[0].imageUrl} alt={w.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            : <span className="text-blue-200 text-4xl font-extrabold">{w.title?.[0]}</span>}
                          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <AddToCollection artworkId={w.id} />
                          </div>
                        </div>
                        <div className="p-3">
                          <div className="text-sm font-bold text-gray-900 leading-tight">{w.title}</div>
                          <div className="flex justify-between items-center mt-1.5">
                            <span className="text-sm font-bold text-gray-700">
                              {w.priceOnRequest ? t('artwork.on_request') : w.price ? `€ ${Number(w.price).toLocaleString('pt-PT')}` : t('artwork.on_request')}
                            </span>
                            <span className="flex items-center gap-1 text-xs font-semibold" style={{color: availColor(w.availability)}}>
                              <span className="w-1.5 h-1.5 rounded-full" style={{background: availColor(w.availability)}}></span>
                              {t(`artwork.${w.availability?.toLowerCase()}`)}
                            </span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      {/* Modal de contacto */}
      {contactOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={e => e.target === e.currentTarget && setContactOpen(false)}>
          <div className="bg-white rounded-2xl p-7 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-extrabold tracking-tight">{t('contact.title')} {artist.artistName}</h3>
              <button onClick={() => setContactOpen(false)} className="text-gray-300 hover:text-gray-600 text-xl font-bold">×</button>
            </div>
            <form onSubmit={handleContact} className="flex flex-col gap-3">
              <textarea
                value={contactForm.message}
                onChange={e => setContactForm({ message: e.target.value })}
                className="input resize-none" rows={5}
                placeholder={t('contact.message_placeholder')}
                autoFocus
              />
              <p className="text-xs text-gray-400 font-medium">{t('contact.note')}</p>
              <button type="submit" disabled={sending}
                className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl transition-colors">
                {sending ? t('contact.sending') : t('contact.send')}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}