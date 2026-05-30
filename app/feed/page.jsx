'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '../../context/AuthContext'
import { useLocale } from '../../context/LocaleContext'
import api from '../../lib/api'
import AddToCollection from '../../components/ui/AddToCollection'

const availColor = (a) => a === 'AVAILABLE' ? '#2ECC71' : a === 'RESERVED' ? '#F39C12' : '#E74C3C'

export default function FeedPage() {
  const { isLoggedIn, loading } = useAuth()
  const { t } = useLocale()
  const router = useRouter()
  const [artworks, setArtworks] = useState([])
  const [feedPosts, setFeedPosts] = useState([])
  const [following, setFollowing] = useState([])
  const [loadingFeed, setLoadingFeed] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    if (!loading && !isLoggedIn) router.push('/login')
  }, [loading, isLoggedIn])

  useEffect(() => {
    if (isLoggedIn) {
      fetchFeed()
      api.get('/follow/following').then(res => setFollowing(res.data || [])).catch(() => {})
    }
  }, [isLoggedIn, page])

  const fetchFeed = async () => {
    setLoadingFeed(true)
    try {
      const res = await api.get(`/follow/feed?page=${page}&limit=12`)
      setArtworks(res.data.data || [])
      setFeedPosts(res.data.posts || [])
      setTotalPages(res.data.pagination?.totalPages || 1)
    } catch {}
    setLoadingFeed(false)
  }

  const feedItems = [
    ...artworks.map(w => ({ ...w, _type: 'artwork' })),
    ...feedPosts.map(p => ({ ...p, _type: 'post' }))
  ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" /></div>

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-5 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-gray-900" style={{letterSpacing:'-0.03em'}}>{t('feed.feed_title')}</h1>
            <p className="text-sm text-gray-400 font-medium mt-0.5">{t('feed.feed_subtitle')}</p>
          </div>
          <Link href="/artists" className="text-sm font-bold text-blue-500 hover:text-blue-600">
            {t('feed.discover_artists')}
          </Link>
        </div>

        {following.length > 0 && (
          <div className="flex gap-3 overflow-x-auto pb-4 mb-6 scrollbar-hide">
            {following.map(a => (
              <Link href={`/${a.username}`} key={a.id} className="flex flex-col items-center gap-1.5 flex-shrink-0">
                <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-blue-200 bg-blue-100">
                  {a.user?.avatarUrl
                    ? <img src={a.user.avatarUrl} alt={a.artistName} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-blue-400 font-extrabold text-xl">{a.artistName?.[0]}</div>}
                </div>
                <span className="text-xs font-semibold text-gray-600 text-center w-16 truncate">{a.artistName}</span>
              </Link>
            ))}
          </div>
        )}

        {loadingFeed ? (
          <div className="flex flex-col gap-4">
            {Array.from({length:4}).map((_,i) => <div key={i} className="bg-white rounded-2xl h-96 animate-pulse" />)}
          </div>
        ) : feedItems.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
            <div className="text-5xl mb-4">🎨</div>
            <div className="text-gray-700 font-extrabold text-lg mb-2">{t('feed.feed_empty')}</div>
            <p className="text-gray-400 text-sm font-medium mb-6 max-w-xs mx-auto">
              {t('feed.feed_empty_sub')}
            </p>
            <Link href="/artists" className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-bold text-sm rounded-xl transition-colors">
              {t('feed.discover_artists')}
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {feedItems.map(item => item._type === 'post' ? (
              <div key={item.id} className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
                <a href={`/${item.artist.username}`} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors">
                  <div className="w-9 h-9 rounded-full overflow-hidden bg-blue-100 flex-shrink-0">
                    {item.artist.user?.avatarUrl
                      ? <img src={item.artist.user.avatarUrl} alt={item.artist.artistName} className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center text-blue-400 font-extrabold text-sm">{item.artist.artistName?.[0]}</div>}
                  </div>
                  <div>
                    <div className="text-sm font-extrabold text-gray-900">{item.artist.artistName}</div>
                    <div className="text-xs text-gray-400 font-medium flex items-center gap-1">
                      ✍️ {t('feed.new_post')} · {new Date(item.createdAt).toLocaleDateString('pt-PT', { day: 'numeric', month: 'long' })}
                    </div>
                  </div>
                </a>
                {item.imageUrl && (
                  <div className="aspect-video overflow-hidden">
                    <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="p-5">
                  <h3 className="text-lg font-extrabold text-gray-900 mb-2">{item.title}</h3>
                  <div className="text-sm text-gray-600 font-medium leading-relaxed line-clamp-3"
                    dangerouslySetInnerHTML={{ __html: item.content?.replace(/<[^>]*>/g, '').slice(0, 200) + '…' }} />
                  <a href={`/${item.artist.username}?tab=posts`} className="text-xs font-bold text-blue-500 hover:text-blue-600 mt-2 block">
                    {t('feed.read_more')}
                  </a>
                </div>
              </div>
            ) : (
              <div key={item.id} className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
                <Link href={`/${item.artist.username}`} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors">
                  <div className="w-9 h-9 rounded-full overflow-hidden bg-blue-100 flex-shrink-0">
                    {item.artist.user?.avatarUrl
                      ? <img src={item.artist.user.avatarUrl} alt={item.artist.artistName} className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center text-blue-400 font-extrabold text-sm">{item.artist.artistName?.[0]}</div>}
                  </div>
                  <div>
                    <div className="text-sm font-extrabold text-gray-900">{item.artist.artistName}</div>
                    <div className="text-xs text-gray-400 font-medium">
                      {new Date(item.createdAt).toLocaleDateString('pt-PT', { day: 'numeric', month: 'long' })}
                    </div>
                  </div>
                </Link>
                <Link href={`/artwork/${item.id}`} className="block relative group">
                  <div className="aspect-square bg-blue-50 overflow-hidden">
                    {item.images?.[0]
                      ? <img src={item.images[0].imageUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      : <div className="w-full h-full flex items-center justify-center text-blue-200 text-8xl font-extrabold">{item.title?.[0]}</div>}
                  </div>
                  <div className="absolute top-3 right-3">
                    <AddToCollection artworkId={item.id} />
                  </div>
                </Link>
                <div className="px-4 py-3">
                  <div className="flex justify-between items-start mb-1">
                    <div>
                      <Link href={`/artwork/${item.id}`} className="text-base font-extrabold text-gray-900 hover:text-blue-500 transition-colors">{item.title}</Link>
                      <div className="text-xs text-blue-400 font-bold mt-0.5">{item.categories?.[0]?.category?.name}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-base font-extrabold text-gray-900">
                        {item.priceOnRequest ? t('artwork.on_request') : item.price ? `€ ${Number(item.price).toLocaleString('pt-PT')}` : t('artwork.on_request')}
                      </div>
                      <div className="flex items-center gap-1 text-xs font-semibold justify-end mt-0.5" style={{color: availColor(item.availability)}}>
                        <span className="w-1.5 h-1.5 rounded-full" style={{background: availColor(item.availability)}}></span>
                        {item.availability === 'AVAILABLE' ? t('artwork.available') : item.availability === 'RESERVED' ? t('artwork.reserved') : t('artwork.sold')}
                      </div>
                    </div>
                  </div>
                  <Link href={`/artwork/${item.id}`}
                    className="mt-2 block w-full text-center py-2 border border-blue-200 text-blue-500 hover:bg-blue-50 font-bold text-sm rounded-xl transition-colors">
                    {t('common.view_artwork')}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            <button onClick={() => setPage(p => Math.max(1,p-1))} disabled={page===1} className="w-8 h-8 border border-gray-200 rounded-lg text-sm font-bold text-gray-400 disabled:opacity-30">‹</button>
            <span className="flex items-center text-xs font-bold text-gray-400">{page} / {totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages,p+1))} disabled={page===totalPages} className="w-8 h-8 border border-gray-200 rounded-lg text-sm font-bold text-gray-400 disabled:opacity-30">›</button>
          </div>
        )}
      </div>
    </div>
  )
}
