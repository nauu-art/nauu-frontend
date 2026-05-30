export async function generateMetadata({ params }) {
  try {
    const res = await fetch(`http://localhost:3001/api/artworks/${params.id}`)
    if (!res.ok) return { title: 'Obra não encontrada' }
    const artwork = await res.json()
    const image = artwork.images?.[0]?.imageUrl
    const price = artwork.priceOnRequest ? 'Preço sob consulta' : artwork.price ? `€ ${Number(artwork.price).toLocaleString('pt-PT')}` : ''

    return {
      title: `${artwork.title} — ${artwork.artist?.artistName}`,
      description: artwork.description || `${artwork.title} por ${artwork.artist?.artistName}. ${price}`,
      openGraph: {
        title: `${artwork.title} — ${artwork.artist?.artistName}`,
        description: artwork.description || `${artwork.title} por ${artwork.artist?.artistName}`,
        images: image ? [{ url: image, width: 1200, height: 630 }] : [],
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: `${artwork.title} — ${artwork.artist?.artistName}`,
        images: image ? [image] : [],
      },
    }
  } catch {
    return { title: 'Obra | nauu.art' }
  }
}
