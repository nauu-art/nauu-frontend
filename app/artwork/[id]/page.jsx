'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Heart, Mail, Share2, ChevronRight } from 'lucide-react'
import api from '../../../lib/api'
import { useAuth } from '../../../context/AuthContext'
import { useLocale } from '../../../context/LocaleContext'
import toast from 'react-hot-toast'
import ArtistAvatar from '../../../components/ui/ArtistAvatar'
import AvailabilityBadge from '../../../components/ui/AvailabilityBadge'
import PriceTag from '../../../components/ui/PriceTag'
import ArtworkCard from '../../../components/ui/ArtworkCard'
import ArtworkComments from '../../../components/ui/ArtworkComments'
import ImageCarousel from '../../../components/ui/ImageCarousel'
import Lightbox from 'yet-another-react-lightbox'
import 'yet-another-react-lightbox/styles.css'

export default function ObraPage() {
  const { id } = useParams()
  const { isLoggedIn, user } = useAuth()
  const { t } = useLocale()
  const [artwork, setArtwork] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeImg, setActiveImg] = useState(0)
  const [faved, setFaved] = useState(false)

  // Verificar se já está nos favoritos
  useEffect(() => {
    if (isLoggedIn) {
      api.get('/favorites').then(res => {
        setFaved((res.data || []).some(f => f.id === id))
      }).catch(() => {})
    }
  }, [isLoggedIn, id])
  const [moreWorks, setMoreWorks] = useState([])
  const [similarWorks, setSimilarWorks] = useState([])
  const [collectionWorks, setCollectionWorks] = useState([])




  const [startingConversation, setStartingConversation] = useState(false)
  const [artworkShipping, setArtworkShipping] = useState(null)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)
  const [existingConversation, setExistingConversation] = useState(null)

  useEffect(() => {
    if (isLoggedIn && artwork) {
      api.get('/messages').then(res => {
        const conv = (res.data || []).find(c => c.artwork?.id === artwork.id)
        setExistingConversation(conv || null)
      }).catch(() => {})
    }
  }, [isLoggedIn, artwork])

  useEffect(() => {
    api.get(`/artworks/${id}`)
      .then(res => {
        setArtwork(res.data)
        if (res.data.artist?.username) {
          api.get(`/artists/${res.data.artist.username}/artworks?limit=4`)
            .then(r => setMoreWorks((r.data.data || []).filter(w => w.id !== id).slice(0, 4)))
        }
        api.get(`/artworks/${id}/similar`)
          .then(r => setSimilarWorks(r.data || []))
          .catch(() => {})
        // Carregar obras da mesma coleção
        api.get(`/payments/shipping/${id}`).then(r => setArtworkShipping(r.data)).catch(() => {})
        res.data.collectionId && api.get(`/artist-collections/collection/${res.data.collectionId}`)
          .then(r => setCollectionWorks((r.data.artworks || []).filter(w => w.id !== id).slice(0, 4)))
          .catch(() => {})
      }).catch(() => {}).finally(() => setLoading(false))
  }, [id])

  const handleFav = async () => {
    if (!isLoggedIn) { toast.error(t('auth.login_btn') + ' ' + t('artwork.save_favorites').toLowerCase()); return }
    try {
      if (faved) { await api.delete(`/favorites/${id}`); setFaved(false); toast.success(t('artwork.save_favorites')) }
      else { await api.post(`/favorites/${id}`); setFaved(true); toast.success(t('artwork.saved_favorites')) }
    } catch { toast.error(t('common.error')) }
  }

  const handleStartConversation = async () => {
    if (!isLoggedIn) { router.push('/login'); return }
    setStartingConversation(true)
    try {
      const artistUser = artwork.artist
      // Obter userId do artista
      const res = await api.post('/messages', {
        artistUserId: artwork.artist?.userId || artwork.artist?.user?.id,
        artworkId: id,
        content: `Olá! Tenho interesse na obra "${artwork.title}".`
      })
      router.push(`/account/messages/${res.data.conversation.id}`)
    } catch { toast.error(t('common.error')) }
    setStartingConversation(false)
  }

  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" /></div>
  if (!artwork) return <div className="text-center py-24 text-gray-300 font-bold text-lg">{t('common.not_found')}</div>

  const images = artwork.images || []
  const artist = artwork.artist

  return (
    <div>
      <div className="px-5 md:px-10 py-3 border-b border-gray-100 flex items-center gap-2 text-xs text-gray-400 font-medium">
        <Link href="/" className="hover:text-gray-700">{t('common.home')}</Link>
        <ChevronRight size={12} />
        <Link href="/explore" className="hover:text-gray-700">{t('nav.explore')}</Link>
        <ChevronRight size={12} />
        <span className="text-gray-600">{artwork.title}</span>
      </div>

      <div className="grid px-5 md:px-10 py-8 gap-8 md:gap-12" style={{gridTemplateColumns:'1fr'}}>
        <div className="grid md:grid-cols-2 gap-8 md:gap-12">
          {/* Galeria */}
          <div>
            <div className="rounded-xl overflow-hidden mb-3 cursor-zoom-in"
              onClick={() => { if(images[activeImg]) { setLightboxIndex(activeImg); setLightboxOpen(true) } }}>
              <ImageCarousel images={images} title={artwork.title} aspect="4/5" />
            </div>
          </div>

          {/* Info */}
          <div>
            <div className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-2">
              {artwork.categories?.[0]?.category?.name || ''}
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-1" style={{letterSpacing:'-0.03em'}}>{artwork.title}</h1>
            <div className="flex items-center gap-2 mb-6">
              <p className="text-sm text-gray-400 font-medium">{artwork.yearCreated}</p>
              {artwork.collection && (
                <>
                  <span className="text-gray-300">·</span>
                  <a href={`/collection/${artwork.collectionId}`} className="text-sm text-purple-500 italic font-medium hover:text-purple-600 transition-colors">
                    {artwork.collection.name}
                  </a>
                </>
              )}
            </div>

            <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 mb-5">
              <div className="text-xs font-bold uppercase tracking-widest text-gray-300 mb-1">{t('artwork.price')}</div>
              <PriceTag price={artwork.price} priceOnRequest={artwork.priceOnRequest} className="text-3xl font-extrabold tracking-tight text-gray-900 block" />
              <AvailabilityBadge availability={artwork.availability} className="mt-2" />
            </div>

            <div className="flex flex-col gap-2 mb-6">
              {/* Botão Comprar */}
              {artwork.availability === 'AVAILABLE' && !artwork.priceOnRequest && artwork.price && artwork.artist?.stripeOnboarded && (
                <Link href={`/checkout/${id}`}
                  className="flex items-center justify-center gap-2 w-full py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl transition-colors mb-2">
                  🛒 Comprar — € {parseFloat(artwork.price).toFixed(2)}
                  {artworkShipping && !artworkShipping.freeShipping && artworkShipping.portugal && (
                    <span className="text-xs font-medium opacity-80">+ €{parseFloat(artworkShipping.portugal).toFixed(2)} portes</span>
                  )}
                  {artworkShipping?.freeShipping && <span className="text-xs font-medium opacity-80">portes incluídos</span>}
                </Link>
              )}

              {existingConversation ? (
                <Link href={`/account/messages/${existingConversation.id}`}
                  className="flex items-center justify-center gap-2 w-full py-3 border-2 border-blue-500 text-blue-500 hover:bg-blue-50 font-bold rounded-xl transition-colors">
                  💬 {t('artwork.existing_thread')}
                </Link>
              ) : isLoggedIn ? (
                <button onClick={handleStartConversation} disabled={startingConversation}
                  className="flex items-center justify-center gap-2 w-full py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl transition-colors disabled:opacity-50">
                  <Mail size={16} /> {startingConversation ? 'A abrir…' : t('artwork.contact_artist')}
                </button>
              ) : (
                <Link href="/login"
                  className="flex items-center justify-center gap-2 w-full py-3 border-2 border-blue-500 text-blue-500 hover:bg-blue-50 font-bold rounded-xl transition-colors">
                  <Mail size={16} /> {t('artwork.contact_artist')}
                </Link>
              )}
              {artwork.availability === 'AVAILABLE' && !artwork.priceOnRequest && artwork.price && artwork.artist?.stripeOnboarded && (
                <a href={`/checkout/${artwork.id}`}
                  className="flex items-center justify-center gap-2 w-full py-3 bg-green-500 hover:bg-green-600 text-white font-extrabold rounded-xl transition-colors">
                  🛒 Comprar — € {Number(artwork.price).toLocaleString('pt-PT')}
                </a>
              )}
              <button onClick={handleFav}
                className={`flex items-center justify-center gap-2 w-full py-2.5 border-2 font-bold rounded-xl transition-all ${faved ? 'border-red-400 text-red-500 bg-red-50 hover:bg-red-100' : 'border-gray-200 text-gray-500 hover:border-red-300 hover:text-red-400'}`}>
                <Heart size={16} fill={faved ? 'currentColor' : 'none'} />
                {faved ? t('artwork.saved_favorites') : t('artwork.save_favorites')}
              </button>
            </div>

            <div className="grid grid-cols-2 border border-gray-100 rounded-xl overflow-hidden mb-6">
              {[
                [t('artwork.technique'), artwork.technique],
                [t('artwork.dimensions'), artwork.dimensions],
                [t('artwork.year'), artwork.yearCreated],
                [t('artwork.status'), t(`artwork.${artwork.availability?.toLowerCase()}`)],
              ].map(([label, val]) => val && (
                <div key={label} className="p-3 border-b border-r border-gray-100 last:border-r-0">
                  <div className="text-xs font-bold uppercase tracking-widest text-gray-300 mb-0.5">{label}</div>
                  <div className="text-sm font-bold text-gray-700">{val}</div>
                </div>
              ))}
              {artwork.description && (
                <div className="col-span-2 p-3 border-t border-gray-100">
                  <div className="text-xs font-bold uppercase tracking-widest text-gray-300 mb-1">{t('artwork.description')}</div>
                  <p className="text-sm text-gray-500 font-medium leading-relaxed">{artwork.description}</p>
                </div>
              )}
            </div>

            {artist && (
              <Link href={`/${artist.username}`} className="flex items-center gap-3 border border-gray-100 rounded-xl p-3 hover:border-blue-200 transition-colors mb-4">
                <ArtistAvatar src={artist.user?.avatarUrl} name={artist.artistName} size={12} />
                <div className="flex-1">
                  <div className="text-sm font-extrabold text-gray-900">{artist.artistName}</div>
                  <div className="text-xs text-gray-400 font-medium mt-0.5">{artist.city}{artist.country ? `, ${artist.country}` : ''}</div>
                  <div className="text-xs text-blue-500 font-bold mt-1">{t('common.view_profile')} →</div>
                </div>
              </Link>
            )}

            <div className="flex flex-wrap gap-2">
              <button onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success(t('artwork.share_copied')) }}
                className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 border border-gray-200 rounded-lg text-gray-500 hover:border-blue-300 hover:text-blue-500 transition-colors">
                <Share2 size={13} /> Copiar link
              </button>
              <a href={`https://wa.me/?text=${encodeURIComponent(artwork.title + ' — nauu.art\n' + (typeof window !== 'undefined' ? window.location.href : ''))}`}
                target="_blank"
                className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 border border-gray-200 rounded-lg text-gray-500 hover:border-green-400 hover:text-green-600 transition-colors">
                📱 WhatsApp
              </a>
              <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
                target="_blank"
                className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 border border-gray-200 rounded-lg text-gray-500 hover:border-blue-500 hover:text-blue-600 transition-colors">
                📘 Facebook
              </a>
              <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(artwork.title + ' — ')}&url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
                target="_blank"
                className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 border border-gray-200 rounded-lg text-gray-500 hover:border-gray-900 hover:text-gray-900 transition-colors">
                𝕏 Twitter
              </a>
            </div>
          </div>
        </div>
      </div>

      {artwork.collection && collectionWorks.length > 0 && (
        <div className="px-5 md:px-10 py-8 border-t border-gray-100">
          <div className="flex justify-between items-center mb-5">
            <div>
              <div className="text-xs font-extrabold uppercase tracking-widest text-gray-300 mb-1">Coleção</div>
              <h2 className="text-lg font-extrabold tracking-tight">{artwork.collection.name}</h2>
            </div>
            <a href={`/collection/${artwork.collectionId}`} className="text-sm font-bold text-blue-500 hover:text-blue-600">Ver coleção →</a>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {collectionWorks.map(w => <ArtworkCard key={w.id} artwork={w} showArtist={false} />)}
          </div>
        </div>
      )}

      {/* Comentários e likes */}
      <ArtworkComments artworkId={id} artistUserId={artwork?.artist?.userId} />

      {moreWorks.length > 0 && (
        <div className="px-5 md:px-10 py-8 border-t border-gray-100">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-lg font-extrabold tracking-tight">{t('artwork.more_works')} {artist?.artistName}</h2>
            <Link href={`/${artist?.username}`} className="text-sm font-bold text-blue-500">{t('artwork.see_all')}</Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {moreWorks.map(w => <ArtworkCard key={w.id} artwork={w} showArtist={false} />)}
          </div>
        </div>
      )}

      {lightboxOpen && images.length > 0 && (
        <Lightbox
          open={lightboxOpen}
          close={() => setLightboxOpen(false)}
          index={lightboxIndex}
          slides={images.map(img => ({ src: img.imageUrl }))}
        />
      )}
    </div>
  )
}