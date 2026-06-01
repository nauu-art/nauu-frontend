'use client'
import { useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle } from 'lucide-react'

function SuccessContent() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('orderId')

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={40} className="text-green-500" />
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight mb-2">Pagamento confirmado!</h1>
        <p className="text-gray-400 font-medium text-sm mb-8">
          A tua encomenda foi recebida. O artista irá entrar em contacto em breve com os detalhes de envio.
        </p>
        <div className="flex flex-col gap-3">
          <Link href="/account/orders" className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold text-sm rounded-xl transition-colors text-center">
            Ver as minhas compras
          </Link>
          <Link href="/explore" className="w-full py-3 border border-gray-200 text-gray-500 font-bold text-sm rounded-xl hover:border-blue-300 transition-colors text-center">
            Continuar a explorar
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function SuccessPage() {
  return <Suspense fallback={null}><SuccessContent /></Suspense>
}
