import { Suspense } from 'react'
import MapaClient from './MapaClient'

export const metadata = {
  title: 'Mapa de Artistas | nauu.art',
  description: 'Descobre artistas de todo o mundo no mapa do nauu.art.',
}

export default function MapaPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" /></div>}>
      <MapaClient />
    </Suspense>
  )
}
