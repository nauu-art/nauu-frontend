'use client'
import { useState, useEffect } from 'react'
import { Heart } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import api from '../../lib/api'
import toast from 'react-hot-toast'

export default function FavoriteButton({ artworkId, className = '', size = 16 }) {
  const { isLoggedIn } = useAuth()
  const [faved, setFaved] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!isLoggedIn) return
    api.get('/favorites').then(res => {
      const favs = res.data || []
      setFaved(favs.some(f => f.id === artworkId))
    }).catch(() => {})
  }, [isLoggedIn, artworkId])

  const toggle = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!isLoggedIn) { toast.error('Faz login para guardar favoritos'); return }
    if (loading) return
    setLoading(true)
    try {
      if (faved) {
        await api.delete(`/favorites/${artworkId}`)
        setFaved(false)
        toast.success('Removido dos favoritos')
      } else {
        await api.post(`/favorites/${artworkId}`)
        setFaved(true)
        toast.success('Guardado nos favoritos! ❤️')
      }
    } catch { toast.error('Erro') }
    setLoading(false)
  }

  return (
    <button onClick={toggle} disabled={loading}
      className={`flex items-center justify-center w-8 h-8 rounded-full transition-all ${faved ? 'bg-red-500 text-white' : 'bg-white/90 text-gray-400 hover:text-red-500'} shadow-sm ${className}`}>
      <Heart size={size} fill={faved ? 'currentColor' : 'none'} />
    </button>
  )
}
