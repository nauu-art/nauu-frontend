'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '../../../context/AuthContext'
import { useLocale } from '../../../context/LocaleContext'
import { Mail, ExternalLink } from 'lucide-react'
import api from '../../../lib/api'

export default function AccountContactsPage() {
  const { isLoggedIn, loading } = useAuth()
  const { t } = useLocale()
  const router = useRouter()
  const [contacts, setContacts] = useState([])
  const [loadingContacts, setLoadingContacts] = useState(true)

  useEffect(() => {
    if (!loading && !isLoggedIn) router.push('/login')
  }, [loading, isLoggedIn])

  useEffect(() => {
    if (isLoggedIn) {
      api.get('/contact/sent')
        .then(res => setContacts(res.data || []))
        .catch(() => {})
        .finally(() => setLoadingContacts(false))
    }
  }, [isLoggedIn])

  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" /></div>

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-5 py-12">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
            <Mail size={18} className="text-blue-500" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-gray-900" style={{letterSpacing:'-0.03em'}}>Contactos enviados</h1>
            <p className="text-sm text-gray-400 font-medium mt-0.5">{contacts.length} mensagens enviadas</p>
          </div>
        </div>

        {loadingContacts ? (
          <div className="space-y-3">{Array.from({length:3}).map((_,i) => <div key={i} className="h-20 bg-white rounded-2xl animate-pulse" />)}</div>
        ) : contacts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
            <Mail size={40} className="text-gray-200 mx-auto mb-4" />
            <div className="text-gray-300 font-bold text-lg mb-2">Ainda não enviaste contactos</div>
            <p className="text-gray-400 text-sm font-medium mb-6">Explora o catálogo e contacta os artistas que te interessam.</p>
            <Link href="/explore" className="inline-block px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-bold text-sm rounded-xl transition-colors">
              {t('nav.explore')}
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {contacts.map(c => (
              <div key={c.id} className="bg-white border border-gray-100 rounded-2xl p-5">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="text-sm font-extrabold text-gray-900">{c.artist?.artistName}</div>
                    {c.artwork && (
                      <Link href={`/artwork/${c.artworkId}`} className="flex items-center gap-1 text-xs text-blue-500 font-semibold mt-0.5 hover:text-blue-600">
                        📎 {c.artwork.title} <ExternalLink size={10} />
                      </Link>
                    )}
                  </div>
                  <div className="text-xs text-gray-400 font-medium">{new Date(c.createdAt).toLocaleDateString('pt-PT')}</div>
                </div>
                <p className="text-sm text-gray-500 font-medium leading-relaxed line-clamp-3">{c.message}</p>
                <div className="mt-3 pt-3 border-t border-gray-50">
                  <Link href={`/${c.artist?.username}`} className="text-xs font-bold text-blue-500 hover:text-blue-600">
                    Ver perfil do artista →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
