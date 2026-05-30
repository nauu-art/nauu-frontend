import './globals.css'
import { AuthProvider } from '../context/AuthContext'
import { LocaleProvider } from '../context/LocaleContext'
import Navbar from '../components/layout/Navbar'
import BottomNav from '../components/layout/BottomNav'
import PWAInstall from '../components/PWAInstall'
import Footer from '../components/layout/Footer'
import { Toaster } from 'react-hot-toast'

export const metadata = {
  metadataBase: new URL('https://nauu.art'),
  title: { default: 'nauu.art — Arte original, do artista para ti', template: '%s | nauu.art' },
  description: 'Descobre obras únicas de artistas portugueses e internacionais. Contacta diretamente quem as criou.',
  keywords: ['arte', 'artistas', 'obras de arte', 'pintura', 'fotografia', 'arte digital', 'marketplace arte', 'arte portuguesa'],
  openGraph: {
    type: 'website', locale: 'pt_PT', url: 'https://nauu.art', siteName: 'nauu.art',
    title: 'nauu.art — Arte original, do artista para ti',
    description: 'Descobre obras únicas de artistas portugueses e internacionais.',
  },
  robots: { index: true, follow: true },
  icons: {
    icon: [
      { url: '/favicon-16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: '/icon-192.png',
  },
  alternates: { canonical: 'https://nauu.art' },
}

export default function RootLayout({ children }) {
  return (
    <html lang="pt">
      <link rel="manifest" href="/manifest.json" />
      <meta name="theme-color" content="#000000" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black" />
      <meta name="apple-mobile-web-app-title" content="nauu.art" />
      <link rel="apple-touch-icon" href="/icon-192.png" />
      <body>
        <LocaleProvider>
          <AuthProvider>
            <Toaster position="top-right" toastOptions={{ style: { fontFamily: 'Nunito', fontWeight: 600, fontSize: '14px' } }} />
            <Navbar />
            <main className="pb-20 md:pb-0">{children}</main>
            <Footer />
            <BottomNav />
            <PWAInstall />
          </AuthProvider>
        </LocaleProvider>
      </body>
    </html>
  )
}
