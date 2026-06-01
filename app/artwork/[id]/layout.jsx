const BASE_URL = 'https://nauu.art'

export async function generateMetadata({ params }) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/artworks/${params.id}`, { next: { revalidate: 60 } })
    if (!res.ok) return { title: { absolute: 'Obra | nauu.art' } }
    const artwork = await res.json()
    const title = `${artwork.title} — ${artwork.artist?.artistName || ''}`
    const description = artwork.description?.slice(0, 160) || `Obra original de ${artwork.artist?.artistName}.`
    const image = artwork.images?.[0]?.imageUrl ? `${BASE_URL}${artwork.images[0].imageUrl}` : `${BASE_URL}/og-default.jpg`
    return {
      title: { absolute: title }, description,
      openGraph: { title, description, url: `${BASE_URL}/artwork/${params.id}`, images: [{ url: image, width: 1200, height: 630 }], type: 'website' },
      twitter: { card: 'summary_large_image', title, description, images: [image] },
    }
  } catch { return { title: { absolute: 'Obra | nauu.art' } } }
}

export default function ArtworkLayout({ children }) {
  return children
}
