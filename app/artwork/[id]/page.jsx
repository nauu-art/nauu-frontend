'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Heart, Mail, Share2, ChevronRight } from 'lucide-react'
import api from '../../../lib/api'
import { useAuth } from '../../../context/AuthContext'
import { useLocale } from '../../../context/LocaleContext'
import toast from 'react-hot-toast'
import Lightbox from 'yet-another-react-lightbox'
import 'yet-another-react-lightbox/styles.css'

const availColor = (a) => a === 'AVAILABLE' ? '#2ECC71' : a === 'RESERVED' ? '#F39C12' : '#E74C3C'

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
  const [modalOpen, setModalOpen] = useState(false)
  const [moreWorks, setMoreWorks] = useState([])
  const [similarWorks, setSimilarWorks] = useState([])
  const [form, setForm] = useState({ name: '', email: '', message: '' })

  // Pré-preencher com dados do utilizador logado
  useEffect(() => {
    if (user) setForm(f => ({ ...f, name: user.name || '', email: user.email || '' }))
  }, [user])
  const [sending, setSending] = useState(false)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)
  const [existingThread, setExistingThread] = useState(false)

  // Verificar se já existe conversa com este artista
  useEffect(() => {
    if (isLoggedIn && artwork?.artist?.username) {
      api.get('/contact/sent').then(res => {
        const contacts = res.data || []
        const hasThread = contacts.some(c => c.artist?.username === artwork.artist.username)
        setExistingThread(hasThread)
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
      }).catch(() => {}).finally(() => setLoading(false))
  }, [id])

  const handleFav = async () => {
    if (!isLoggedIn) { toast.error('Faz login para guardar favoritos'); return }
    try {
      if (faved) { await api.delete(`/favorites/${id}`); setFaved(false); toast.success('Removido dos favoritos') }
      else { await api.post(`/favorites/${id}`); setFaved(true); toast.success('Guardado nos favoritos!') }
    } catch { toast.error('Erro') }
  }

  const handleContact = async (e) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.message) { toast.error(t('contact.error_fields')); return }
    setSending(true)
    try {
      await api.post(`/contact/${artwork.artist.username}`, { ...form, artworkId: id })
      toast.success(t('contact.success'))
      setModalOpen(false)
      setForm({ name: '', email: '', message: '' })
    } catch { toast.error(t('common.error')) }
    setSending(false)
  }

  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" /></div>
  if (!artwork) return <div className="text-center py-24 text-gray-300 font-bold text-lg">Obra não encontrada.</div>

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
            <div className="rounded-xl overflow-hidden bg-blue-50 mb-3 aspect-[4/5] flex items-center justify-center cursor-zoom-in relative group"
              onClick={() => { if(images[activeImg]) { setLightboxIndex(activeImg); setLightboxOpen(true) } }}>
              {images[activeImg] ? (
                <>
                  <img src={images[activeImg].imageUrl} alt={artwork.title} className="w-full h-full object-contain" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 text-gray-700 text-xs font-bold px-3 py-1.5 rounded-full">
                      🔍 Clica para ampliar
                    </span>
                  </div>
                </>
              ) : (
                <span className="text-blue-200 text-8xl font-extrabold">{artwork.title?.[0]}</span>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-2">
                {images.map((img, i) => (
                  <button key={i} onClick={() => setActiveImg(i)}
                    className={`w-16 h-12 rounded-lg overflow-hidden border-2 transition-all ${activeImg === i ? 'border-blue-500' : 'border-transparent'}`}>
                    <img src={img.imageUrl} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            <div className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-2">
              {artwork.categories?.[0]?.category?.name || 'Arte'}
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-1" style={{letterSpacing:'-0.03em'}}>{artwork.title}</h1>
            <p className="text-sm text-gray-400 font-medium mb-6">{artwork.yearCreated}</p>

            <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 mb-5">
              <div className="text-xs font-bold uppercase tracking-widest text-gray-300 mb-1">{t('artwork.price')}</div>
              <div className="text-3xl font-extrabold tracking-tight text-gray-900">
                {artwork.priceOnRequest ? t('artwork.on_request') : artwork.price ? `€ ${Number(artwork.price).toLocaleString('pt-PT')}` : t('artwork.on_request')}
              </div>
              <div className="flex items-center gap-1.5 mt-2 text-xs font-semibold" style={{color: availColor(artwork.availability)}}>
                <span className="w-2 h-2 rounded-full" style={{background: availColor(artwork.availability)}}></span>
                {t(`artwork.${artwork.availability?.toLowerCase()}`)}
              </div>
            </div>

            <div className="flex flex-col gap-2 mb-6">
              {isLoggedIn ? (
                <div className="flex flex-col gap-2">
                  <button onClick={() => setModalOpen(true)}
                    className="flex items-center justify-center gap-2 w-full py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl transition-colors">
                    <Mail size={16} /> {t('artwork.contact_artist')}
                  </button>
                  {existingThread && (
                    <Link href="/account/contacts"
                      className="flex items-center justify-center gap-2 w-full py-2.5 border border-green-300 text-green-600 hover:bg-green-50 font-bold text-sm rounded-xl transition-colors">
                      💬 Já tens conversa com este artista →
                    </Link>
                  )}
                </div>
              ) : (
                <Link href="/login"
                  className="flex items-center justify-center gap-2 w-full py-3 border-2 border-blue-500 text-blue-500 hover:bg-blue-50 font-bold rounded-xl transition-colors">
                  <Mail size={16} /> Entra para contactar o artista
                </Link>
              )}
              <button onClick={handleFav}
                className={`flex items-center justify-center gap-2 w-full py-2.5 border-2 font-bold rounded-xl transition-all ${faved ? 'border-red-400 text-red-500 bg-red-50 hover:bg-red-100' : 'border-gray-200 text-gray-500 hover:border-red-300 hover:text-red-400'}`}>
                <Heart size={16} fill={faved ? 'currentColor' : 'none'} />
                {faved ? 'Guardado nos favoritos' : t('artwork.save_favorites')}
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
                <div className="w-12 h-12 rounded-full bg-blue-400 flex items-center justify-center text-white font-extrabold text-lg flex-shrink-0 overflow-hidden">
                  {artist.user?.avatarUrl ? <img src={artist.user.avatarUrl} className="w-full h-full object-cover rounded-full" /> : artist.artistName?.[0]}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-extrabold text-gray-900">{artist.artistName}</div>
                  <div className="text-xs text-gray-400 font-medium mt-0.5">{artist.city}{artist.country ? `, ${artist.country}` : ''}</div>
                  <div className="text-xs text-blue-500 font-bold mt-1">Ver perfil →</div>
                </div>
              </Link>
            )}

            <div className="flex flex-wrap gap-2">
              <button onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success('Link copiado!') }}
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

      {moreWorks.length > 0 && (
        <div className="px-5 md:px-10 py-8 border-t border-gray-100">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-lg font-extrabold tracking-tight">{t('artwork.more_works')} {artist?.artistName}</h2>
            <Link href={`/${artist?.username}`} className="text-sm font-bold text-blue-500">{t('artwork.see_all')}</Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {moreWorks.map(w => (
              <Link href={`/artwork/${w.id}`} key={w.id} className="rounded-xl overflow-hidden border border-gray-100 hover:border-blue-200 transition-colors block">
                <div className="bg-blue-50 aspect-[4/5] flex items-center justify-center overflow-hidden">
                  {w.images?.[0] ? <img src={w.images[0].imageUrl} alt={w.title} className="w-full h-full object-cover" />
                    : <span className="text-blue-200 text-3xl font-extrabold">{w.title?.[0]}</span>}
                </div>
                <div className="p-2.5">
                  <div className="text-sm font-bold text-gray-900 leading-tight">{w.title}</div>
                  <div className="text-xs text-gray-400 mt-1 font-semibold">
                    {w.priceOnRequest ? t('artwork.on_request') : w.price ? `€ ${Number(w.price).toLocaleString('pt-PT')}` : t('artwork.on_request')}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={e => e.target === e.currentTarget && setModalOpen(false)}>
          <div className="bg-white rounded-2xl p-7 w-full max-w-md relative">
            <button onClick={() => setModalOpen(false)} className="absolute top-4 right-4 text-gray-300 hover:text-gray-600 text-xl font-bold">×</button>
            <h3 className="text-lg font-extrabold tracking-tight mb-1">{t('contact.title')} {artist?.artistName}</h3>
            <p className="text-sm text-gray-400 font-medium mb-5">{t('contact.about')}: {artwork.title}</p>
            <form onSubmit={handleContact} className="flex flex-col gap-3">
              <div>
                <label className="label">{t('contact.message')}</label>
                <textarea value={form.message} onChange={e => setForm(f => ({...f, message: e.target.value}))} className="input" rows={5} placeholder={t('contact.message_placeholder')} autoFocus />
              </div>
              <p className="text-xs text-gray-400 font-medium">{t('contact.note')}</p>
              <button type="submit" disabled={sending} className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl transition-colors">
                {sending ? t('contact.sending') : t('contact.send')}
              </button>
            </form>
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