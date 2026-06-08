'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '../../context/AuthContext'
import { LayoutDashboard, Image, Mail, User, Eye, Heart, MessageSquare, Plus, LogOut, FileText } from 'lucide-react'
import DashboardNav from '../../components/ui/DashboardNav'
import api from '../../lib/api'

export default function DashboardPage() {
  const { user, isArtist, isLoggedIn, loading, logout } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState(null)
  const [loadingStats, setLoadingStats] = useState(true)

  useEffect(() => {
    if (!loading && !isLoggedIn) router.push('/login')
    if (!loading && !isArtist) router.push('/')
  }, [loading, isLoggedIn, isArtist])

  useEffect(() => {
    if (isArtist) {
      api.get('/artists/dashboard/stats')
        .then(res => setStats(res.data))
        .catch(() => {})
        .finally(() => setLoadingStats(false))
    }
  }, [isArtist])

  if (loading || !user) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
    </div>
  )

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, active: true },
    { href: '/dashboard/artworks', label: 'As minhas obras', icon: Image },
    { href: '/dashboard/contacts', label: 'Contactos', icon: Mail },
    { href: '/dashboard/posts', label: 'Posts', icon: FileText },
    { href: '/dashboard/profile', label: 'Editar perfil', icon: User },
  ]

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidenav */}
      <DashboardNav />

      {/* Main */}
      <div className="flex-1 md:ml-52 p-5 md:p-8 pt-20 md:pt-8">
        <div className="flex justify-between items-center mb-5 gap-3">
          <div>
            <h1 className="text-xl md:text-2xl font-extrabold tracking-tight" style={{letterSpacing:'-0.03em'}}>
              Bom dia, {user.name?.split(' ')[0]}! 👋
            </h1>
            <p className="text-sm text-gray-400 font-medium mt-0.5">{new Date().toLocaleDateString('pt-PT', {weekday:'long', day:'numeric', month:'long', year:'numeric'})}</p>
          </div>
          <Link href="/dashboard/artworks/new"
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-bold text-sm rounded-xl transition-colors">
            <Plus size={16} /> Nova obra
          </Link>
        </div>

        {/* Métricas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Obras publicadas', value: stats?.stats?.totalArtworks ?? '—', icon: Image, color: 'text-blue-500', bg: 'bg-blue-50' },
            { label: 'Visualizações', value: stats?.stats?.totalViews ?? '—', icon: Eye, color: 'text-green-500', bg: 'bg-green-50' },
            { label: 'Favoritos', value: stats?.stats?.totalFavorites ?? '—', icon: Heart, color: 'text-pink-500', bg: 'bg-pink-50' },
            { label: 'Contactos (30 dias)', value: stats?.stats?.recentContacts ?? '—', icon: MessageSquare, color: 'text-amber-500', bg: 'bg-amber-50' },
          ].map(m => (
            <div key={m.label} className="bg-white border border-gray-100 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="text-xs font-bold uppercase tracking-widest text-gray-300">{m.label}</div>
                <div className={`w-8 h-8 ${m.bg} rounded-lg flex items-center justify-center`}>
                  <m.icon size={15} className={m.color} />
                </div>
              </div>
              <div className="text-2xl md:text-3xl font-extrabold tracking-tight text-gray-900">
                {loadingStats ? <div className="h-8 w-12 bg-gray-100 rounded animate-pulse" /> : m.value}
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {/* Top obras */}
          <div className="bg-white border border-gray-100 rounded-xl p-5">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-sm font-extrabold text-gray-900">Obras mais vistas</h2>
              <Link href="/dashboard/artworks" className="text-xs font-bold text-blue-500">Ver todas →</Link>
            </div>
            {loadingStats ? (
              <div className="space-y-3">{Array.from({length:3}).map((_,i) => <div key={i} className="h-12 bg-gray-50 rounded-lg animate-pulse" />)}</div>
            ) : stats?.topArtworks?.length === 0 ? (
              <div className="text-center py-8 text-gray-300 font-bold text-sm">Ainda não tens obras publicadas.</div>
            ) : (
              <div className="flex flex-col gap-2">
                {(stats?.topArtworks || []).map(w => (
                  <Link href={`/artwork/${w.id}`} key={w.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="w-10 h-8 rounded bg-blue-50 flex items-center justify-center text-blue-200 font-extrabold text-sm flex-shrink-0">
                      {w.images?.[0] ? <img src={w.images[0].imageUrl} className="w-full h-full object-cover rounded" /> : w.title?.[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold text-gray-900 truncate">{w.title}</div>
                      <div className="text-xs text-gray-400 font-medium">{w.availability}</div>
                    </div>
                    <div className="flex items-center gap-1 text-xs font-bold text-gray-400">
                      <Eye size={12} /> {w.viewCount}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Contactos recentes */}
          <div className="bg-white border border-gray-100 rounded-xl p-5">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-sm font-extrabold text-gray-900">Contactos recentes</h2>
              <Link href="/dashboard/contacts" className="text-xs font-bold text-blue-500">Ver todos →</Link>
            </div>
            {loadingStats ? (
              <div className="space-y-3">{Array.from({length:3}).map((_,i) => <div key={i} className="h-14 bg-gray-50 rounded-lg animate-pulse" />)}</div>
            ) : stats?.recentContacts?.length === 0 ? (
              <div className="text-center py-8 text-gray-300 font-bold text-sm">Ainda não recebeste contactos.</div>
            ) : (
              <div className="flex flex-col gap-0">
                {(stats?.recentContacts || []).map(c => (
                  <div key={c.id} className="flex gap-3 py-3 border-b border-gray-50 last:border-0">
                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 font-extrabold text-xs flex-shrink-0">
                      {c.name?.[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold text-gray-900">{c.name}</div>
                      {c.artwork && <div className="text-xs text-gray-400 font-medium truncate">Sobre: {c.artwork.title}</div>}
                      <div className="text-xs text-gray-500 mt-1 line-clamp-1">{c.message}</div>
                    </div>
                    <div className="text-xs text-gray-300 font-semibold whitespace-nowrap">
                      {new Date(c.createdAt).toLocaleDateString('pt-PT')}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
