import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <div className="mb-6">
          <img src="/logo.svg" alt="nauu.art" className="h-10 w-auto mx-auto mb-8 opacity-30" />
          <div className="text-8xl font-extrabold text-gray-100 tracking-tight mb-2">404</div>
          <h1 className="text-2xl font-extrabold text-gray-900 mb-2" style={{letterSpacing:'-0.03em'}}>
            Página não encontrada
          </h1>
          <p className="text-gray-400 font-medium text-sm leading-relaxed">
            A página que procuras não existe ou foi movida.
          </p>
        </div>
        <div className="flex flex-col gap-3">
          <Link href="/" className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold text-sm rounded-xl transition-colors text-center">
            Voltar ao início
          </Link>
          <Link href="/explore" className="w-full py-3 border border-gray-200 text-gray-500 font-bold text-sm rounded-xl hover:border-blue-300 hover:text-blue-500 transition-colors text-center">
            Explorar obras
          </Link>
        </div>
      </div>
    </div>
  )
}
