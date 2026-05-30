export default async function sitemap() {
  const baseUrl = 'https://nauu.art'

  // Páginas estáticas
  const staticPages = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${baseUrl}/explore`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/artists`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/how-it-works`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/feedback`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
    { url: `${baseUrl}/donate`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
  ]

  // Obras e artistas dinâmicos
  let artworkPages = []
  let artistPages = []

  try {
    const [artworksRes, artistsRes] = await Promise.all([
      fetch(`http://localhost:3001/api/artworks?limit=500`),
      fetch(`http://localhost:3001/api/artists?limit=500`),
    ])

    if (artworksRes.ok) {
      const artworks = await artworksRes.json()
      artworkPages = (artworks.data || []).map(w => ({
        url: `${baseUrl}/artwork/${w.id}`,
        lastModified: new Date(w.updatedAt || w.createdAt),
        changeFrequency: 'weekly',
        priority: 0.7,
      }))
    }

    if (artistsRes.ok) {
      const artists = await artistsRes.json()
      artistPages = (artists.data || []).map(a => ({
        url: `${baseUrl}/${a.username}`,
        lastModified: new Date(a.createdAt),
        changeFrequency: 'weekly',
        priority: 0.8,
      }))
    }
  } catch {}

  return [...staticPages, ...artworkPages, ...artistPages]
}
