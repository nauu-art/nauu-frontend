'use client'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '../../../context/AuthContext'
import DashboardNav from '../../../components/ui/DashboardNav'
import api from '../../../lib/api'
import toast from 'react-hot-toast'
import { CreditCard, CheckCircle, AlertCircle, ExternalLink, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { Suspense } from 'react'

function PaymentsContent() {
  const { user, isArtist, isLoggedIn, loading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState(null)
  const [loadingStatus, setLoadingStatus] = useState(true)
  const [connecting, setConnecting] = useState(false)
  const [sales, setSales] = useState([])

  useEffect(() => {
    if (!loading && !isLoggedIn) router.push('/login')
    if (!loading && !isArtist) router.push('/')
  }, [loading, isLoggedIn, isArtist])

  useEffect(() => {
    if (isArtist) {
      fetchStatus()
      api.get('/payments/sales').then(res => setSales(res.data || [])).catch(() => {})
    }
  }, [isArtist])

  useEffect(() => {
    if (searchParams.get('success') === 'true') {
      toast.success('Conta Stripe configurada com sucesso!')
      fetchStatus()
    }
    if (searchParams.get('refresh') === 'true') {
      toast.error('Onboarding incompleto. Tenta novamente.')
    }
  }, [searchParams])

  const fetchStatus = async () => {
    setLoadingStatus(true)
    try {
      const res = await api.get('/payments/connect/status')
      setStatus(res.data)
    } catch {}
    setLoadingStatus(false)
  }

  const handleConnect = async () => {
    setConnecting(true)
    try {
      const res = await api.post('/payments/connect/onboard')
      window.location.href = res.data.url
    } catch { toast.error('Erro ao iniciar configuração'); setConnecting(false) }
  }

  const totalRevenue = sales.filter(o => o.status === 'PAID').reduce((sum, o) => sum + parseFloat(o.artistAmount || 0), 0)
  const pendingOrders = sales.filter(o => o.status === 'PENDING').length

  if (loading || !user) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" /></div>

  return (
    <div className="flex min-h-screen bg-gray-50 flex-col md:flex-row">
      <DashboardNav />
      <div className="flex-1 p-4 md:p-8 pt-16 md:pt-8 max-w-3xl">
        <div className="mb-6">
          <h1 className="text-xl md:text-2xl font-extrabold tracking-tight">Pagamentos</h1>
          <p className="text-sm text-gray-400 font-medium mt-0.5">Configura a tua conta para receber pagamentos</p>
        </div>

        {/* Estado Stripe Connect */}
        <div className={`rounded-2xl border p-6 mb-6 ${status?.onboarded ? 'bg-green-50 border-green-200' : 'bg-white border-gray-100'}`}>
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${status?.onboarded ? 'bg-green-100' : 'bg-blue-50'}`}>
              {status?.onboarded ? <CheckCircle size={22} className="text-green-500" /> : <CreditCard size={22} className="text-blue-500" />}
            </div>
            <div className="flex-1">
              {loadingStatus ? (
                <div className="h-5 w-40 bg-gray-100 rounded animate-pulse mb-2" />
              ) : status?.onboarded ? (
                <>
                  <div className="text-base font-extrabold text-green-700 mb-1">✅ Conta Stripe ativa</div>
                  <p className="text-sm text-green-600 font-medium">Estás pronto para receber pagamentos. Os fundos são transferidos automaticamente para a tua conta bancária.</p>
                </>
              ) : status?.connected ? (
                <>
                  <div className="text-base font-extrabold text-amber-700 mb-1">⚠️ Configuração incompleta</div>
                  <p className="text-sm text-amber-600 font-medium mb-3">Falta completar o processo de verificação na Stripe.</p>
                  {status.requirements?.length > 0 && (
                    <div className="text-xs text-amber-600 font-medium mb-3">
                      Em falta: {status.requirements.join(', ')}
                    </div>
                  )}
                  <button onClick={handleConnect} disabled={connecting}
                    className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm rounded-xl transition-colors">
                    <ExternalLink size={14} /> {connecting ? 'A redirecionar…' : 'Completar verificação'}
                  </button>
                </>
              ) : (
                <>
                  <div className="text-base font-extrabold text-gray-900 mb-1">Ligar conta Stripe</div>
                  <p className="text-sm text-gray-500 font-medium mb-4">Para receberes pagamentos das tuas obras precisas de ligar uma conta Stripe. É rápido e gratuito.</p>
                  <div className="flex flex-col gap-2 mb-4 text-xs text-gray-500 font-medium">
                    <div className="flex items-center gap-2">✓ Pagamentos seguros via Stripe</div>
                    <div className="flex items-center gap-2">✓ Transferências automáticas para o teu banco</div>
                    <div className="flex items-center gap-2">✓ Comissão nauu.art: 5% por venda</div>
                  </div>
                  <button onClick={handleConnect} disabled={connecting}
                    className="flex items-center gap-2 px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-bold text-sm rounded-xl transition-colors disabled:opacity-50">
                    <CreditCard size={15} /> {connecting ? 'A redirecionar…' : 'Ligar conta Stripe →'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Métricas */}
        {status?.onboarded && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
            {[
              { label: 'Receita total', value: `€ ${totalRevenue.toFixed(2)}`, icon: TrendingUp, color: 'text-green-500', bg: 'bg-green-50' },
              { label: 'Vendas pagas', value: sales.filter(o => o.status === 'PAID').length, icon: CheckCircle, color: 'text-blue-500', bg: 'bg-blue-50' },
              { label: 'Pendentes', value: pendingOrders, icon: AlertCircle, color: 'text-amber-500', bg: 'bg-amber-50' },
            ].map(m => (
              <div key={m.label} className="bg-white border border-gray-100 rounded-xl p-4">
                <div className="flex justify-between mb-2">
                  <div className="text-xs font-bold uppercase tracking-widest text-gray-300">{m.label}</div>
                  <div className={`w-7 h-7 ${m.bg} rounded-lg flex items-center justify-center`}><m.icon size={13} className={m.color} /></div>
                </div>
                <div className="text-2xl font-extrabold text-gray-900">{m.value}</div>
              </div>
            ))}
          </div>
        )}

        {/* Lista de vendas */}
        {sales.length > 0 && (
          <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="text-sm font-extrabold text-gray-900">Vendas recentes</h2>
            </div>
            <div className="divide-y divide-gray-50">
              {sales.map(order => (
                <div key={order.id} className="flex items-center gap-3 px-5 py-3">
                  <div className="w-10 h-8 rounded-lg bg-gray-50 overflow-hidden flex-shrink-0">
                    {order.artwork?.images?.[0] ? <img src={order.artwork.images[0].imageUrl} className="w-full h-full object-cover" alt="" /> : <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs font-extrabold">{order.artwork?.title?.[0]}</div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-gray-900 truncate">{order.artwork?.title}</div>
                    <div className="text-xs text-gray-400 font-medium">{order.buyer?.name} · {new Date(order.createdAt).toLocaleDateString('pt-PT')}</div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-sm font-extrabold text-gray-900">€ {parseFloat(order.artistAmount).toFixed(2)}</div>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${order.status === 'PAID' ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
                      {order.status === 'PAID' ? 'Pago' : 'Pendente'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function PaymentsPage() {
  return <Suspense fallback={null}><PaymentsContent /></Suspense>
}
