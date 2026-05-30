'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Bell } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import api from '../../lib/api'

export default function NotificationBell() {
  const { isLoggedIn, isArtist } = useAuth()
  const [count, setCount] = useState(0)
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState([])

  useEffect(() => {
    if (!isLoggedIn || !isArtist) return
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 60000) // refresh cada minuto
    return () => clearInterval(interval)
  }, [isLoggedIn, isArtist])

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/contact/received?limit=5')
      const contacts = res.data.data || []
      // Contar mensagens das últimas 24h
      const recent = contacts.filter(c => {
        const diff = Date.now() - new Date(c.createdAt).getTime()
        return diff < 24 * 60 * 60 * 1000
      })
      setCount(recent.length)
      setNotifications(contacts.slice(0, 5))
    } catch {}
  }

  if (!isLoggedIn || !isArtist) return null

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)}
        className="relative w-9 h-9 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
        <Bell size={18} />
        {count > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-xs font-extrabold rounded-full flex items-center justify-center">
            {count > 9 ? '9+' : count}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-11 w-72 bg-white border border-gray-100 rounded-xl shadow-xl z-50 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center">
              <span className="text-sm font-extrabold text-gray-900">Notificações</span>
              {count > 0 && <span className="text-xs font-bold text-red-500">{count} novas</span>}
            </div>
            {notifications.length === 0 ? (
              <div className="px-4 py-6 text-center text-sm text-gray-300 font-bold">Sem notificações</div>
            ) : (
              <div>
                {notifications.map(n => {
                  const isNew = Date.now() - new Date(n.createdAt).getTime() < 24 * 60 * 60 * 1000
                  return (
                    <Link key={n.id} href="/dashboard/contacts" onClick={() => setOpen(false)}
                      className={`flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 ${isNew ? 'bg-blue-50/50' : ''}`}>
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-500 font-extrabold text-xs flex-shrink-0">
                        {n.name?.[0]?.toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-gray-900">{n.name}</span>
                          {isNew && <span className="w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0"></span>}
                        </div>
                        {n.artwork && <div className="text-xs text-blue-400 font-semibold">📎 {n.artwork.title}</div>}
                        <div className="text-xs text-gray-400 truncate">{n.message}</div>
                        <div className="text-xs text-gray-300 mt-0.5">{new Date(n.createdAt).toLocaleDateString('pt-PT')}</div>
                      </div>
                    </Link>
                  )
                })}
                <Link href="/dashboard/contacts" onClick={() => setOpen(false)}
                  className="block px-4 py-2.5 text-center text-xs font-bold text-blue-500 hover:bg-gray-50 transition-colors border-t border-gray-100">
                  Ver todas as mensagens →
                </Link>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
