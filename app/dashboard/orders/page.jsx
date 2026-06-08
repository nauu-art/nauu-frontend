'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '../../../../context/AuthContext'
import DashboardNav from '../../../../components/ui/DashboardNav'
import api from '../../../../lib/api'
import toast from 'react-hot-toast'
import { Package, ChevronDown, ChevronUp, Truck, CheckCircle, XCircle, Clock } from 'lucide-react'

const STATUS = {
  PAID:       { label: 'Pago',        color: 'text-blue-600 bg-blue-50 border-blue-200',    icon: Clock },
  PROCESSING: { label: 'A preparar',  color: 'text-yellow-700 bg-yellow-50 border-yellow-200', icon: Package },
  SHIPPED:    { label: 'Enviado',     color: 'text-purple-700 bg-purple-50 border-purple-200', icon: Truck },
  DELIVERED:  { label: 'Entregue',    color: 'text-green-700 bg-green-50 border-green-200',   icon: CheckCircle },
  CANCELLED:  { label: 'Cancelado',   color: 'text-red-600 bg-red-50 border-red-200',          icon: XCircle },
}

const NEXT_STATUS = {
  PAID: 'PROCESSING',
  PROCESSING: 'SHIPPED',
  SHIPPED: 'DELIVERED',
}

const NEXT_LABEL = {
  PAID: 'Marcar a preparar',
  PROCESSING: 'Marcar como enviado',
  SHIPPED: 'Marcar como entregue',
}

