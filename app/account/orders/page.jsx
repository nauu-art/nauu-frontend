'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '../../../context/AuthContext'
import api from '../../../lib/api'
import { ShoppingBag } from 'lucide-react'
import toast from 'react-hot-toast'

const statusLabel = { PENDING: 'Pendente', PAID: 'Pago', SHIPPED: 'Enviado', DELIVERED: 'Entregue', CANCELLED: 'Cancelado' }
const statusColor = { PENDING: 'bg-amber-100 text-amber-600', PAID: 'bg-blue-100 text-blue-600', SHIPPED: 'bg-purple-100 text-purple-600', DELIVERED: 'bg-green-100 text-green-600', CANCELLED: 'bg-red-100 text-red-600' }

export default function OrdersPage() {
  const { isLoggedIn, loading } = useAuth()
  const router = useRouter()
  const [orders, setOrders] = useState([])
  const [loadingOrders, setLoadingOrders] = useState(true)

  useEffect(() => { if (!loading && !isLoggedIn) router.push('/login') }, [loading, isLoggedIn])

  useEffect(() => {
    if (isLoggedIn) {
      api.get('/payments/orders').then(res => setOrders(res.data || [])).catch(() => {}).finally(() => setLoadingOrders(false))
    }
  }, [isLoggedIn])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8 md:py-12">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
            <ShoppingBag size={18} className="text-blue-500" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">As minhas encomendas</h1>
            <p className="text-sm text-gray-400 font-medium mt-0.5">{orders.length} encomendas</p>
          </div>
        </div>

        {loadingOrders ? (
          <div className="space-y-3">{Array.from({length:3}).map((_,i) => <div key={i} className="h-24 bg-white rounded-2xl animate-pulse" />)}</div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
            <ShoppingBag size={40} className="text-gray-200 mx-auto mb-4" />
            <div className="text-gray-300 font-bold text-lg mb-2">Ainda não fizeste encomendas</div>
            <Link href="/explore" className="inline-block mt-4 px-5 py-2.5 bg-blue-500 text-white font-bold text-sm rounded-xl">Explorar obras</Link>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {orders.map(order => (
              <div key={order.id} className="bg-white border border-gray-100 rounded-2xl p-5">
                <div className="flex gap-4 mb-3">
                  <Link href={`/artwork/${order.artwork?.id}`} className="w-16 h-16 rounded-xl overflow-hidden bg-gray-50 flex-shrink-0">
                    {order.artwork?.images?.[0] ? <img src={order.artwork.images[0].imageUrl} className="w-full h-full object-cover" alt="" /> : null}
                  </Link>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <Link href={`/artwork/${order.artwork?.id}`} className="text-base font-extrabold text-gray-900 hover:text-blue-500 truncate">{order.artwork?.title}</Link>
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0 ${statusColor[order.status] || 'bg-gray-100 text-gray-500'}`}>
                        {statusLabel[order.status] || order.status}
                      </span>
                    </div>
                    <Link href={`/${order.artist?.username}`} className="text-sm text-gray-400 font-medium hover:text-blue-500">{order.artist?.artistName}</Link>
                    <div className="flex justify-between items-center mt-2">
                      <div className="text-sm font-extrabold text-gray-900">€ {parseFloat(order.amount).toFixed(2)}</div>
                      <div className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleDateString('pt-PT')}</div>
                    </div>
                  </div>
                </div>
                {order.conversationId && (
                  <Link href={`/account/messages/${order.conversationId}`}
                    className="text-xs font-bold text-blue-500 hover:text-blue-600">
                    💬 Ver conversa com o artista →
                  </Link>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
