'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import api from '../../../../lib/api'
import toast from 'react-hot-toast'
import { ArrowLeft, Lock } from 'lucide-react'
import Link from 'next/link'
import { Suspense, useEffect } from 'react'

function PaymentForm({ orderId, artworkId }) {
  const stripe = useStripe()
  const elements = useElements()
  const router = useRouter()
  const [processing, setProcessing] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!stripe || !elements) return
    setProcessing(true)
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/checkout/${artworkId}/success?orderId=${orderId}`,
      },
    })
    if (error) {
      toast.error(error.message)
      setProcessing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="bg-white border border-gray-100 rounded-2xl p-5">
        <h2 className="text-sm font-extrabold text-gray-900 mb-4 flex items-center gap-2">
          <Lock size={15} /> Pagamento seguro
        </h2>
        <PaymentElement />
      </div>
      <button type="submit" disabled={!stripe || processing}
        className="w-full py-3.5 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl disabled:opacity-50 flex items-center justify-center gap-2">
        <Lock size={16} /> {processing ? 'A processar…' : 'Confirmar pagamento'}
      </button>
      <p className="text-xs text-gray-400 text-center">Pagamento processado com segurança pela Stripe.</p>
    </form>
  )
}

function PaymentContent() {
  const { artworkId } = useParams()
  const [stripePromise, setStripePromise] = useState(null)
  const [clientSecret, setClientSecret] = useState(null)
  const [orderId, setOrderId] = useState(null)
  const router = useRouter()

  useEffect(() => {
    const stored = sessionStorage.getItem('nauu_payment')
    if (!stored) { router.replace(`/artwork/${artworkId}`); return }
    const { clientSecret: cs, orderId: oid } = JSON.parse(stored)
    setClientSecret(cs)
    setOrderId(oid)
    api.get('/payments/config').then(res => {
      setStripePromise(loadStripe(res.data.publishableKey))
    })
  }, [])

  if (!clientSecret || !stripePromise) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto px-4 py-8">
        <Link href={`/artwork/${artworkId}`} className="flex items-center gap-2 text-sm text-gray-400 font-medium hover:text-gray-700 mb-6">
          <ArrowLeft size={16} /> Cancelar
        </Link>
        <h1 className="text-2xl font-extrabold tracking-tight mb-6">Pagamento</h1>
        <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'stripe' } }}>
          <PaymentForm orderId={orderId} artworkId={artworkId} />
        </Elements>
      </div>
    </div>
  )
}

export default function PaymentPage() {
  return <Suspense fallback={null}><PaymentContent /></Suspense>
}
