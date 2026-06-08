'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Search, LayoutDashboard, Anchor, User, LogOut, Menu, X, ChevronDown, Shield } from 'lucide-react'
import NotificationBell from '../ui/NotificationBell'
import { useAuth } from '../../context/AuthContext'
import { useLocale } from '../../context/LocaleContext'

const S = {
  drawer: { position:'fixed', top:0, right:0, bottom:0, width:'280px', backgroundColor:'#111111', display:'flex', flexDirection:'column', boxShadow:'-4px 0 24px rgba(0,0,0,0.4)', zIndex:60 },
  header: { display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px 20px', borderBottom:'1px solid #2c2c2e', flexShrink:0 },
  search: { padding:'12px 16px', borderBottom:'1px solid #2c2c2e', flexShrink:0 },
  searchInner: { display:'flex', alignItems:'center', gap:'8px', border:'1px solid #2c2c2e', borderRadius:'12px', padding:'10px 12px', backgroundColor:'#1c1c1e' },
  searchInput: { background:'transparent', outline:'none', fontSize:'14px', width:'100%', color:'#f5f5f5', fontFamily:'inherit' },
  userInfo: { padding:'12px 20px', borderBottom:'1px solid #2c2c2e', display:'flex', alignItems:'center', gap:'12px', flexShrink:0 },
  avatar: { width:'40px', height:'40px', borderRadius:'50%', backgroundColor:'#60a5fa', overflow:'hidden', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontWeight:'800', fontSize:'16px', flexShrink:0 },
  nav: { flex:1, padding:'8px', overflowY:'auto', backgroundColor:'#111111', minHeight:0 },
  navItem: { display:'flex', alignItems:'center', gap:'12px', padding:'10px 12px', borderRadius:'12px', fontSize:'14px', fontWeight:'600', color:'#d4d4d8', marginBottom:'2px', textDecoration:'none', cursor:'pointer', backgroundColor:'transparent', border:'none', width:'100%', textAlign:'left' },
  divider: { borderTop:'1px solid #2c2c2e', margin:'8px 0' },
  footer: { padding:'12px', borderTop:'1px solid #2c2c2e', backgroundColor:'#111111', flexShrink:0 },
  logoutBtn: { display:'flex', alignItems:'center', gap:'12px', padding:'10px 12px', borderRadius:'12px', fontSize:'14px', fontWeight:'600', color:'#f87171', width:'100%', background:'none', border:'none', cursor:'pointer', textAlign:'left' },
}

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

  const dashHref = isArtist ? '/dashboard' : '/account/profile'
  const profileHref = isArtist ? `/${user?.artistProfile?.username || user?.username}` : `/u/${user?.username}`

  const navLinks = [
    { href: '/feed', label: 'Feed' },
    { href: '/explore', label: t('nav.explore') },
    { href: '/artists', label: t('nav.artists') },
    { href: '/anchors', label: 'Âncoras', Icon: Anchor },
  ]

  return (
    <>
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
            <div className="flex items-center gap-1">
              <NotificationBell />
              <div className="relative">
                <button onClick={() => setMenuOpen(!menuOpen)} className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-full bg-blue-400 flex items-center justify-center text-white text-sm font-extrabold overflow-hidden border-2 border-white shadow-sm">
                    {user?.avatarUrl ? <img src={user.avatarUrl} className="w-full h-full object-cover" alt={user.name} /> : <span>{user?.name?.[0]}</span>}
                  </div>
                  <ChevronDown size={14} className="text-gray-400" />
                </button>
                {menuOpen && (
                  <div className="absolute right-0 top-11 w-48 bg-white border border-gray-100 rounded-xl shadow-lg py-1.5 z-[60]">
                    <Link href={dashHref} onClick={() => setMenuOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50"><LayoutDashboard size={15} /> Dashboard</Link>
                    <Link href="/anchors" onClick={() => setMenuOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50"><Anchor size={15} /> Âncoras</Link>
                    {user?.username && <Link href={profileHref} onClick={() => setMenuOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50"><User size={15} /> Ver perfil</Link>}
                    {user?.accountType === 'ADMIN' && <Link href="/admin" onClick={() => setMenuOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-purple-600 hover:bg-purple-50"><Shield size={15} /> Admin</Link>}
                    <hr className="my-1 border-gray-100" />
                    <button onClick={() => { logout(); setMenuOpen(false); router.push('/') }} className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-red-400 hover:bg-red-50 w-full text-left"><LogOut size={15} /> {t('nav.logout')}</button>
                  </div>
                )}
              </div>
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
          {isLoggedIn ? (
            <>
              <NotificationBell />
              <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 text-gray-500">
                <Menu size={22} />
              </button>
            </>
          ) : (
            <Link href="/login" className="px-4 py-2 bg-blue-500 text-white text-sm font-bold rounded-xl">
              {t('nav.login')}
            </Link>
          )}
        </div>
      </nav>


    </header>

    {/* Mobile drawer — fora do header */}
      {mobileOpen && isLoggedIn && (
        <>
          {/* Overlay */}
          <div onClick={() => setMobileOpen(false)}
            style={{position:'fixed',inset:0,backgroundColor:'rgba(0,0,0,0.4)',zIndex:59}} />

          {/* Drawer */}
          <div style={S.drawer} data-theme="dark-drawer">
            {/* Header */}
            <div style={S.header}>
              <Link href="/" onClick={() => setMobileOpen(false)}>
                <img src="/logo.svg" alt="nauu.art" style={{height:'28px',width:'auto',filter:'invert(1) brightness(2)'}} />
              </Link>
              <button onClick={() => setMobileOpen(false)} style={{padding:'6px',color:'#6b7280',background:'none',border:'none',cursor:'pointer'}}>
                <X size={20} color="#6b7280" />
              </button>
            </div>

            {/* Search */}
            <div style={S.search}>
              <form onSubmit={handleSearch} style={S.searchInner}>
                <Search size={14} color="#d1d5db" />
                <input value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Pesquisar obras…" style={S.searchInput} />
              </form>
            </div>

            {/* User */}
            <div style={S.userInfo}>
              <div style={S.avatar}>
                {user?.avatarUrl
                  ? <img src={user.avatarUrl} style={{width:'100%',height:'100%',objectFit:'cover'}} alt="" />
                  : <span>{user?.name?.[0]}</span>}
              </div>
              <div>
                <div style={{fontSize:'14px',fontWeight:'800',color:'#f5f5f5'}}>{user?.name}</div>
                <div style={{fontSize:'12px',color:'#9ca3af'}}>{isArtist ? 'Artista' : 'Utilizador'}</div>
              </div>
            </div>

            {/* Nav */}
            <div style={S.nav}>
              {navLinks.map(item => (
                <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)} style={S.navItem}>
                  {item.Icon && <item.Icon size={16} color="#9ca3af" />}
                  <span style={{color:'#d4d4d8'}}>{item.label}</span>
                </Link>
              ))}

              <div style={S.divider} />

              <Link href={dashHref} onClick={() => setMobileOpen(false)} style={S.navItem}>
                <LayoutDashboard size={16} color="#6b7280" />
                <span style={{color:'#d4d4d8'}}>Dashboard</span>
              </Link>

              {user?.username && (
                <Link href={profileHref} onClick={() => setMobileOpen(false)} style={S.navItem}>
                  <User size={16} color="#9ca3af" />
                  <span style={{color:'#374151'}}>Ver perfil público</span>
                </Link>
              )}

              {user?.accountType === 'ADMIN' && (
                <Link href="/admin" onClick={() => setMobileOpen(false)} style={{...S.navItem, color:'#7c3aed'}}>
                  <Shield size={16} color="#7c3aed" />
                  <span style={{color:'#7c3aed'}}>Admin</span>
                </Link>
              )}
            </div>

            {/* Footer */}
            <div style={S.footer}>
              <button onClick={() => { logout(); setMobileOpen(false); router.push('/') }} style={S.logoutBtn}>
                <LogOut size={16} color="#f87171" />
                <span>{t('nav.logout')}</span>
              </button>
            </div>
          </div>
        </>
      )}
    </>
  )
}