import Link from 'next/link'
import { Mail } from 'lucide-react'

export default function VerificarEmailPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-5">
          <Mail size={32} className="text-blue-500" />
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 mb-2" style={{letterSpacing:'-0.03em'}}>
          Verifica o teu email
        </h1>
        <p className="text-gray-500 font-medium text-sm leading-relaxed mb-3">
          Enviámos um email de confirmação para a tua caixa de entrada.
        </p>
        <p className="text-gray-400 font-medium text-sm leading-relaxed mb-8">
          Clica no link no email para ativar a tua conta. Verifica também a pasta de spam se não encontrares.
        </p>
        <div className="flex flex-col gap-3">
          <Link href="/login" className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold text-sm rounded-xl transition-colors text-center">
            Ir para o login
          </Link>
          <Link href="/" className="w-full py-3 border border-gray-200 text-gray-500 font-bold text-sm rounded-xl hover:border-blue-300 hover:text-blue-500 transition-colors text-center">
            Voltar ao início
          </Link>
        </div>
      </div>
    </div>
  )
}
