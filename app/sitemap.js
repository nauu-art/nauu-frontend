const BASE_URL = 'https://nauu.art'
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export default async function sitemap() {
  const staticPages = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${BASE_URL}/explore`, lastModified: new Date(), changeFrequency: 'hourly', priority: 0.9 },
    { url: `${BASE_URL}/artists`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${BASE_URL}/curated`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE_URL}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
  ]

  try {
    // Obras
    const artworksRes = await fetch(`${API_URL}/api/artworks?limit=500`, { next: { revalidate: 3600 } })
    const artworksData = await artworksRes.json()
    const artworkPages = (artworksData.data || []).map(w => ({
      url: `${BASE_URL}/artwork/${w.id}`,
      lastModified: new Date(w.updatedAt || w.createdAt),
      changeFrequency: 'weekly',
      priority: 0.8,
    }))

    // Artistas
    const artistsRes = await fetch(`${API_URL}/api/artists?limit=500`, { next: { revalidate: 3600 } })
    const artistsData = await artistsRes.json()
    const artistPages = (artistsData.data || []).map(a => ({
      url: `${BASE_URL}/${a.username}`,
      lastModified: new Date(a.updatedAt || a.createdAt),
      changeFrequency: 'weekly',
      priority: 0.7,
    }))

    return [...staticPages, ...artworkPages, ...artistPages]
  } catch {
    return staticPages
  }
}
