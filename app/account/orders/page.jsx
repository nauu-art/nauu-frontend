'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '../../../context/AuthContext'
import api from '../../../lib/api'
import { Package, ChevronDown, ChevronUp, MessageSquare, ExternalLink } from 'lucide-react'

const FULFILLMENT = {
  PAID:       { label: 'Pago',        color: 'text-blue-500 bg-blue-50',    step: 0 },
  PROCESSING: { label: 'A preparar',  color: 'text-yellow-600 bg-yellow-50', step: 1 },
  SHIPPED:    { label: 'Enviado',     color: 'text-purple-600 bg-purple-50', step: 2 },
  DELIVERED:  { label: 'Entregue',    color: 'text-green-600 bg-green-50',   step: 3 },
  CANCELLED:  { label: 'Cancelado',   color: 'text-red-500 bg-red-50',       step: -1 },
}

const STEPS = ['Pago', 'A preparar', 'Enviado', 'Entregue']

function OrderTimeline({ status }) {
  const current = FULFILLMENT[status]?.step ?? 0
  if (status === 'CANCELLED') return <span className="text-xs font-bold text-red-500 bg-red-50 px-2 py-1 rounded-full">Cancelado</span>
  return (
    <div className="flex items-center gap-1 flex-wrap">
      {STEPS.map((step, i) => (
        <div key={step} className="flex items-center gap-1">
          <div className={`text-xs font-bold px-2 py-1 rounded-full ${i <= current ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
            {i < current && '✓ '}{step}
          </div>
          {i < STEPS.length - 1 && <div className={`w-3 h-0.5 ${i < current ? 'bg-blue-400' : 'bg-gray-200'}`} />}
        </div>
      ))}
    </div>
  )
}

function OrderDetail({ order }) {
  const address = order.shippingAddress ? (() => { try { return JSON.parse(order.shippingAddress) } catch { return null } })() : null

  return (
    <div className="border-t border-gray-100 p-4 bg-gray-50 grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Morada */}
      {address && (
        <div>
          <div className="text-xs font-extrabold uppercase tracking-widest text-gray-400 mb-2">Morada de entrega</div>
          <div className="text-sm text-gray-700 leading-relaxed">
            {address.name && <div className="font-bold">{address.name}</div>}
            <div>{address.street}</div>
            <div>{address.postalCode} {address.city}</div>
            <div>{address.country}</div>
            {address.phone && <div className="mt-1 text-gray-500">📞 {address.phone}</div>}
          </div>
        </div>
      )}

      {/* Resumo financeiro + tracking */}
      <div>
        <div className="text-xs font-extrabold uppercase tracking-widest text-gray-400 mb-2">Detalhes</div>
        <div className="flex flex-col gap-1.5 text-sm">
          <div className="flex justify-between"><span className="text-gray-500">Valor pago</span><span className="font-bold">€ {Number(order.amount).toFixed(2)}</span></div>
          {order.paidAt && <div className="flex justify-between"><span className="text-gray-500">Data de pagamento</span><span className="font-medium">{new Date(order.paidAt).toLocaleDateString('pt-PT')}</span></div>}
          {order.shippedAt && <div className="flex justify-between"><span className="text-gray-500">Data de envio</span><span className="font-medium">{new Date(order.shippedAt).toLocaleDateString('pt-PT')}</span></div>}
          {order.deliveredAt && <div className="flex justify-between"><span className="text-gray-500">Data de entrega</span><span className="font-medium">{new Date(order.deliveredAt).toLocaleDateString('pt-PT')}</span></div>}
          <div className="flex justify-between"><span className="text-gray-500">Referência</span><span className="font-mono text-xs">{order.id.slice(0,8).toUpperCase()}</span></div>
        </div>

        {/* Tracking */}
        {order.trackingNumber && (
          <div className="mt-3 p-3 bg-blue-50 border border-blue-100 rounded-xl">
            <div className="text-xs font-extrabold text-blue-700 mb-1">📦 Tracking</div>
            <div className="text-sm font-bold text-gray-900">{order.trackingNumber}</div>
            {order.trackingUrl && (
              <a href={order.trackingUrl} target="_blank" rel="noopener noreferrer"
                className="text-xs text-blue-500 hover:text-blue-600 font-bold mt-1 flex items-center gap-1">
                <ExternalLink size={11} /> Acompanhar envio
              </a>
            )}
          </div>
        )}

        {/* Acções */}
        <div className="flex gap-2 mt-3">
          {order.conversationId && (
            <Link href={`/account/messages/${order.conversationId}`}
              className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 hover:border-blue-300 hover:text-blue-500 text-gray-600 font-bold text-xs rounded-lg transition-colors">
              <MessageSquare size={12} /> Falar com o artista
            </Link>
          )}
          <Link href={`/artwork/${order.artworkId}`}
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 hover:border-blue-300 hover:text-blue-500 text-gray-600 font-bold text-xs rounded-lg transition-colors">
            <ExternalLink size={12} /> Ver obra
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function OrdersPage() {
  const { isLoggedIn, loading } = useAuth()
  const router = useRouter()
  const [orders, setOrders] = useState([])
  const [loadingOrders, setLoadingOrders] = useState(true)
  const [expanded, setExpanded] = useState(null)

  useEffect(() => {
    if (!loading && !isLoggedIn) router.push('/login')
  }, [loading, isLoggedIn])

  useEffect(() => {
    if (isLoggedIn) {
      api.get('/payments/orders')
        .then(res => setOrders(res.data || []))
        .catch(() => {})
        .finally(() => setLoadingOrders(false))
    }
  }, [isLoggedIn])

  return (
    <div className="p-5 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-extrabold text-gray-900">As minhas compras</h1>
        <span className="text-sm text-gray-400 font-medium">{orders.length} encomendas</span>
      </div>

      {loadingOrders ? (
        <div className="flex flex-col gap-3">{[1,2,3].map(i => <div key={i} className="h-20 bg-white rounded-xl animate-pulse border border-gray-100" />)}</div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
          <div className="text-4xl mb-3">🛒</div>
          <div className="text-gray-400 font-bold text-lg mb-2">Ainda não fizeste compras</div>
          <p className="text-gray-400 text-sm mb-6">Explora o catálogo e encontra obras que te inspiram.</p>
          <Link href="/explore" className="px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-bold text-sm rounded-xl">
            Explorar obras
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {orders.map(order => {
            const fs = FULFILLMENT[order.fulfillmentStatus || 'PAID']
            const isExpanded = expanded === order.id
            return (
              <div key={order.id} className="bg-white border border-gray-100 rounded-xl overflow-hidden">
                <div className="flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => setExpanded(isExpanded ? null : order.id)}>
                  {/* Imagem */}
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                    {order.artwork?.images?.[0]
                      ? <img src={order.artwork.images[0].imageUrl} className="w-full h-full object-cover" alt="" />
                      : <div className="w-full h-full flex items-center justify-center text-2xl">🖼️</div>}
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-extrabold text-gray-900 truncate">{order.artwork?.title}</div>
                    <div className="text-xs text-gray-500">{order.artist?.artistName} · {new Date(order.createdAt).toLocaleDateString('pt-PT')}</div>
                    <div className="mt-1.5"><OrderTimeline status={order.fulfillmentStatus || 'PAID'} /></div>
                  </div>
                  {/* Valor + toggle */}
                  <div className="text-right flex-shrink-0 flex flex-col items-end gap-1">
                    <div className="text-sm font-extrabold text-gray-900">€ {Number(order.amount).toFixed(2)}</div>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${fs.color}`}>{fs.label}</span>
                  </div>
                  {isExpanded ? <ChevronUp size={15} className="text-gray-400 flex-shrink-0" /> : <ChevronDown size={15} className="text-gray-400 flex-shrink-0" />}
                </div>
                {isExpanded && <OrderDetail order={order} />}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
