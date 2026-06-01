const BASE_URL = 'https://nauu.art'

export async function generateMetadata({ params }) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/artists/${params.username}`, { next: { revalidate: 60 } })
    if (!res.ok) return { title: 'Artista | nauu.art' }
    const artist = await res.json()
    const title = `${artist.artistName} — Artista`
    const description = artist.bio?.slice(0, 160) || `Descobre as obras de ${artist.artistName} no nauu.art.`
    const image = artist.user?.avatarUrl ? `${BASE_URL}${artist.user.avatarUrl}` : `${BASE_URL}/og-default.jpg`
    return {
      title, description,
      openGraph: { title, description, url: `${BASE_URL}/${params.username}`, images: [{ url: image }], type: 'profile' },
      twitter: { card: 'summary_large_image', title, description, images: [image] },
    }
  } catch { return { title: 'Artista | nauu.art' } }
}

export default function ArtistLayout({ children }) {
  return children
}
