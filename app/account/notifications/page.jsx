'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '../../../context/AuthContext'
import api from '../../../lib/api'
import { Bell } from 'lucide-react'

const icons = {
  NEW_FOLLOWER: '👤',
  NEW_FAVORITE: '❤️',
  NEW_CONTACT: '✉️',
  NEW_ARTWORK: '🖼️',
  NEW_POST: '✍️',
  COLLECTION_ADDED: '🗂️',
  PROFILE_APPROVED: '✅',
  PROFILE_CHANGES: '✏️',
  PROFILE_REJECTED: '❌',
}

export default function NotificationsPage() {
  const { isLoggedIn, loading } = useAuth()
  const router = useRouter()
  const [notifications, setNotifications] = useState([])
  const [loadingN, setLoadingN] = useState(true)

  useEffect(() => {
    if (!loading && !isLoggedIn) router.push('/login')
  }, [loading, isLoggedIn])

  useEffect(() => {
    if (isLoggedIn) {
      api.get('/notifications').then(res => {
        setNotifications(res.data.notifications || [])
        // Marcar todas como lidas
        if (res.data.unread > 0) api.put('/notifications/read').catch(() => {})
      }).catch(() => {}).finally(() => setLoadingN(false))
    }
  }, [isLoggedIn])

  // Agrupar por data
  const grouped = notifications.reduce((acc, n) => {
    const date = new Date(n.createdAt)
    const now = new Date()
    const diffDays = Math.floor((now - date) / 86400000)
    let label
    if (diffDays === 0) label = 'Hoje'
    else if (diffDays === 1) label = 'Ontem'
    else if (diffDays < 7) label = 'Esta semana'
    else if (diffDays < 14) label = 'Semana passada'
    else label = 'Mais antigas'
    if (!acc[label]) acc[label] = []
    acc[label].push(n)
    return acc
  }, {})

  const order = ['Hoje', 'Ontem', 'Esta semana', 'Semana passada', 'Mais antigas']

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-xl mx-auto px-4 py-8 md:py-12">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
            <Bell size={18} className="text-blue-500" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">Notificações</h1>
        </div>

        {loadingN ? (
          <div className="space-y-3">{Array.from({length:5}).map((_,i) => <div key={i} className="h-16 bg-white rounded-xl animate-pulse" />)}</div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
            <div className="text-4xl mb-3">🔔</div>
            <div className="text-gray-300 font-bold text-lg">Sem notificações</div>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {order.filter(label => grouped[label]).map(label => (
              <div key={label}>
                <div className="text-xs font-extrabold uppercase tracking-widest text-gray-300 mb-3 px-1">{label}</div>
                <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
                  {grouped[label].map((n, i) => (
                    <Link key={n.id} href={n.link || '#'}
                      className={`flex items-start gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors ${i > 0 ? 'border-t border-gray-50' : ''} ${!n.read ? 'bg-blue-50/40' : ''}`}>
                      <span className="text-xl flex-shrink-0 mt-0.5">{icons[n.type] || '🔔'}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-700 leading-snug">{n.message}</p>
                        <span className="text-xs text-gray-400 font-medium mt-0.5 block">
                          {new Date(n.createdAt).toLocaleDateString('pt-PT', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      {!n.read && <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2" />}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
