'use client'
import { useState, useEffect, useRef } from 'react'
import { Bell } from 'lucide-react'
import Link from 'next/link'
import api from '../../lib/api'
import { useAuth } from '../../context/AuthContext'

export default function NotificationBell() {
  const { isLoggedIn } = useAuth()
  const [unread, setUnread] = useState(0)
  const [notifications, setNotifications] = useState([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!isLoggedIn) return
    fetchUnread()
    const interval = setInterval(fetchUnread, 30000)
    return () => clearInterval(interval)
  }, [isLoggedIn])

  useEffect(() => {
    const handleClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const fetchUnread = async () => {
    try {
      const res = await api.get('/notifications')
      setUnread(res.data.unread || 0)
      setNotifications(res.data.notifications || [])
    } catch {}
  }

  const handleOpen = async () => {
    setOpen(!open)
    if (!open && unread > 0) {
      try {
        await api.put('/notifications/read')
        setUnread(0)
        setNotifications(prev => prev.map(n => ({ ...n, read: true })))
      } catch {}
    }
  }

  if (!isLoggedIn) return null

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
  NEW_MESSAGE: '💬',
  SHIPPING: '📦',
  }

  const timeAgo = (date) => {
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
    <div className="relative" ref={ref}>
      <button onClick={handleOpen} className="relative p-2 text-gray-500 hover:text-gray-900 transition-colors">
        <Bell size={20} strokeWidth={1.8} />
        {unread > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-blue-500 text-white text-xs font-extrabold rounded-full flex items-center justify-center leading-none">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-11 w-80 bg-white border border-gray-100 rounded-2xl shadow-xl z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <div className="text-sm font-extrabold text-gray-900">Notificações</div>
            <Link href="/account/notifications" onClick={() => setOpen(false)}
              className="text-xs font-bold text-blue-500 hover:text-blue-600">Ver todas</Link>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="text-center py-8 text-gray-300 font-bold text-sm">Sem notificações</div>
            ) : notifications.slice(0, 8).map(n => (
              <Link key={n.id} href={n.link || '#'} onClick={() => setOpen(false)}
                className={`flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 ${!n.read ? 'bg-blue-50/50' : ''}`}>
                <span className="text-lg flex-shrink-0 mt-0.5">{icons[n.type] || '🔔'}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-700 leading-snug">{n.message}</p>
                  <span className="text-xs text-gray-400 font-medium">{timeAgo(n.createdAt)}</span>
                </div>
                {!n.read && <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1.5" />}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
