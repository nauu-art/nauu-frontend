'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '../../../context/AuthContext'
import { LayoutDashboard, Image, Mail, User, LogOut, MessageSquare, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react'
import DashboardNav from '../../../components/ui/DashboardNav'
import api from '../../../lib/api'

export default function DashboardContactsPage() {
  const { user, isArtist, isLoggedIn, loading, logout } = useAuth()
  const router = useRouter()
  const [contacts, setContacts] = useState([])
  const [loadingContacts, setLoadingContacts] = useState(true)
  const [selectedThread, setSelectedThread] = useState(null)
  const [expandedThreads, setExpandedThreads] = useState({})
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    if (!loading && !isLoggedIn) router.push('/login')
    if (!loading && !isArtist) router.push('/')
  }, [loading, isLoggedIn, isArtist])

  useEffect(() => {
    if (isArtist) fetchContacts()
  }, [isArtist, page])

  const fetchContacts = async () => {
    setLoadingContacts(true)
    try {
      const res = await api.get(`/contact/received?page=${page}&limit=100`)
      setContacts(res.data.data || [])
      setTotal(res.data.pagination?.total || 0)
      setTotalPages(res.data.pagination?.totalPages || 1)
    } catch {}
    setLoadingContacts(false)
  }

  // Agrupar mensagens por remetente (email)
  const threads = contacts.reduce((acc, c) => {
    const key = c.email
    if (!acc[key]) acc[key] = { name: c.name, email: c.email, messages: [] }
    acc[key].messages.push(c)
    return acc
  }, {})

  const threadList = Object.values(threads).sort((a, b) =>
    new Date(b.messages[0].createdAt) - new Date(a.messages[0].createdAt)
  )

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/artworks', label: 'As minhas obras', icon: Image },
    { href: '/dashboard/contacts', label: 'Contactos', icon: Mail, active: true },
    { href: '/dashboard/profile', label: 'Editar perfil', icon: User },
  ]

  if (loading || !user) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" /></div>

  return (
    <div className="flex min-h-screen bg-gray-50">
      <DashboardNav />

      <div className="flex-1 flex">
        {/* Lista de threads */}
        <div className="w-80 border-r border-gray-100 bg-white flex flex-col">
          <div className="p-5 border-b border-gray-100">
            <h1 className="text-lg font-extrabold tracking-tight text-gray-900">Contactos</h1>
            <p className="text-xs text-gray-400 font-medium mt-0.5">{threadList.length} conversas · {total} mensagens</p>
          </div>

          {loadingContacts ? (
            <div className="flex-1 p-4 space-y-3">
              {Array.from({length:4}).map((_,i) => <div key={i} className="h-16 bg-gray-50 rounded-xl animate-pulse" />)}
            </div>
          ) : threadList.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <MessageSquare size={32} className="text-gray-200 mb-3" />
              <div className="text-gray-300 font-bold text-sm">Ainda não recebeste contactos</div>
            </div>
          ) : (
            <div className="flex-1 overflow-auto">
              {threadList.map(thread => {
                const lastMsg = thread.messages[thread.messages.length - 1]
                const isSelected = selectedThread?.email === thread.email
                const unread = thread.messages.length
                return (
                  <button key={thread.email} onClick={() => setSelectedThread(thread)}
                    className={`w-full text-left p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors ${isSelected ? 'bg-blue-50 border-l-2 border-blue-500' : ''}`}>
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 font-extrabold text-sm flex-shrink-0">
                        {thread.name?.[0]?.toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-0.5">
                          <div className="text-sm font-bold text-gray-900">{thread.name}</div>
                          <div className="text-xs text-gray-400">{new Date(lastMsg.createdAt).toLocaleDateString('pt-PT')}</div>
                        </div>
                        <div className="text-xs text-gray-400 font-medium truncate">{thread.email}</div>
                        <div className="flex justify-between items-center mt-1">
                          <div className="text-xs text-gray-500 truncate flex-1">{lastMsg.message}</div>
                          {unread > 1 && (
                            <span className="ml-2 text-xs font-bold bg-blue-500 text-white px-1.5 py-0.5 rounded-full flex-shrink-0">{unread}</span>
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
        <div className="flex-1 flex flex-col">
          {!selectedThread ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <MessageSquare size={48} className="text-gray-200 mb-4" />
              <div className="text-gray-300 font-bold text-lg">Seleciona uma conversa</div>
            </div>
          ) : (
            <>
              {/* Header da thread */}
              <div className="px-6 py-4 border-b border-gray-100 bg-white flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-500 font-extrabold">
                    {selectedThread.name?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <div className="text-base font-extrabold text-gray-900">{selectedThread.name}</div>
                    <a href={`mailto:${selectedThread.email}`} className="text-sm text-blue-500 font-medium hover:text-blue-600">{selectedThread.email}</a>
                  </div>
                </div>
                <a href={`mailto:${selectedThread.email}?subject=Re: nauu.art`}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-500 hover:border-blue-300 hover:text-blue-500 font-bold text-sm rounded-xl transition-colors">
                  <Mail size={14} /> Responder por email
                </a>
              </div>

              {/* Mensagens da thread */}
              <div className="flex-1 overflow-auto p-6 flex flex-col gap-4">
                {selectedThread.messages
                  .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
                  .map((msg, i) => (
                  <div key={msg.id} className="bg-white border border-gray-100 rounded-xl p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 font-extrabold text-xs">
                          {msg.name?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <span className="text-sm font-bold text-gray-900">{msg.name}</span>
                          <span className="text-xs text-gray-400 ml-2 font-medium">
                            {new Date(msg.createdAt).toLocaleDateString('pt-PT', { day:'numeric', month:'long', year:'numeric', hour:'2-digit', minute:'2-digit' })}
                          </span>
                        </div>
                      </div>
                      {msg.artwork && (
                        <Link href={`/artwork/${msg.artworkId}`}
                          className="flex items-center gap-1 text-xs text-blue-500 font-semibold hover:text-blue-600">
                          📎 {msg.artwork.title} <ExternalLink size={10} />
                        </Link>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 font-medium leading-relaxed whitespace-pre-wrap pl-9">{msg.message}</p>
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
