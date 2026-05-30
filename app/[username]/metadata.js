export async function generateMetadata({ params }) {
  try {
    const res = await fetch(`http://localhost:3001/api/artists/${params.username}`)
    if (!res.ok) return { title: 'Artista não encontrado' }
    const artist = await res.json()

    return {
      title: `${artist.artistName} — Artista`,
      description: artist.bio || `Descobre as obras de ${artist.artistName} no nauu.art.`,
      openGraph: {
        title: `${artist.artistName} — nauu.art`,
        description: artist.bio || `Descobre as obras de ${artist.artistName} no nauu.art.`,
        images: artist.user?.avatarUrl ? [{ url: artist.user.avatarUrl }] : [],
        type: 'profile',
      },
    }
  } catch {
    return { title: 'Artista | nauu.art' }
  }
}
