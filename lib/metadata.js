const BASE_URL = 'https://nauu.art'

export function artworkMetadata(artwork) {
  const title = `${artwork.title} — ${artwork.artist?.artistName || ''} | nauu.art`
  const description = artwork.description
    ? artwork.description.slice(0, 160)
    : `Obra original de ${artwork.artist?.artistName}. ${artwork.price ? `€${artwork.price}` : 'Preço sob consulta'}.`
  const image = artwork.images?.[0]?.imageUrl
    ? `${BASE_URL}${artwork.images[0].imageUrl}`
    : `${BASE_URL}/og-default.jpg`

  return {
    title,
    description,
    openGraph: {
      title, description,
      url: `${BASE_URL}/artwork/${artwork.id}`,
      images: [{ url: image, width: 1200, height: 630, alt: artwork.title }],
      type: 'website',
    },
    twitter: { card: 'summary_large_image', title, description, images: [image] },
  }
}

export function artistMetadata(artist) {
  const name = artist.artistName || artist.username
  const title = `${name} — Artista | nauu.art`
  const description = artist.bio
    ? artist.bio.slice(0, 160)
    : `Descobre as obras de ${name} no nauu.art.`
  const image = artist.user?.avatarUrl
    ? `${BASE_URL}${artist.user.avatarUrl}`
    : `${BASE_URL}/og-default.jpg`

  return {
    title, description,
    openGraph: { title, description, url: `${BASE_URL}/${artist.username}`, images: [{ url: image }], type: 'profile' },
    twitter: { card: 'summary_large_image', title, description, images: [image] },
  }
}

export function collectionMetadata(collection) {
  const title = `${collection.name} — Coleção | nauu.art`
  const description = collection.description || `Coleção de arte no nauu.art`
  const image = collection.coverImageUrl ? `${BASE_URL}${collection.coverImageUrl}` : `${BASE_URL}/og-default.jpg`
  return {
    title, description,
    openGraph: { title, description, images: [{ url: image }] },
    twitter: { card: 'summary_large_image', title, description, images: [image] },
  }
}
