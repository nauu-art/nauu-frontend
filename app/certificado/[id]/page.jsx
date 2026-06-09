import { notFound } from 'next/navigation'

async function getCertificate(id) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/certificates/verify/${id}`, { cache: 'no-store' })
    if (!res.ok) return null
    return res.json()
  } catch { return null }
}

export default async function CertificadoPage({ params }) {
  const cert = await getCertificate(params.id)
  if (!cert?.valid) notFound()

  const date = new Date(cert.issuedAt).toLocaleDateString('pt-PT', { day: 'numeric', month: 'long', year: 'numeric' })
  const imageUrl = cert.artwork?.imageUrl

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-12">
      {/* Badge de autenticidade */}
      <div className="mb-8 flex flex-col items-center">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-3">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            <polyline points="9 12 11 14 15 10"/>
          </svg>
        </div>
        <span className="text-green-700 font-extrabold text-sm tracking-wide uppercase">Certificado Válido</span>
        <p className="text-gray-400 text-xs mt-1">Verificado por nauu.art</p>
      </div>

      {/* Cartão principal */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 max-w-lg w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gray-900 px-6 py-4 flex items-center justify-between">
          <span className="text-white font-extrabold text-lg tracking-tight">nauu.art</span>
          <span className="text-gray-400 text-xs font-medium tracking-widest uppercase">Certificado de Autenticidade</span>
        </div>

        {/* Linha dourada */}
        <div className="h-0.5 bg-amber-400" />

        <div className="p-6">
          <div className="flex gap-5">
            {/* Imagem */}
            {imageUrl && (
              <div className="flex-shrink-0">
                <img
                  src={imageUrl}
                  alt={cert.artwork.title}
                  className="w-28 h-28 object-cover rounded-xl border border-gray-100"
                />
              </div>
            )}

            {/* Detalhes da obra */}
            <div className="flex-1 min-w-0">
              <h1 className="font-extrabold text-gray-900 text-lg leading-tight mb-1 tracking-tight">
                {cert.artwork?.title}
              </h1>
              <p className="text-amber-600 font-bold text-sm mb-3">{cert.artist?.name}</p>

              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                {cert.artwork?.technique && (
                  <div>
                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Técnica</p>
                    <p className="text-sm font-medium text-gray-700">{cert.artwork.technique}</p>
                  </div>
                )}
                {cert.artwork?.dimensions && (
                  <div>
                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Dimensões</p>
                    <p className="text-sm font-medium text-gray-700">{cert.artwork.dimensions}</p>
                  </div>
                )}
                {cert.artwork?.yearCreated && (
                  <div>
                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Ano</p>
                    <p className="text-sm font-medium text-gray-700">{cert.artwork.yearCreated}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Separador */}
          <div className="border-t border-gray-100 my-4" />

          {/* Info de aquisição */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Data de aquisição</p>
              <p className="text-sm font-medium text-gray-700">{date}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Certificado N.º</p>
              <p className="text-xs font-mono text-gray-600 break-all">{cert.certificateId.toUpperCase()}</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 border-t border-gray-100 px-6 py-3">
          <p className="text-xs text-gray-400 text-center leading-relaxed">
            Este certificado garante que a obra é um original único adquirido através da plataforma nauu.art.
          </p>
        </div>
      </div>

      <a href="https://nauu.art" className="mt-6 text-xs text-gray-400 hover:text-gray-600 transition-colors">
        nauu.art — Arte original, do artista para ti
      </a>
    </div>
  )
}
