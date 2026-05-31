'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '../../../context/AuthContext'
import api from '../../../lib/api'
import toast from 'react-hot-toast'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import Link from 'next/link'
import { ChevronRight, Lock } from 'lucide-react'

let stripePromise = null
const getStripe = async () => {
  if (!stripePromise) {
    const res = await fetch('/api/payments/config')
    const { publishableKey } = await res.json()
    stripePromise = loadStripe(publishableKey)
  }
  return stripePromise
}

function CheckoutForm({ artwork, orderId, onSuccess }) {
  const stripe = useStripe()
  const elements = useElements()
  const [paying, setPaying] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!stripe || !elements) return
    setPaying(true)
    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: { return_url: `${window.location.origin}/account/orders?success=true` },
        redirect: 'if_required'
      })
      if (error) {
        toast.error(error.message)
      } else if (paymentIntent?.status === 'succeeded') {
        onSuccess()
      }
    } catch { toast.error('Erro ao processar pagamento') }
    setPaying(false)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <PaymentElement />
      <button type="submit" disabled={paying || !stripe}
        className="w-full py-3.5 bg-blue-500 hover:bg-blue-600 text-white font-extrabold rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
        <Lock size={15} />
        {paying ? 'A processar…' : `Pagar € ${parseFloat(artwork?.price).toFixed(2)}`}
      </button>
      <p className="text-xs text-gray-400 font-medium text-center">Pagamento seguro via Stripe. Os teus dados estão protegidos.</p>
    </form>
  )
}

export default function CheckoutPage() {
  const { artworkId } = useParams()
  const { isLoggedIn, loading, user } = useAuth()
  const router = useRouter()
  const [artwork, setArtwork] = useState(null)
  const [clientSecret, setClientSecret] = useState(null)
  const [orderId, setOrderId] = useState(null)
  const [loadingCheckout, setLoadingCheckout] = useState(true)
  const [stripeInstance, setStripeInstance] = useState(null)
  const [success, setSuccess] = useState(false)
  const [shippingAddress, setShippingAddress] = useState({ name: '', address: '', city: '', postalCode: '', country: 'Portugal' })

  useEffect(() => {
    if (!loading && !isLoggedIn) router.push('/login')
  }, [loading, isLoggedIn])

  useEffect(() => {
    if (isLoggedIn && artworkId) {
      api.get(`/artworks/${artworkId}`).then(res => setArtwork(res.data)).catch(() => {})
      getStripe().then(s => setStripeInstance(s))
    }
  }, [isLoggedIn, artworkId])

  const handleCreateIntent = async () => {
    if (!shippingAddress.name || !shippingAddress.address || !shippingAddress.city || !shippingAddress.postalCode) {
      toast.error('Preenche a morada de entrega')
      return
    }
    setLoadingCheckout(true)
    try {
      const res = await api.post('/payments/intent', { artworkId, shippingAddress })
      setClientSecret(res.data.clientSecret)
      setOrderId(res.data.orderId)
    } catch (err) { toast.error(err.response?.data?.error || 'Erro ao iniciar pagamento') }
    setLoadingCheckout(false)
  }

  if (success) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-4">🎉</div>
        <h1 className="text-2xl font-extrabold tracking-tight mb-2">Pagamento confirmado!</h1>
        <p className="text-gray-500 font-medium mb-6">A tua encomenda foi recebida. O artista irá contactar-te em breve.</p>
        <div className="flex gap-3 justify-center">
          <Link href="/account/orders" className="px-5 py-2.5 bg-blue-500 text-white font-bold rounded-xl">Ver encomendas</Link>
          <Link href="/" className="px-5 py-2.5 border border-gray-200 text-gray-600 font-bold rounded-xl">Voltar ao início</Link>
        </div>
      </div>
    </div>
  )

  if (loading || !artwork) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" /></div>

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-gray-400 font-medium mb-6">
          <Link href={`/artwork/${artworkId}`} className="hover:text-gray-700">Obra</Link>
          <ChevronRight size={12} />
          <span className="text-gray-600">Checkout</span>
        </div>

        {/* Obra */}
        <div className="bg-white border border-gray-100 rounded-2xl p-4 mb-5 flex gap-4">
          <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-50 flex-shrink-0">
            {artwork.images?.[0] ? <img src={artwork.images[0].imageUrl} className="w-full h-full object-cover" alt="" /> : null}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-base font-extrabold text-gray-900">{artwork.title}</div>
            <div className="text-sm text-gray-400 font-medium">{artwork.artist?.artistName}</div>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="text-lg font-extrabold text-gray-900">€ {parseFloat(artwork.price).toFixed(2)}</div>
            <div className="text-xs text-gray-400 font-medium">Comissão nauu: {artwork.artist?.commissionPercent || 5}%</div>
          </div>
        </div>

        {!clientSecret ? (
          <div className="bg-white border border-gray-100 rounded-2xl p-6">
            <h2 className="text-base font-extrabold text-gray-900 mb-4">Morada de entrega</h2>
            <div className="flex flex-col gap-3">
              <div>
                <label className="label">Nome completo</label>
                <input value={shippingAddress.name} onChange={e => setShippingAddress(a => ({...a, name: e.target.value}))} className="input" placeholder="Nome do destinatário" />
              </div>
              <div>
                <label className="label">Morada</label>
                <input value={shippingAddress.address} onChange={e => setShippingAddress(a => ({...a, address: e.target.value}))} className="input" placeholder="Rua, número, andar" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Cidade</label>
                  <input value={shippingAddress.city} onChange={e => setShippingAddress(a => ({...a, city: e.target.value}))} className="input" placeholder="Lisboa" />
                </div>
                <div>
                  <label className="label">Código postal</label>
                  <input value={shippingAddress.postalCode} onChange={e => setShippingAddress(a => ({...a, postalCode: e.target.value}))} className="input" placeholder="1000-001" />
                </div>
              </div>
              <div>
                <label className="label">País</label>
                <input value={shippingAddress.country} onChange={e => setShippingAddress(a => ({...a, country: e.target.value}))} className="input" />
              </div>
              <button onClick={handleCreateIntent} disabled={loadingCheckout}
                className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl transition-colors mt-2 disabled:opacity-50">
                {loadingCheckout ? 'A preparar…' : 'Continuar para pagamento →'}
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white border border-gray-100 rounded-2xl p-6">
            <h2 className="text-base font-extrabold text-gray-900 mb-4 flex items-center gap-2">
              <Lock size={15} className="text-gray-400" /> Pagamento seguro
            </h2>
            {stripeInstance && (
              <Elements stripe={stripeInstance} options={{ clientSecret, appearance: { theme: 'stripe' } }}>
                <CheckoutForm artwork={artwork} orderId={orderId} onSuccess={() => setSuccess(true)} />
              </Elements>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
