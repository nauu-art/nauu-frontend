const BASE_URL = 'https://nauu.art'

export async function generateMetadata({ params }) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/artist-collections/collection/${params.id}`, { next: { revalidate: 60 } })
    if (!res.ok) return { title: { absolute: 'Coleção | nauu.art' } }
    const col = await res.json()
    const title = `${col.name} — Coleção de ${col.artist?.artistName} | nauu.art`
    const description = col.description?.slice(0, 160) || `Coleção de arte de ${col.artist?.artistName}`
    const image = col.coverImageUrl ? `${BASE_URL}${col.coverImageUrl}` : `${BASE_URL}/og-default.jpg`
    return { title, description, openGraph: { title, description, images: [{ url: image }] } }
  } catch { return { title: { absolute: 'Coleção | nauu.art' } } }
}

export default function CollectionLayout({ children }) {
  return children
}
