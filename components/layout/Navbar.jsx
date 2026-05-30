'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Search, LayoutDashboard, Heart, User, LogOut, Menu, X , ChevronDown } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useLocale } from '../../context/LocaleContext'


export default function Navbar() {
  const { user, isLoggedIn, isArtist, logout } = useAuth()
  const { t } = useLocale()
  const [search, setSearch] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const router = useRouter()

  const handleSearch = (e) => {
    e.preventDefault()
    if (search.trim()) { router.push(`/explore?search=${encodeURIComponent(search.trim())}`); setMobileOpen(false) }
  }

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100">
      <nav className="flex justify-between items-center px-5 md:px-10 py-3.5">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex-shrink-0"><img src="/logo.svg" alt="nauu.art" className="h-8 w-auto block" /></Link>
          <div className="hidden md:flex gap-8 text-sm font-medium text-gray-400">
            <Link href="/explore" className="hover:text-gray-900 transition-colors">{t('nav.explore')}</Link>
            <Link href="/artists" className="hover:text-gray-900 transition-colors">{t('nav.artists')}</Link>
            <Link href="/feed" className="hover:text-gray-900 transition-colors">Feed</Link>
          </div>
        </div>

        {/* Desktop right */}
        <div className="hidden md:flex items-center gap-3">
          <form onSubmit={handleSearch} className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 bg-gray-50">
            <Search size={14} className="text-gray-300" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t('nav.search')}
              className="bg-transparent outline-none text-sm w-44 font-medium placeholder:text-gray-300" />
          </form>
          {isLoggedIn ? (
            <div className="relative">
              <button onClick={() => setMenuOpen(!menuOpen)} className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-full bg-blue-400 flex items-center justify-center text-white text-sm font-extrabold overflow-hidden border-2 border-white shadow-sm">
                  {user?.avatarUrl
                    ? <img src={user.avatarUrl} className="w-full h-full object-cover" alt={user.name} />
                    : <span>{user?.name?.[0]}</span>}
                </div>
                <ChevronDown size={14} className="text-gray-400" />
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-11 w-48 bg-white border border-gray-100 rounded-xl shadow-lg py-1.5 z-50">
                  {isArtist && <Link href="/dashboard" onClick={() => setMenuOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50"><LayoutDashboard size={15} /> {t('nav.dashboard')}</Link>}
                  <Link href="/account/favorites" onClick={() => setMenuOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50"><Heart size={15} /> {t('nav.favorites')}</Link>
                  <Link href="/account/profile" onClick={() => setMenuOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50"><User size={15} /> {t('nav.profile')}</Link>
                  <hr className="my-1 border-gray-100" />
                  <button onClick={() => { logout(); setMenuOpen(false); router.push('/') }} className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-red-400 hover:bg-red-50 w-full text-left"><LogOut size={15} /> {t('nav.logout')}</button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link href="/login" className="text-sm font-bold text-gray-500 px-3 py-2 hover:text-gray-900">{t('nav.login')}</Link>
              <Link href="/register" className="btn-primary">{t('nav.register')}</Link>
            </>
          )}
        </div>

        {/* Mobile right */}
        <div className="flex md:hidden items-center gap-2">
          {isLoggedIn && (
            <div className="w-9 h-9 rounded-full bg-blue-400 flex items-center justify-center text-white text-sm font-extrabold overflow-hidden border-2 border-white shadow-sm">
              {user?.avatarUrl
                ? <img src={user.avatarUrl} className="w-full h-full object-cover" alt={user?.name} />
                : <span>{user?.name?.[0]}</span>}
            </div>
          )}
          <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 text-gray-600">
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      {/* Menu mobile */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-5 py-4 flex flex-col gap-3">
          <form onSubmit={handleSearch} className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2.5 bg-gray-50">
            <Search size={14} className="text-gray-300" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Pesquisar…"
              className="bg-transparent outline-none text-sm w-full font-medium placeholder:text-gray-300" />
          </form>
          <Link href="/explore" onClick={() => setMobileOpen(false)} className="text-sm font-bold text-gray-700 py-2 border-b border-gray-50">Explorar</Link>
          <Link href="/artists" onClick={() => setMobileOpen(false)} className="text-sm font-bold text-gray-700 py-2 border-b border-gray-50">Artistas</Link>
          {isLoggedIn ? (
            <>
              {isArtist && <Link href="/dashboard" onClick={() => setMobileOpen(false)} className="text-sm font-bold text-gray-700 py-2 border-b border-gray-50">Dashboard</Link>}
              <Link href="/account/favorites" onClick={() => setMobileOpen(false)} className="text-sm font-bold text-gray-700 py-2 border-b border-gray-50">Favoritos</Link>
              <button onClick={() => { logout(); setMobileOpen(false); router.push('/') }} className="text-sm font-bold text-red-400 py-2 text-left">Sair</button>
            </>
          ) : (
            <div className="flex gap-3 pt-1">
              <Link href="/login" onClick={() => setMobileOpen(false)} className="flex-1 text-center py-2.5 border border-gray-200 text-sm font-bold text-gray-600 rounded-xl">Entrar</Link>
              <Link href="/register" onClick={() => setMobileOpen(false)} className="flex-1 text-center py-2.5 bg-blue-500 text-sm font-bold text-white rounded-xl">Registar</Link>
            </div>
          )}

        </div>
      )}
    </header>
  )
}
