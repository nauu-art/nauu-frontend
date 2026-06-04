'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '../../../context/AuthContext'
import { Mail, MessageSquare, ExternalLink, ArrowLeft } from 'lucide-react'
import DashboardNav from '../../../components/ui/DashboardNav'
import api from '../../../lib/api'

export default function DashboardContactsPage() {
  const { user, isArtist, isLoggedIn, loading } = useAuth()
  const router = useRouter()
  const [contacts, setContacts] = useState([])
  const [loadingContacts, setLoadingContacts] = useState(true)
  const [selectedThread, setSelectedThread] = useState(null)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    if (!loading && !isLoggedIn) router.push('/login')
    if (!loading && !isArtist) router.push('/')
  }, [loading, isLoggedIn, isArtist])

  useEffect(() => {
    if (isArtist) {
      setLoadingContacts(true)
      api.get(`/contact/received?page=${page}&limit=100`)
        .then(res => { setContacts(res.data.data || []); setTotal(res.data.pagination?.total || 0) })
        .catch(() => {})
        .finally(() => setLoadingContacts(false))
    }
  }, [isArtist, page])

  const threads = Object.values(contacts.reduce((acc, c) => {
    const key = c.email
    if (!acc[key]) acc[key] = { name: c.name, email: c.email, messages: [] }
    acc[key].messages.push(c)
    return acc
  }, {})).sort((a, b) => new Date(b.messages[0].createdAt) - new Date(a.messages[0].createdAt))

  if (loading || !user) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
    </div>
  )

  return (
    <div className="flex min-h-screen bg-gray-50">
      <DashboardNav />

      <div className="flex-1 flex flex-col md:flex-row pt-16 md:pt-0 overflow-hidden" style={{height: '100vh'}}>

        {/* Lista de threads — esconde no mobile quando há thread seleccionada */}
        <div className={`${selectedThread ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-80 border-r border-gray-100 bg-white`}>
          <div className="px-5 py-4 border-b border-gray-100">
            <h1 className="text-lg font-extrabold tracking-tight text-gray-900">Contactos</h1>
            <p className="text-xs text-gray-400 font-medium mt-0.5">{threads.length} conversas · {total} mensagens</p>
          </div>

          {loadingContacts ? (
            <div className="flex-1 p-4 space-y-3">
              {Array.from({length:4}).map((_,i) => <div key={i} className="h-16 bg-gray-50 rounded-xl animate-pulse" />)}
            </div>
          ) : threads.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <MessageSquare size={32} className="text-gray-200 mb-3" />
              <div className="text-gray-300 font-bold text-sm">Ainda não recebeste contactos</div>
            </div>
          ) : (
            <div className="flex-1 md:ml-52 overflow-auto">
              {threads.map(thread => {
                const lastMsg = thread.messages[thread.messages.length - 1]
                const isSelected = selectedThread?.email === thread.email
                return (
                  <button key={thread.email} onClick={() => setSelectedThread(thread)}
                    className={`w-full text-left p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors ${isSelected ? 'bg-blue-50 border-l-2 border-blue-500' : ''}`}>
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 font-extrabold text-sm flex-shrink-0">
                        {thread.name?.[0]?.toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-0.5">
                          <div className="text-sm font-bold text-gray-900 truncate">{thread.name}</div>
                          <div className="text-xs text-gray-400 flex-shrink-0 ml-2">{new Date(lastMsg.createdAt).toLocaleDateString('pt-PT', {day:'numeric', month:'short'})}</div>
                        </div>
                        <div className="text-xs text-gray-400 truncate">{thread.email}</div>
                        <div className="flex justify-between items-center mt-1">
                          <div className="text-xs text-gray-500 truncate flex-1">{lastMsg.message}</div>
                          {thread.messages.length > 1 && (
                            <span className="ml-2 text-xs font-bold bg-blue-500 text-white px-1.5 py-0.5 rounded-full flex-shrink-0">{thread.messages.length}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Detalhe da thread */}
        <div className={`${selectedThread ? 'flex' : 'hidden md:flex'} flex-1 flex-col overflow-hidden`}>
          {!selectedThread ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <MessageSquare size={48} className="text-gray-200 mb-4" />
              <div className="text-gray-300 font-bold">Seleciona uma conversa</div>
            </div>
          ) : (
            <>
              <div className="px-4 md:px-6 py-4 border-b border-gray-100 bg-white flex justify-between items-center gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <button onClick={() => setSelectedThread(null)} className="md:hidden p-1.5 text-gray-400 hover:text-gray-700 flex-shrink-0">
                    <ArrowLeft size={20} />
                  </button>
                  <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-500 font-extrabold flex-shrink-0">
                    {selectedThread.name?.[0]?.toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-extrabold text-gray-900 truncate">{selectedThread.name}</div>
                    <a href={`mailto:${selectedThread.email}`} className="text-xs text-blue-500 font-medium hover:text-blue-600 truncate block">{selectedThread.email}</a>
                  </div>
                </div>
                <a href={`mailto:${selectedThread.email}?subject=Re: nauu.art`}
                  className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 text-gray-500 hover:border-blue-300 hover:text-blue-500 font-bold text-xs rounded-xl transition-colors flex-shrink-0">
                  <Mail size={13} /> <span className="hidden sm:inline">Responder</span>
                </a>
              </div>

              <div className="flex-1 overflow-auto p-4 md:p-6 flex flex-col gap-3">
                {selectedThread.messages
                  .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
                  .map(msg => (
                  <div key={msg.id} className="bg-white border border-gray-100 rounded-xl p-4">
                    <div className="flex justify-between items-start mb-2 gap-2">
                      <div className="text-xs text-gray-400 font-medium">
                        {new Date(msg.createdAt).toLocaleDateString('pt-PT', { day:'numeric', month:'long', hour:'2-digit', minute:'2-digit' })}
                      </div>
                      {msg.artwork && (
                        <Link href={`/artwork/${msg.artworkId}`}
                          className="flex items-center gap-1 text-xs text-blue-500 font-semibold hover:text-blue-600 flex-shrink-0">
                          📎 {msg.artwork.title} <ExternalLink size={10} />
                        </Link>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 font-medium leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