function OrderCard({ order, onUpdate }) {
  const [open, setOpen] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [tracking, setTracking] = useState({ number: '', url: '' })
  const status = STATUS[order.fulfillmentStatus] || STATUS.PAID
  const StatusIcon = status.icon
  const address = order.shippingAddress ? JSON.parse(order.shippingAddress) : null
  const next = NEXT_STATUS[order.fulfillmentStatus]

  const handleUpdate = async (newStatus) => {
    setUpdating(true)
    try {
      await api.put(`/payments/orders/${order.id}/status`, {
        fulfillmentStatus: newStatus,
        ...(tracking.number && { trackingNumber: tracking.number }),
        ...(tracking.url && { trackingUrl: tracking.url }),
      })
      toast.success('Estado atualizado!')
      onUpdate()
    } catch {
      toast.error('Erro ao atualizar')
    }
    setUpdating(false)
  }

  const handleCancel = async () => {
    if (!confirm('Cancelar esta encomenda?')) return
    await handleUpdate('CANCELLED')
  }

  return (
    <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-4 p-4 text-left hover:bg-gray-50 transition-colors"
      >
        <div className="w-14 h-14 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
          {order.artwork?.images?.[0] && (
            <img src={order.artwork.images[0].url} alt="" className="w-full h-full object-cover" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-sm text-gray-900 truncate">{order.artwork?.title}</div>
          <div className="text-xs text-gray-500 mt-0.5">
            {order.buyer?.name} · €{Number(order.amount).toFixed(2)}
          </div>
          <div className="text-xs text-gray-400 mt-0.5">
            {new Date(order.createdAt).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' })}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full border ${status.color}`}>
            <StatusIcon size={11} />
            {status.label}
          </span>
          {open ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
        </div>
      </button>

      {open && (
        <div className="border-t border-gray-100 p-4 flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="text-xs font-extrabold uppercase tracking-widest text-gray-400 mb-1.5">Comprador</div>
              <div className="text-sm font-semibold text-gray-800">{order.buyer?.name}</div>
              <div className="text-xs text-gray-500">{order.buyer?.email}</div>
            </div>
            {address && (
              <div>
                <div className="text-xs font-extrabold uppercase tracking-widest text-gray-400 mb-1.5">Morada de entrega</div>
                <div className="text-sm text-gray-700 leading-relaxed">
                  {address.name && <div className="font-semibold">{address.name}</div>}
                  <div>{address.street}</div>
                  <div>{address.postalCode} {address.city}</div>
                  <div>{address.country}</div>
                  {address.phone && <div className="text-gray-500">Tel: {address.phone}</div>}
                </div>
              </div>
            )}
          </div>

          <div>
            <div className="text-xs font-extrabold uppercase tracking-widest text-gray-400 mb-1.5">Valores</div>
            <div className="bg-gray-50 rounded-lg p-3 flex flex-col gap-1 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Total pago pelo comprador</span>
                <span className="font-bold">€{Number(order.amount).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-400 text-xs">
                <span>Comissão nauu + fee Stripe</span>
                <span>- €{Number(order.platformFee).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-green-700 font-extrabold border-t border-gray-200 pt-1 mt-0.5">
                <span>Tu recebes</span>
                <span>€{Number(order.artistAmount).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {order.trackingNumber && (
            <div>
              <div className="text-xs font-extrabold uppercase tracking-widest text-gray-400 mb-1">Tracking</div>
              <div className="text-sm font-mono text-gray-700">{order.trackingNumber}</div>
              {order.trackingUrl && (
                <a href={order.trackingUrl} target="_blank" rel="noopener noreferrer"
                  className="text-xs text-blue-500 hover:underline">Ver tracking →</a>
              )}
            </div>
          )}

          {order.notes && (
            <div>
              <div className="text-xs font-extrabold uppercase tracking-widest text-gray-400 mb-1">Notas do comprador</div>
              <div className="text-sm text-gray-600 italic">{order.notes}</div>
            </div>
          )}

          {next && order.fulfillmentStatus !== 'CANCELLED' && (
            <div className="flex flex-col gap-2">
              {next === 'SHIPPED' && (
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Nº de tracking (opcional)"
                    value={tracking.number}
                    onChange={e => setTracking(t => ({ ...t, number: e.target.value }))}
                    className="input text-sm col-span-2 sm:col-span-1"
                  />
                  <input
                    type="text"
                    placeholder="URL de tracking (opcional)"
                    value={tracking.url}
                    onChange={e => setTracking(t => ({ ...t, url: e.target.value }))}
                    className="input text-sm col-span-2 sm:col-span-1"
                  />
                </div>
              )}
              <div className="flex gap-2">
                <button
                  onClick={() => handleUpdate(next)}
                  disabled={updating}
                  className="flex-1 py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-bold text-sm rounded-xl transition-colors disabled:opacity-50"
                >
                  {updating ? 'A atualizar…' : NEXT_LABEL[order.fulfillmentStatus]}
                </button>
                {order.fulfillmentStatus !== 'DELIVERED' && (
                  <button
                    onClick={handleCancel}
                    disabled={updating}
                    className="px-4 py-2.5 border border-red-200 text-red-500 hover:bg-red-50 font-bold text-sm rounded-xl transition-colors disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Link
              href={`/artwork/${order.artwork?.id}`}
              className="text-xs font-bold text-gray-400 hover:text-gray-600 transition-colors"
            >
              Ver obra →
            </Link>
            <span className="text-xs text-gray-300">|</span>
            <Link
              href="/dashboard/messages"
              className="text-xs font-bold text-gray-400 hover:text-gray-600 transition-colors"
            >
              Mensagens →
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

export default function DashboardOrdersPage() {
  const { user, isArtist, isLoggedIn, loading } = useAuth()
  const router = useRouter()
  const [orders, setOrders] = useState([])
  const [fetching, setFetching] = useState(true)
  const [filter, setFilter] = useState('ALL')

  const fetchOrders = async () => {
    try {
      const res = await api.get('/payments/sales')
      setOrders(res.data || [])
    } catch { toast.error('Erro ao carregar encomendas') }
    setFetching(false)
  }

  useEffect(() => {
    if (!loading && !isLoggedIn) router.push('/login')
    if (!loading && !isArtist) router.push('/')
    if (!loading && isArtist) fetchOrders()
  }, [loading, isLoggedIn, isArtist])

  if (loading || !user) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
    </div>
  )

  const FILTERS = [
    { key: 'ALL', label: 'Todas' },
    { key: 'PAID', label: 'Por tratar' },
    { key: 'PROCESSING', label: 'A preparar' },
    { key: 'SHIPPED', label: 'Enviadas' },
    { key: 'DELIVERED', label: 'Entregues' },
  ]

  const filtered = filter === 'ALL' ? orders : orders.filter(o => o.fulfillmentStatus === filter)

  const totalReceived = orders
    .filter(o => o.fulfillmentStatus !== 'CANCELLED' && o.status === 'PAID')
    .reduce((sum, o) => sum + Number(o.artistAmount || 0), 0)

  return (
    <div className="flex min-h-screen bg-gray-50">
      <DashboardNav />
      <div className="flex-1 md:ml-52 p-4 md:p-8 pt-20 md:pt-8">
        <div className="mb-7">
          <h1 className="text-2xl font-extrabold tracking-tight" style={{ letterSpacing: '-0.03em' }}>Encomendas</h1>
          <p className="text-sm text-gray-400 mt-1">Gere as tuas vendas e atualiza o estado de envio</p>
        </div>

        {orders.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <div className="bg-white border border-gray-100 rounded-xl p-4">
              <div className="text-xs font-extrabold uppercase tracking-widest text-gray-400 mb-1">Total vendas</div>
              <div className="text-xl font-extrabold text-gray-900">{orders.filter(o => o.status === 'PAID').length}</div>
            </div>
            <div className="bg-white border border-gray-100 rounded-xl p-4">
              <div className="text-xs font-extrabold uppercase tracking-widest text-gray-400 mb-1">Por enviar</div>
              <div className="text-xl font-extrabold text-yellow-600">
                {orders.filter(o => ['PAID', 'PROCESSING'].includes(o.fulfillmentStatus)).length}
              </div>
            </div>
            <div className="bg-white border border-gray-100 rounded-xl p-4">
              <div className="text-xs font-extrabold uppercase tracking-widest text-gray-400 mb-1">Enviadas</div>
              <div className="text-xl font-extrabold text-purple-600">
                {orders.filter(o => o.fulfillmentStatus === 'SHIPPED').length}
              </div>
            </div>
            <div className="bg-white border border-gray-100 rounded-xl p-4">
              <div className="text-xs font-extrabold uppercase tracking-widest text-gray-400 mb-1">Recebi</div>
              <div className="text-xl font-extrabold text-green-600">€{totalReceived.toFixed(2)}</div>
            </div>
          </div>
        )}

        <div className="flex gap-2 mb-4 flex-wrap">
          {FILTERS.map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-all ${filter === f.key ? 'bg-blue-500 border-blue-500 text-white' : 'border-gray-200 text-gray-500 hover:border-blue-300'}`}
            >
              {f.label}
              {f.key !== 'ALL' && (
                <span className="ml-1 opacity-70">
                  ({orders.filter(o => o.fulfillmentStatus === f.key).length})
                </span>
              )}
            </button>
          ))}
        </div>

        {fetching ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <Package size={40} className="text-gray-200 mx-auto mb-4" />
            <p className="text-gray-400 font-semibold">
              {filter === 'ALL' ? 'Ainda não tens encomendas' : 'Nenhuma encomenda neste estado'}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map(order => (
              <OrderCard key={order.id} order={order} onUpdate={fetchOrders} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
