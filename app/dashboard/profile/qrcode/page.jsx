'use client'
import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../../../context/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Download, ArrowLeft } from 'lucide-react'
import api from '../../../../lib/api'

export default function QRCodePage() {
  const { user, isArtist, isLoggedIn, loading } = useAuth()
  const router = useRouter()
  const canvasRef = useRef()
  const [profile, setProfile] = useState(null)
  const [qrGenerated, setQrGenerated] = useState(false)

  useEffect(() => {
    if (!loading && !isLoggedIn) router.push('/login')
    if (!loading && !isArtist) router.push('/')
  }, [loading, isLoggedIn, isArtist])

  useEffect(() => {
    if (isArtist && user) {
      api.get('/auth/me').then(res => setProfile(res.data.artistProfile)).catch(() => {})
    }
  }, [isArtist, user])

  useEffect(() => {
    if (profile?.username && canvasRef.current) {
      import('qrcode').then(QRCode => {
        const url = `https://nauu.art/${profile.username}`
        QRCode.toCanvas(canvasRef.current, url, {
          width: 280,
          margin: 2,
          color: { dark: '#1A1A2E', light: '#FFFFFF' }
        }, () => setQrGenerated(true))
      })
    }
  }, [profile])

  const handleDownload = () => {
    if (!canvasRef.current) return
    const link = document.createElement('a')
    link.download = `nauu-art-${profile?.username}.png`
    link.href = canvasRef.current.toDataURL()
    link.click()
  }

  if (loading || !user) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" /></div>

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-sm w-full">
        <Link href="/dashboard/profile" className="flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-gray-600 mb-6">
          <ArrowLeft size={15} /> Voltar ao perfil
        </Link>

        <div className="bg-white border border-gray-100 rounded-2xl p-8 text-center">
          <img src="/logo.svg" alt="nauu.art" className="h-7 w-auto mx-auto mb-6 opacity-70" />

          <div className="flex justify-center mb-4">
            <div className="p-3 border border-gray-100 rounded-xl">
              <canvas ref={canvasRef} />
            </div>
          </div>

          <div className="text-sm font-bold text-gray-900 mb-1">{profile?.artistName}</div>
          <div className="text-xs text-blue-500 font-semibold mb-6">nauu.art/{profile?.username}</div>

          <p className="text-xs text-gray-400 font-medium mb-6 leading-relaxed">
            Partilha este QR code em exposições, cartões de visita ou redes sociais para que as pessoas acedam diretamente ao teu perfil.
          </p>

          {qrGenerated && (
            <button onClick={handleDownload}
              className="w-full flex items-center justify-center gap-2 py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold text-sm rounded-xl transition-colors">
              <Download size={16} /> Descarregar QR Code
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
