'use client'
import { useAuth } from '../../context/AuthContext'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'
import { User, Anchor, Mail, Bell, Package, LogOut, LayoutDashboard, ArrowUpRight } from 'lucide-react'

export default function AccountLayout({ children }) {
  const { user, isLoggedIn, isArtist, loading, logout } = useAuth()
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !isLoggedIn) router.push('/login')
    if (!loading && isLoggedIn && isArtist) router.push('/dashboard')
  }, [loading, isLoggedIn, isArtist])

  const items = [
    { href: '/account/profile', icon: User, label: 'Perfil' },
    { href: '/account/orders', icon: Package, label: 'Compras' },
    { href: '/account/favorites', icon: Anchor, label: 'Âncoras' },
    
    { href: '/account/messages', icon: Mail, label: 'Mensagens' },
    { href: '/account/notifications', icon: Bell, label: 'Notificações' },
  ]

  if (loading || !user) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
    </div>
  )

  return (
    <div className="flex min-h-screen">
      {/* Sidebar — fixed, nunca faz scroll */}
      <div className="hidden md:flex w-52 bg-white border-r border-gray-100 flex-col flex-shrink-0 fixed left-0 top-0 h-full z-20">
        {/* Logo */}
        <div className="px-4 py-4 border-b border-gray-100">
          <Link href="/"><img src="/logo.svg" alt="nauu.art" className="h-7 w-auto" /></Link>
        </div>

        {/* User info */}
        <div className="px-4 py-3 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-blue-400 overflow-hidden flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {user.avatarUrl ? <img src={user.avatarUrl} className="w-full h-full object-cover" alt="" /> : user.name?.[0]}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-extrabold text-gray-900 truncate">{user.name}</div>
              <div className="text-xs text-gray-400 truncate">{isArtist ? 'Artista' : 'Utilizador'}</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-3 px-2">
          {items.map(item => (
            <Link key={item.href} href={item.href}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors mb-0.5 ${pathname === item.href || pathname.startsWith(item.href + '/') ? 'bg-blue-50 text-blue-600 font-bold' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'}`}>
              <item.icon size={15} />
              {item.label}
            </Link>
          ))}


        </nav>

        {/* Footer */}
        <div className="px-2 py-3 border-t border-gray-100 flex flex-col gap-1">
          <Link href="/"
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors">
            <ArrowUpRight size={13} /> Ver site
          </Link>
          <button onClick={() => { logout(); router.push('/') }}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold text-red-400 hover:bg-red-50 transition-colors w-full text-left">
            <LogOut size={15} /> Sair
          </button>
        </div>
      </div>

      {/* Mobile top bar */}
      <div className="md:hidden bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between fixed top-0 left-0 right-0 z-30">
        <Link href="/"><img src="/logo.svg" alt="nauu.art" className="h-6 w-auto" /></Link>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-blue-400 overflow-hidden flex items-center justify-center text-white font-bold text-xs">
            {user.avatarUrl ? <img src={user.avatarUrl} className="w-full h-full object-cover" alt="" /> : user.name?.[0]}
          </div>
        </div>
      </div>

      {/* Mobile bottom nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-30 flex">
        {items.slice(0, 5).map(item => (
          <Link key={item.href} href={item.href}
            className={`flex-1 flex flex-col items-center gap-0.5 py-2 text-xs font-semibold transition-colors ${pathname === item.href ? 'text-blue-500' : 'text-gray-400'}`}>
            <item.icon size={18} />
            <span className="text-xs">{item.label}</span>
          </Link>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 md:ml-52 pt-14 md:pt-0 pb-20 md:pb-0">
        {children}
      </div>
    </div>
  )
}
