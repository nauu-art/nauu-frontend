'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, Image, Mail, User, LogOut, FileText, Menu, X, FolderOpen, MessageSquare, CreditCard } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'

export default function DashboardNav() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/artworks', label: 'As minhas obras', icon: Image },
    { href: '/dashboard/posts', label: 'Posts', icon: FileText },
    { href: '/dashboard/collections', label: 'Coleções', icon: FolderOpen },
    { href: '/dashboard/messages', label: 'Mensagens', icon: MessageSquare },
    { href: '/dashboard/payments', label: 'Pagamentos', icon: CreditCard },
    { href: '/dashboard/payments', label: 'Pagamentos', icon: CreditCard },
    { href: '/dashboard/contacts', label: 'Contactos', icon: Mail },
    { href: '/dashboard/profile', label: 'Perfil', icon: User },
  ]

  const isActive = (href) => href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(href)

  return (
    <>
      {/* ── Desktop sidebar ── */}
      <aside className="hidden md:flex w-56 bg-white border-r border-gray-100 flex-col flex-shrink-0 sticky top-0 h-screen">
        <div className="p-5 border-b border-gray-100">
          <Link href="/"><img src="/logo.svg" alt="nauu.art" className="h-7 w-auto" /></Link>
        </div>
        <div className="p-3 border-b border-gray-100 flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-500 font-extrabold text-sm flex-shrink-0 overflow-hidden">
            {user?.avatarUrl ? <img src={user.avatarUrl} className="w-full h-full object-cover" alt="" /> : user?.name?.[0]}
          </div>
          <div className="min-w-0">
            <div className="text-sm font-bold text-gray-900 leading-tight truncate">{user?.name}</div>
            <div className="text-xs text-gray-400 font-medium">Artista</div>
          </div>
        </div>
        <nav className="flex-1 p-2 overflow-y-auto">
          {navItems.map(item => (
            <Link key={item.href} href={item.href}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all mb-0.5 ${isActive(item.href) ? 'bg-blue-50 text-blue-600 border-l-2 border-blue-500' : 'text-gray-500 hover:bg-gray-50'}`}>
              <item.icon size={16} />{item.label}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-gray-100">
          <button onClick={() => { logout(); router.push('/') }}
            className="flex items-center gap-2.5 px-3 py-2 text-sm font-semibold text-red-400 hover:bg-red-50 rounded-lg w-full">
            <LogOut size={15} /> Sair
          </button>
        </div>
      </aside>

      {/* ── Mobile top bar (fixed) ── */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-100 flex items-center justify-between px-4 h-14">
        <Link href="/"><img src="/logo.svg" alt="nauu.art" className="h-7 w-auto" /></Link>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-100 overflow-hidden flex items-center justify-center text-blue-500 font-extrabold text-sm flex-shrink-0">
            {user?.avatarUrl ? <img src={user.avatarUrl} className="w-full h-full object-cover" alt="" /> : user?.name?.[0]}
          </div>
          <button onClick={() => setMobileOpen(true)} className="p-1.5 text-gray-600">
            <Menu size={22} />
          </button>
        </div>
      </div>

      {/* ── Mobile drawer ── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <div className="absolute top-0 right-0 bottom-0 w-72 bg-white flex flex-col shadow-xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div>
                <div className="text-sm font-bold text-gray-900">{user?.name}</div>
                <div className="text-xs text-gray-400">Artista</div>
              </div>
              <button onClick={() => setMobileOpen(false)} className="p-1.5 text-gray-400 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>
            <nav className="flex-1 p-3 overflow-y-auto">
              {navItems.map(item => (
                <Link key={item.href} href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all mb-1 ${isActive(item.href) ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}>
                  <item.icon size={18} />{item.label}
                </Link>
              ))}
            </nav>
            <div className="p-4 border-t border-gray-100">
              <button onClick={() => { logout(); router.push('/') }}
                className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-red-400 hover:bg-red-50 rounded-xl w-full">
                <LogOut size={18} /> Sair
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
