'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '../../context/AuthContext'
import { User, Heart, Mail, Bell, Package, FolderHeart, FileText, LogOut, LayoutDashboard } from 'lucide-react'

export default function AccountNav() {
  const pathname = usePathname()
  const { logout, isArtist } = useAuth()

  const items = [
    { href: '/account/profile', icon: User, label: 'Perfil' },
    { href: '/account/orders', icon: Package, label: 'As minhas compras' },
    { href: '/account/favorites', icon: Heart, label: 'Favoritos' },
    { href: '/account/collections', icon: FolderHeart, label: 'Coleções' },
    { href: '/account/messages', icon: Mail, label: 'Mensagens' },
    { href: '/account/notifications', icon: Bell, label: 'Notificações' },
    { href: '/account/contacts', icon: FileText, label: 'Contactos enviados' },
  ]

  return (
    <div className="w-full md:w-56 flex-shrink-0">
      {/* Mobile — tabs horizontais */}
      <div className="flex md:hidden overflow-x-auto gap-1 pb-2 mb-4 scrollbar-hide">
        {items.map(item => (
          <Link key={item.href} href={item.href}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-colors flex-shrink-0 ${pathname === item.href ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-500'}`}>
            <item.icon size={13} />
            {item.label}
          </Link>
        ))}
      </div>

      {/* Desktop — sidebar */}
      <div className="hidden md:flex flex-col gap-0.5">
        {items.map(item => (
          <Link key={item.href} href={item.href}
            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${pathname === item.href ? 'bg-blue-50 text-blue-600 font-bold' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'}`}>
            <item.icon size={15} />
            {item.label}
          </Link>
        ))}
        {isArtist && (
          <>
            <div className="border-t border-gray-100 my-2" />
            <Link href="/dashboard"
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold text-purple-500 hover:bg-purple-50 transition-colors">
              <LayoutDashboard size={15} />
              Dashboard artista
            </Link>
          </>
        )}
        <div className="border-t border-gray-100 my-2" />
        <button onClick={logout}
          className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold text-red-400 hover:bg-red-50 transition-colors w-full text-left">
          <LogOut size={15} />
          Sair
        </button>
      </div>
    </div>
  )
}
