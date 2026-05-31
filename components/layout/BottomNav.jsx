'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '../../context/AuthContext'
import { Home, Search, Heart, User, Rss } from 'lucide-react'

export default function BottomNav() {
  const pathname = usePathname()
  const { isLoggedIn, user } = useAuth()

  // Não mostrar no dashboard/admin
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/admin') || pathname.startsWith('/account')) return null

  const items = [
    { key: 'home', href: '/', icon: Home, label: 'Início' },
    { key: 'explore', href: '/explore', icon: Search, label: 'Explorar' },
    { key: 'feed', href: '/feed', icon: Rss, label: 'Feed' },
    { key: 'favorites', href: isLoggedIn ? '/account/favorites' : '/login', icon: Heart, label: 'Favoritos' },
    { key: 'profile', href: isLoggedIn ? '/account/profile' : '/login', icon: User, label: 'Perfil',
      avatar: isLoggedIn && user?.avatarUrl ? user.avatarUrl : null },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white border-t border-gray-100 safe-area-bottom">
      <div className="flex items-center justify-around px-2 py-2">
        {items.map(item => {
          const active = pathname === item.href
          return (
            <Link key={item.key} href={item.href}
              className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-colors">
              <div className={`relative w-6 h-6 flex items-center justify-center`}>
                {item.avatar ? (
                  <img src={item.avatar} alt="" className={`w-6 h-6 rounded-full object-cover border-2 ${active ? 'border-blue-500' : 'border-transparent'}`} />
                ) : (
                  <item.icon size={22} strokeWidth={active ? 2.5 : 1.8} className={active ? 'text-blue-500' : 'text-gray-400'} />
                )}
              </div>
              <span className={`text-xs font-semibold ${active ? 'text-blue-500' : 'text-gray-400'}`}>{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
