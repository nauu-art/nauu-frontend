'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '../../../context/AuthContext'
import api from '../../../lib/api'
import { Package, ChevronRight } from 'lucide-react'

const STATUS_LABELS = {
  PENDING: { label: 'Pendente', color: 'bg-amber-100 text-amber-600' },
  PAID: { label: 'Pago', color: 'bg-blue-100 text-blue-600' },
  SHIPPED: { label: 'Enviado', color: 'bg-purple-100 text-purple-600' },
  DELIVERED: { label: 'Entregue', color: 'bg-green-100 text-green-600' },
  CANCELLED: { label: 'Cancelado', color: 'bg-red-100 text-red-600' },
}

export default function OrdersPage() {
  const { isLoggedIn, loading } = useAuth()
  const router = useRouter()
  const [orders, setOrders] = useState([])
  const [loadingOrders, setLoadingOrders] = useState(true)

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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8 md:py-12">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
            <Package size={18} className="text-blue-500" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">As minhas compras</h1>
            <p className="text-sm text-gray-400 font-medium mt-0.5">{orders.length} encomendas</p>
          </div>
        </div>

        {loadingOrders ? (
          <div className="space-y-3">{Array.from({length:3}).map((_,i) => <div key={i} className="h-20 bg-white rounded-2xl animate-pulse" />)}</div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
            <div className="text-4xl mb-3">🛒</div>
            <div className="text-gray-300 font-bold text-lg mb-2">Ainda não fizeste compras</div>
            <p className="text-gray-400 text-sm font-medium mb-6">Explora o catálogo e encontra obras que te inspiram.</p>
            <Link href="/explore" className="inline-block px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-bold text-sm rounded-xl">
              Explorar obras
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {orders.map(order => {
              const st = STATUS_LABELS[order.status] || STATUS_LABELS.PENDING
              return (
                <div key={order.id} className="bg-white border border-gray-100 rounded-2xl p-5 hover:border-blue-100 transition-colors">
                  <div className="flex gap-4">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-50 flex-shrink-0">
                      {order.artwork?.images?.[0]
                        ? <img src={order.artwork.images[0].imageUrl} alt={order.artwork.title} className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center text-gray-200 text-2xl font-bold">{order.artwork?.title?.[0]}</div>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <Link href={`/artwork/${order.artworkId}`} className="font-extrabold text-gray-900 hover:text-blue-500 transition-colors truncate block">{order.artwork?.title}</Link>
                          <div className="text-sm text-gray-400 font-medium">{order.artist?.artistName}</div>
                        </div>
                        <span className={`flex-shrink-0 text-xs font-bold px-2.5 py-1 rounded-full ${st.color}`}>{st.label}</span>
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <div className="text-lg font-extrabold text-gray-900">€ {parseFloat(order.amount).toFixed(2)}</div>
                        <div className="text-xs text-gray-400 font-medium">{new Date(order.createdAt).toLocaleDateString('pt-PT', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                      </div>
                    </div>
                  </div>
                  {order.conversationId && (
                    <div className="mt-3 pt-3 border-t border-gray-50">
                      <Link href={`/account/messages/${order.conversationId}`} className="text-xs font-bold text-blue-500 hover:text-blue-600 flex items-center gap-1">
                        💬 Ver conversa com o artista <ChevronRight size={12} />
                      </Link>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
