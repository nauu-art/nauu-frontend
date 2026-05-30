'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, Image, Mail, User, LogOut, FileText } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export default function DashboardNav() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/artworks', label: 'As minhas obras', icon: Image },
    { href: '/dashboard/posts', label: 'Posts', icon: FileText },
    { href: '/dashboard/contacts', label: 'Contactos', icon: Mail },
    { href: '/dashboard/profile', label: 'Editar perfil', icon: User },
  ]

  return (
    <aside className="w-56 bg-white border-r border-gray-100 flex flex-col flex-shrink-0">
      <div className="p-5 border-b border-gray-100">
        <Link href="/"><img src="/logo.svg" alt="nauu.art" className="h-7 w-auto" /></Link>
      </div>
      <div className="p-3 border-b border-gray-100 flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-500 font-extrabold text-sm flex-shrink-0 overflow-hidden">
          {user?.avatarUrl
            ? <img src={user.avatarUrl} className="w-full h-full object-cover" alt="" />
            : user?.name?.[0]}
        </div>
        <div>
          <div className="text-sm font-bold text-gray-900 leading-tight truncate">{user?.name}</div>
          <div className="text-xs text-gray-400 font-medium">Artista</div>
        </div>
      </div>
      <nav className="flex-1 p-2">
        {navItems.map(item => {
          const active = item.href === '/dashboard'
            ? pathname === '/dashboard'
            : pathname.startsWith(item.href)
          return (
            <Link key={item.href} href={item.href}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all mb-0.5 ${active ? 'bg-blue-50 text-blue-600 border-l-2 border-blue-500' : 'text-gray-500 hover:bg-gray-50'}`}>
              <item.icon size={16} />
              {item.label}
            </Link>
          )
        })}
      </nav>
      <div className="p-3 border-t border-gray-100">
        <button onClick={() => { logout(); router.push('/') }}
          className="flex items-center gap-2.5 px-3 py-2 text-sm font-semibold text-red-400 hover:bg-red-50 rounded-lg w-full">
          <LogOut size={15} /> Sair
        </button>
      </div>
    </aside>
  )
}
