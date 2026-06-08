'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '../../../context/AuthContext'
import DashboardNav from '../../../components/ui/DashboardNav'
import api from '../../../lib/api'
import toast from 'react-hot-toast'
import { Package, Euro, TrendingUp, Clock, ChevronDown, ChevronUp, ExternalLink, MessageSquare, Truck } from 'lucide-react'

const FULFILLMENT_LABELS = {
  PAID: { label: 'Pago', color: 'text-blue-500 bg-blue-50', step: 0 },
  PROCESSING: { label: 'A preparar', color: 'text-yellow-600 bg-yellow-50', step: 1 },
  SHIPPED: { label: 'Enviado', color: 'text-purple-600 bg-purple-50', step: 2 },
  DELIVERED: { label: 'Entregue', color: 'text-green-600 bg-green-50', step: 3 },
  CANCELLED: { label: 'Cancelado', color: 'text-red-500 bg-red-50', step: -1 },
}

const STEPS = ['Pago', 'A preparar', 'Enviado', 'Entregue']

function OrderTimeline({ status }) {
  const current = FULFILLMENT_LABELS[status]?.step ?? 0
  if (status === 'CANCELLED') return <span className="text-xs font-bold text-red-500 bg-red-50 px-2 py-1 rounded-full">Cancelado</span>
  return (
    <div className="flex items-center gap-1">
      {STEPS.map((step, i) => (
        <div key={step} className="flex items-center gap-1">
          <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full transition-all ${i <= current ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
            {i < current && '✓ '}{step}
          </div>
          {i < STEPS.length - 1 && <div className={`w-4 h-0.5 ${i < current ? 'bg-blue-400' : 'bg-gray-200'}`} />}
        </div>
      ))}
    </div>
  )
}

function OrderDetail({ order, onStatusChange }) {
  const [newStatus, setNewStatus] = useState(order.fulfillmentStatus || 'PAID')
  const [tracking, setTracking] = useState({ number: order.trackingNumber || '', url: order.trackingUrl || '' })
  const [saving, setSaving] = useState(false)

  const address = order.shippingAddress ? (() => { try { return JSON.parse(order.shippingAddress) } catch { return null } })() : null

  const handleUpdate = async () => {
    setSaving(true)
    try {
      await api.put(`/payments/orders/${order.id}/status`, {
        fulfillmentStatus: newStatus,
        trackingNumber: tracking.number,
        trackingUrl: tracking.url,
      })
      toast.success('Estado atualizado!')
      onStatusChange(order.id, newStatus, tracking)
    } catch { toast.error('Erro ao atualizar') }
    setSaving(false)
  }

  return (
    <div className="border-t border-gray-100 p-4 bg-gray-50 grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Dados do comprador */}
      <div>
        <div className="text-xs font-extrabold uppercase tracking-widest text-gray-400 mb-2">Comprador</div>
        <div className="text-sm font-bold text-gray-900">{order.buyer?.name}</div>
        <div className="text-xs text-gray-500">{order.buyer?.email}</div>
        {address && (
          <div className="mt-2 text-xs text-gray-500 leading-relaxed">
            <div className="font-bold text-gray-700 mb-1">Morada de entrega</div>
            {address.name && <div>{address.name}</div>}
            <div>{address.street}</div>
            <div>{address.postalCode} {address.city}</div>
            <div>{address.country}</div>
            {address.phone && <div>📞 {address.phone}</div>}
          </div>
        )}
      </div>

      {/* Financeiro */}
      <div>
        <div className="text-xs font-extrabold uppercase tracking-widest text-gray-400 mb-2">Financeiro</div>
        <div className="flex flex-col gap-1.5 text-sm">
          <div className="flex justify-between"><span className="text-gray-500">Valor pago</span><span className="font-bold">€ {Number(order.amount).toFixed(2)}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Comissão nauu</span><span className="font-bold text-red-500">- € {Number(order.platformFee).toFixed(2)}</span></div>
          <div className="flex justify-between border-t border-gray-200 pt-1.5"><span className="font-bold text-gray-700">Tu recebes</span><span className="font-extrabold text-green-600">€ {Number(order.artistAmount).toFixed(2)}</span></div>
        </div>
        <div className="mt-2 text-xs text-gray-400">
          {order.paidAt && <div>Pago em {new Date(order.paidAt).toLocaleDateString('pt-PT')}</div>}
          {order.shippedAt && <div>Enviado em {new Date(order.shippedAt).toLocaleDateString('pt-PT')}</div>}
          {order.deliveredAt && <div>Entregue em {new Date(order.deliveredAt).toLocaleDateString('pt-PT')}</div>}
        </div>
      </div>

      {/* Acções */}
      <div>
        <div className="text-xs font-extrabold uppercase tracking-widest text-gray-400 mb-2">Actualizar estado</div>
        <select value={newStatus} onChange={e => setNewStatus(e.target.value)} className="input text-sm mb-2">
          <option value="PAID">Pago</option>
          <option value="PROCESSING">A preparar</option>
          <option value="SHIPPED">Enviado</option>
          <option value="DELIVERED">Entregue</option>
          <option value="CANCELLED">Cancelado</option>
        </select>
        {(newStatus === 'SHIPPED' || order.trackingNumber) && (
          <div className="flex flex-col gap-1.5 mb-2">
            <input value={tracking.number} onChange={e => setTracking(t => ({...t, number: e.target.value}))}
              className="input text-xs" placeholder="Nº de tracking (ex: CT123456789PT)" />
            <input value={tracking.url} onChange={e => setTracking(t => ({...t, url: e.target.value}))}
              className="input text-xs" placeholder="URL de tracking (opcional)" />
          </div>
        )}
        <div className="flex gap-2">
          <button onClick={handleUpdate} disabled={saving}
            className="flex-1 py-2 bg-blue-500 hover:bg-blue-600 text-white font-bold text-xs rounded-lg">
            {saving ? 'A guardar…' : 'Guardar'}
          </button>
          {order.conversationId && (
            <Link href={`/dashboard/messages/${order.conversationId}`}
              className="flex items-center gap-1 px-3 py-2 border border-gray-200 text-gray-500 hover:border-blue-300 hover:text-blue-500 font-bold text-xs rounded-lg">
              <MessageSquare size={12} /> Chat
            </Link>
          )}
          {order.artwork && (
            <Link href={`/artwork/${order.artworkId}`} target="_blank"
              className="flex items-center gap-1 px-3 py-2 border border-gray-200 text-gray-500 hover:border-blue-300 hover:text-blue-500 font-bold text-xs rounded-lg">
              <ExternalLink size={12} />
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}

export default function SalesPage() {
  const { user, isArtist, isLoggedIn, loading } = useAuth()
  const router = useRouter()
  const [sales, setSales] = useState([])
  const [loadingSales, setLoadingSales] = useState(true)
  const [expanded, setExpanded] = useState(null)
  const [stripeStatus, setStripeStatus] = useState(null)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    if (!loading && !isLoggedIn) router.push('/login')
    if (!loading && !isArtist) router.push('/')
  }, [loading, isLoggedIn, isArtist])

  useEffect(() => {
    if (isArtist) {
      api.get('/payments/sales').then(res => setSales(res.data || [])).catch(() => {}).finally(() => setLoadingSales(false))
      api.get('/payments/stripe-status').then(res => setStripeStatus(res.data)).catch(() => {})
    }
  }, [isArtist])

  const handleStatusChange = (orderId, newStatus, tracking) => {
    setSales(prev => prev.map(o => o.id === orderId ? {
      ...o,
      fulfillmentStatus: newStatus,
      trackingNumber: tracking.number,
      trackingUrl: tracking.url,
      ...(newStatus === 'SHIPPED' && { shippedAt: new Date().toISOString() }),
      ...(newStatus === 'DELIVERED' && { deliveredAt: new Date().toISOString() }),
    } : o))
  }

  const paidSales = sales.filter(o => o.status === 'PAID')
  const totalRevenue = paidSales.reduce((s, o) => s + Number(o.amount), 0)
  const totalNet = paidSales.reduce((s, o) => s + Number(o.artistAmount), 0)
  const pendingShipment = paidSales.filter(o => ['PAID','PROCESSING'].includes(o.fulfillmentStatus)).length

  const filtered = filter === 'all' ? sales : sales.filter(o => o.fulfillmentStatus === filter)

  if (loading || !user) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" /></div>

  return (
    <div className="flex min-h-screen">
      <DashboardNav />
      <div className="flex-1 md:ml-52 p-5 md:p-8 pt-20 md:pt-8">
        <h1 className="text-xl font-extrabold text-gray-900 mb-6">Vendas</h1>

        {/* Métricas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total faturado', value: `€ ${totalRevenue.toFixed(2)}`, icon: Euro, color: 'text-blue-500', bg: 'bg-blue-50' },
            { label: 'Tu recebes', value: `€ ${totalNet.toFixed(2)}`, icon: TrendingUp, color: 'text-green-500', bg: 'bg-green-50' },
            { label: 'Nº de vendas', value: paidSales.length, icon: Package, color: 'text-purple-500', bg: 'bg-purple-50' },
            { label: 'Por enviar', value: pendingShipment, icon: Clock, color: 'text-orange-500', bg: 'bg-orange-50' },
          ].map(m => (
            <div key={m.label} className="bg-white border border-gray-100 rounded-xl p-4">
              <div className="flex justify-between items-start mb-2">
                <div className="text-xs font-bold text-gray-400 uppercase tracking-wide leading-tight">{m.label}</div>
                <div className={`w-7 h-7 ${m.bg} rounded-lg flex items-center justify-center`}><m.icon size={13} className={m.color} /></div>
              </div>
              <div className="text-2xl font-extrabold text-gray-900">{m.value}</div>
            </div>
          ))}
        </div>

        {/* Comissões info */}
        <details className=bg-blue-50 border border-blue-100 rounded-xl mb-5 group>
          <summary className=flex items-center justify-between px-4 py-3 cursor-pointer list-none>
            <span className=text-sm font-bold text-blue-700>ℹ️ Como se calculam os valores que recebes?</span>
            <span className=text-blue-400 text-xs font-bold group-open:hidden>Ver →</span>
          </summary>
          <div className=px-4 pb-4>
            <div className=grid grid-cols-1 md:grid-cols-3 gap-3 mt-2>
              <div className=bg-white rounded-lg p-3 border border-blue-100>
                <div className=text-xs font-extrabold uppercase tracking-widest text-blue-400 mb-1>Comissão nauu.art</div>
                <div className=text-lg font-extrabold text-gray-900>5%</div>
                <div className=text-xs text-gray-500 mt-0.5>sobre o preço da obra (não sobre os portes)</div>
              </div>
              <div className=bg-white rounded-lg p-3 border border-blue-100>
                <div className=text-xs font-extrabold uppercase tracking-widest text-blue-400 mb-1>Fee da Stripe</div>
                <div className=text-lg font-extrabold text-gray-900>1.5% + €0.25</div>
                <div className=text-xs text-gray-500 mt-0.5>por transação (cartões europeus) — descontada da comissão nauu</div>
              </div>
              <div className=bg-white rounded-lg p-3 border border-blue-100>
                <div className=text-xs font-extrabold uppercase tracking-widest text-blue-400 mb-1>Exemplo — obra de €200</div>
                <div className=flex flex-col gap-0.5 text-xs font-medium text-gray-600 mt-1>
                  <div className=flex justify-between><span>Comprador paga</span><span className=font-bold>€ 200.00</span></div>
                  <div className=flex justify-between text-red-500><span>- Comissão nauu (5%)</span><span>- € 10.00</span></div>
                  <div className=flex justify-between border-t border-gray-100 pt-0.5 text-green-700 font-extrabold><span>Tu recebes</span><span>€ 190.00</span></div>
                </div>
              </div>
            </div>
            <p className=text-xs text-blue-500 font-medium mt-3>Os portes de envio que defines vão integralmente para ti — não são sujeitos a comissão.</p>
          </div>
        </details>

        {/* Stripe status */}
        {stripeStatus && (
          <div className={`flex items-center justify-between p-3 rounded-xl border mb-5 ${stripeStatus.onboarded ? 'bg-green-50 border-green-100' : 'bg-yellow-50 border-yellow-100'}`}>
            <div className="text-sm font-bold text-gray-700">
              {stripeStatus.onboarded ? '🟢 Stripe ativo — recebes pagamentos directamente' : '🟡 Stripe não configurado — os pagamentos ficam em espera'}
            </div>
            {!stripeStatus.onboarded && (
              <Link href="/dashboard" className="text-xs font-bold text-blue-500 hover:text-blue-600">Configurar →</Link>
            )}
          </div>
        )}

        {/* Filtros */}
        <div className="flex gap-2 mb-4 flex-wrap">
          {[['all','Todas'],['PAID','Pagas'],['PROCESSING','A preparar'],['SHIPPED','Enviadas'],['DELIVERED','Entregues'],['CANCELLED','Canceladas']].map(([v,l]) => (
            <button key={v} onClick={() => setFilter(v)}
              className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-colors ${filter === v ? 'bg-blue-500 border-blue-500 text-white' : 'border-gray-200 text-gray-500 hover:border-blue-300'}`}>
              {l}
            </button>
          ))}
        </div>

        {/* Lista de vendas */}
        {loadingSales ? (
          <div className="flex flex-col gap-3">{[1,2,3].map(i => <div key={i} className="h-20 bg-white rounded-xl animate-pulse border border-gray-100" />)}</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
            <div className="text-4xl mb-3">📦</div>
            <div className="text-gray-400 font-bold">Sem vendas ainda</div>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map(order => {
              const fs = FULFILLMENT_LABELS[order.fulfillmentStatus] || FULFILLMENT_LABELS.PAID
              const isExpanded = expanded === order.id
              return (
                <div key={order.id} className="bg-white border border-gray-100 rounded-xl overflow-hidden">
                  <div className="flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => setExpanded(isExpanded ? null : order.id)}>
                    {/* Imagem */}
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      {order.artwork?.images?.[0] ? <img src={order.artwork.images[0].imageUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-300 text-lg">🖼️</div>}
                    </div>
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-extrabold text-gray-900 truncate">{order.artwork?.title}</div>
                      <div className="text-xs text-gray-500">{order.buyer?.name} · {new Date(order.createdAt).toLocaleDateString('pt-PT')}</div>
                      <div className="mt-1"><OrderTimeline status={order.fulfillmentStatus || 'PAID'} /></div>
                    </div>
                    {/* Valor */}
                    <div className="text-right flex-shrink-0">
                      <div className="text-sm font-extrabold text-gray-900">€ {Number(order.amount).toFixed(2)}</div>
                      <div className="text-xs text-green-600 font-bold">+€ {Number(order.artistAmount).toFixed(2)}</div>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full mt-1 inline-block ${fs.color}`}>{fs.label}</span>
                    </div>
                    {isExpanded ? <ChevronUp size={16} className="text-gray-400 flex-shrink-0" /> : <ChevronDown size={16} className="text-gray-400 flex-shrink-0" />}
                  </div>
                  {isExpanded && <OrderDetail order={order} onStatusChange={handleStatusChange} />}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
