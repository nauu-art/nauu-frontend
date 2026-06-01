'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../../context/AuthContext'
import api from '../../../lib/api'
import Link from 'next/link'
import { Users, Image, ShoppingCart, Heart, MessageSquare, TrendingUp, Eye, UserCheck } from 'lucide-react'

export default function AdminAnalyticsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [data, setData] = useState(null)
  const [loadingData, setLoadingData] = useState(true)

  useEffect(() => {
    if (!loading && user?.accountType !== 'ADMIN') router.push('/')
    if (user?.accountType === 'ADMIN') {
      api.get('/analytics').then(res => setData(res.data)).catch(() => {}).finally(() => setLoadingData(false))
    }
  }, [loading, user])

  const metrics = data ? [
    { label: 'Utilizadores total', value: data.users.total, sub: `+${data.users.newWeek} esta semana`, icon: Users, color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: 'Novos este mês', value: data.users.newMonth, sub: `${data.users.newWeek} últimos 7 dias`, icon: TrendingUp, color: 'text-green-500', bg: 'bg-green-50' },
    { label: 'Artistas aprovados', value: data.artists.approved, sub: `${data.artists.total} total`, icon: UserCheck, color: 'text-purple-500', bg: 'bg-purple-50' },
    { label: 'Obras publicadas', value: data.artworks.total, sub: `${data.artworks.totalViews.toLocaleString()} visitas`, icon: Image, color: 'text-amber-500', bg: 'bg-amber-50' },
    { label: 'Encomendas pagas', value: data.orders.paid, sub: `€${parseFloat(data.orders.revenue).toFixed(2)} receita`, icon: ShoppingCart, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { label: 'Likes em obras', value: data.engagement.likes, sub: `${data.engagement.comments} comentários`, icon: Heart, color: 'text-red-500', bg: 'bg-red-50' },
    { label: 'Conversas', value: data.engagement.conversations, sub: `${data.engagement.messages} mensagens`, icon: MessageSquare, color: 'text-indigo-500', bg: 'bg-indigo-50' },
    { label: 'Seguidores (artistas)', value: data.engagement.follows, sub: 'total de follows', icon: Eye, color: 'text-cyan-500', bg: 'bg-cyan-50' },
  ] : []

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">Analytics</h1>
            <p className="text-sm text-gray-400 mt-0.5">Métricas gerais da plataforma</p>
          </div>
          <Link href="/admin" className="px-4 py-2 border border-gray-200 text-gray-500 font-bold text-sm rounded-xl hover:border-gray-300">
            ← Admin
          </Link>
        </div>

        {loadingData ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({length:8}).map((_,i) => <div key={i} className="h-24 bg-white rounded-xl animate-pulse" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {metrics.map(m => (
              <div key={m.label} className="bg-white border border-gray-100 rounded-2xl p-5">
                <div className="flex justify-between items-start mb-3">
                  <div className="text-xs font-bold uppercase tracking-widest text-gray-300 leading-tight">{m.label}</div>
                  <div className={`w-8 h-8 ${m.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                    <m.icon size={14} className={m.color} />
                  </div>
                </div>
                <div className="text-2xl font-extrabold text-gray-900">{typeof m.value === 'number' ? m.value.toLocaleString('pt-PT') : m.value}</div>
                <div className="text-xs text-gray-400 font-medium mt-1">{m.sub}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
