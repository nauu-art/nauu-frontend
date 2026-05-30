import Link from 'next/link'

async function getContent() {
  try {
    const res = await fetch('http://localhost:3001/api/admin/content/termos', {
      next: { revalidate: 300 }
    })
    if (res.ok) return await res.json()
  } catch {}
  return null
}

export const metadata = { title: 'Termos de Uso | nauu.art' }

export default async function TermosPage() {
  const data = await getContent()

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-10 py-16">
        <div className="mb-10">
          <div className="text-xs font-extrabold uppercase tracking-widest text-blue-400 mb-2">Legal</div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 mb-2" style={{letterSpacing:'-0.03em'}}>
            {data?.title || 'Termos de Uso'}
          </h1>
          <p className="text-sm text-gray-400 font-medium">Última atualização: Maio 2026</p>
        </div>
        <div className="prose prose-sm max-w-none text-gray-600 whitespace-pre-wrap leading-relaxed">
          {data?.content || 'Conteúdo em breve.'}
        </div>
        <div className="mt-12 pt-8 border-t border-gray-100 flex gap-4">
          <Link href="/privacidade" className="text-sm font-bold text-blue-500 hover:text-blue-600">Política de Privacidade →</Link>
          <Link href="/feedback" className="text-sm font-bold text-gray-400 hover:text-gray-600">Contactar</Link>
        </div>
      </div>
    </div>
  )
}
