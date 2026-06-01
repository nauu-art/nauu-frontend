'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '../../../context/AuthContext'
import api from '../../../lib/api'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { ArrowLeft, MapPin, Package, CreditCard } from 'lucide-react'

const COUNTRIES_ZONE = {
  portugal: ['Portugal'],
  europe: ['Espanha', 'França', 'Alemanha', 'Itália', 'Países Baixos', 'Bélgica', 'Suíça', 'Áustria', 'Suécia', 'Noruega', 'Dinamarca', 'Finlândia', 'Polónia', 'República Checa', 'Hungria', 'Roménia', 'Grécia', 'Croácia', 'Irlanda', 'Reino Unido'],
}

const getZone = (country) => {
  if (COUNTRIES_ZONE.portugal.includes(country)) return 'portugal'
  if (COUNTRIES_ZONE.europe.includes(country)) return 'europe'
  return 'world'
}

export default function CheckoutPage() {
  const { artworkId } = useParams()
  const router = useRouter()
  const { user, isLoggedIn, loading } = useAuth()
  const [artwork, setArtwork] = useState(null)
  const [shipping, setShipping] = useState(null)
  const [loadingArtwork, setLoadingArtwork] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [address, setAddress] = useState({
    name: '', line1: '', line2: '', city: '', postalCode: '', country: 'Portugal'
  })

  useEffect(() => {
    if (!loading && !isLoggedIn) router.push('/login')
  }, [loading, isLoggedIn])

  useEffect(() => {
    if (artworkId) {
      Promise.all([
        api.get(`/artworks/${artworkId}`),
        api.get(`/payments/shipping/${artworkId}`)
      ]).then(([artRes, shipRes]) => {
        setArtwork(artRes.data)
        setShipping(shipRes.data)
      }).catch(() => router.push('/explore'))
      .finally(() => setLoadingArtwork(false))
    }
    if (user) setAddress(a => ({ ...a, name: user.name || '' }))
  }, [artworkId, user])

  const zone = getZone(address.country)
  const shippingCost = shipping?.freeShipping ? 0 : parseFloat(shipping?.[zone] || 0)
  const subtotal = parseFloat(artwork?.price || 0)
  const total = subtotal + shippingCost

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!address.name || !address.line1 || !address.city || !address.postalCode) {
      toast.error('Preenche a morada completa')
      return
    }
    setProcessing(true)
    try {
      const res = await api.post('/payments/intent', {
        artworkId,
        shippingAddress: address,
        notes: ''
      })
      // Redirecionar para Stripe (simplificado — sem Stripe.js por agora)
      // TODO: integrar Stripe Elements
      toast.success('A redirecionar para pagamento…')
      router.push(`/checkout/${artworkId}/payment?clientSecret=${res.data.clientSecret}&orderId=${res.data.orderId}`)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erro ao processar')
    }
    setProcessing(false)
  }

  if (loading || loadingArtwork) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" /></div>
  if (!artwork) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Link href={`/artwork/${artworkId}`} className="flex items-center gap-2 text-sm text-gray-400 font-medium hover:text-gray-700 mb-6">
          <ArrowLeft size={16} /> Voltar à obra
        </Link>

        <h1 className="text-2xl font-extrabold tracking-tight mb-6">Checkout</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Resumo da obra */}
          <div className="flex flex-col gap-4">
            <div className="bg-white border border-gray-100 rounded-2xl p-5">
              <h2 className="text-sm font-extrabold text-gray-900 mb-4">Resumo</h2>
              <div className="flex gap-3">
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-50 flex-shrink-0">
                  {artwork.images?.[0] ? <img src={artwork.images[0].imageUrl} alt={artwork.title} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-200 text-2xl font-bold">{artwork.title?.[0]}</div>}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-extrabold text-gray-900 truncate">{artwork.title}</div>
                  <div className="text-sm text-gray-400 font-medium">{artwork.artist?.artistName}</div>
                </div>
              </div>
              <div className="border-t border-gray-100 mt-4 pt-4 flex flex-col gap-2 text-sm font-medium">
                <div className="flex justify-between">
                  <span className="text-gray-500">Obra</span>
                  <span className="font-bold">€ {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 flex items-center gap-1"><Package size={12} /> Portes ({address.country})</span>
                  <span className="font-bold">{shipping?.freeShipping || shippingCost === 0 ? 'Grátis' : `€ ${shippingCost.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between border-t border-gray-100 pt-2 mt-1">
                  <span className="font-extrabold text-gray-900">Total</span>
                  <span className="font-extrabold text-gray-900">€ {total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Morada */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="bg-white border border-gray-100 rounded-2xl p-5">
              <h2 className="text-sm font-extrabold text-gray-900 mb-4 flex items-center gap-2">
                <MapPin size={15} /> Morada de entrega
              </h2>
              <div className="flex flex-col gap-3">
                <div>
                  <label className="label">Nome completo</label>
                  <input value={address.name} onChange={e => setAddress(a => ({...a, name: e.target.value}))} className="input" placeholder="Nome do destinatário" required />
                </div>
                <div>
                  <label className="label">Morada</label>
                  <input value={address.line1} onChange={e => setAddress(a => ({...a, line1: e.target.value}))} className="input" placeholder="Rua, número" required />
                </div>
                <div>
                  <label className="label">Complemento</label>
                  <input value={address.line2} onChange={e => setAddress(a => ({...a, line2: e.target.value}))} className="input" placeholder="Apartamento, andar (opcional)" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">Cidade</label>
                    <input value={address.city} onChange={e => setAddress(a => ({...a, city: e.target.value}))} className="input" placeholder="Lisboa" required />
                  </div>
                  <div>
                    <label className="label">Código Postal</label>
                    <input value={address.postalCode} onChange={e => setAddress(a => ({...a, postalCode: e.target.value}))} className="input" placeholder="1000-001" required />
                  </div>
                </div>
                <div>
                  <label className="label">País</label>
                  <select value={address.country} onChange={e => setAddress(a => ({...a, country: e.target.value}))} className="input">
                    {['Portugal','Espanha','França','Alemanha','Itália','Reino Unido','Brasil','Estados Unidos','Outro'].map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <button type="submit" disabled={processing}
              className="w-full py-3.5 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
              <CreditCard size={16} /> {processing ? 'A processar…' : `Pagar € ${total.toFixed(2)}`}
            </button>
            <p className="text-xs text-gray-400 text-center font-medium">Pagamento seguro via Stripe. Os teus dados estão protegidos.</p>
          </form>
        </div>
      </div>
    </div>
  )
}
