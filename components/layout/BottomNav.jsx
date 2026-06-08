'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Rss, Search, Users, Anchor } from 'lucide-react'

export default function BottomNav() {
  const pathname = usePathname()

  if (pathname.startsWith('/dashboard') || pathname.startsWith('/admin') || pathname.startsWith('/account')) return null

  const items = [
    { key: 'feed', href: '/feed', icon: Rss, label: 'Feed' },
    { key: 'explore', href: '/explore', icon: Search, label: 'Explorar' },
    { key: 'artists', href: '/artists', icon: Users, label: 'Artistas' },
    { key: 'anchors', href: '/anchors', icon: Anchor, label: 'Âncoras' },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white border-t border-gray-100"
      style={{paddingBottom: 'env(safe-area-inset-bottom, 0px)'}}>
      <div className="flex items-center justify-around px-2 py-2">
        {items.map(item => {
          const active = pathname === item.href || (pathname.startsWith(item.href + '/') && item.href !== '/')
          return (
            <Link key={item.key} href={item.href}
              className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-colors">
              <item.icon size={22} strokeWidth={active ? 2.5 : 1.8} className={active ? 'text-blue-500' : 'text-gray-400'} />
              <span className={`text-xs font-semibold ${active ? 'text-blue-500' : 'text-gray-400'}`}>{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
