'use client'
import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { MessageSquare } from 'lucide-react'
import api from '../../lib/api'
import { useAuth } from '../../context/AuthContext'
import ConversationView from './ConversationView'

export default function MessagesInbox({ basePath = '/account/messages', selectedId = null }) {
  const { user } = useAuth()
  const router = useRouter()
  const [conversations, setConversations] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/messages').then(res => setConversations(res.data || [])).catch(() => {}).finally(() => setLoading(false))
    const interval = setInterval(() => {
      api.get('/messages').then(res => setConversations(res.data || [])).catch(() => {})
    }, 15000)
    return () => clearInterval(interval)
  }, [])

  const timeAgo = (date) => {
    if (!date) return ''
    const diff = Date.now() - new Date(date).getTime()
    const mins = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)
    if (mins < 1) return 'agora'
    if (mins < 60) return `${mins}m`
    if (hours < 24) return `${hours}h`
    return `${days}d`
  }

  return (
    <div className="flex h-full">
      {/* Lista */}
      <div className={`${selectedId ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-80 border-r border-gray-100 bg-white flex-shrink-0`}>
        <div className="px-5 py-4 border-b border-gray-100">
          <h1 className="text-lg font-extrabold tracking-tight">Mensagens</h1>
          <p className="text-xs text-gray-400 font-medium mt-0.5">{conversations.length} conversas</p>
        </div>
        {loading ? (
          <div className="p-4 space-y-3">{Array.from({length:4}).map((_,i) => <div key={i} className="h-16 bg-gray-50 rounded-xl animate-pulse" />)}</div>
        ) : conversations.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <MessageSquare size={32} className="text-gray-200 mb-3" />
            <div className="text-gray-300 font-bold text-sm">Sem mensagens ainda</div>
          </div>
        ) : (
          <div className="flex-1 overflow-auto">
            {conversations.map(c => {
              const other = c.participants?.find(p => p.userId !== user?.id)
              const otherName = other?.user?.artistProfile?.artistName || other?.user?.name || 'Utilizador'
              const otherAvatar = other?.user?.avatarUrl
              const isSelected = c.id === selectedId
              return (
                <Link key={c.id} href={`${basePath}/${c.id}`}
                  className={`flex items-start gap-3 px-4 py-3.5 border-b border-gray-50 hover:bg-gray-50 transition-colors ${isSelected ? 'bg-blue-50 border-l-2 border-blue-500' : ''}`}>
                  <div className="w-10 h-10 rounded-full bg-blue-100 overflow-hidden flex items-center justify-center text-blue-500 font-extrabold text-sm flex-shrink-0">
                    {otherAvatar ? <img src={otherAvatar} className="w-full h-full object-cover" alt="" /> : otherName?.[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-0.5">
                      <div className="text-sm font-bold text-gray-900 truncate">{otherName}</div>
                      <div className="text-xs text-gray-400 flex-shrink-0 ml-2">{timeAgo(c.lastMessageAt)}</div>
                    </div>
                    {c.artwork && <div className="text-xs text-blue-400 font-medium truncate mb-0.5">📎 {c.artwork.title}</div>}
                    <div className="flex justify-between items-center">
                      <div className="text-xs text-gray-400 truncate flex-1">{c.lastMessagePreview || '…'}</div>
                      {c.myUnread > 0 && (
                        <span className="ml-2 w-5 h-5 bg-blue-500 text-white text-xs font-extrabold rounded-full flex items-center justify-center flex-shrink-0">{c.myUnread}</span>
                      )}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>

      {/* Conversa */}
      <div className={`${selectedId ? 'flex' : 'hidden md:flex'} flex-1 flex-col`}>
        {selectedId ? (
          <ConversationView
            conversationId={selectedId}
            onBack={() => router.push(basePath)}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <MessageSquare size={48} className="text-gray-200 mb-4" />
            <div className="text-gray-300 font-bold">Seleciona uma conversa</div>
          </div>
        )}
      </div>
    </div>
  )
}
