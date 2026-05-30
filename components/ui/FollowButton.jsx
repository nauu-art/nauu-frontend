'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import api from '../../lib/api'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import { useLocale } from '../../context/LocaleContext'

export default function FollowButton({ artistId, className = '' }) {
  const { isLoggedIn } = useAuth()
  const router = useRouter()
  const { t } = useLocale()
  const [following, setFollowing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!isLoggedIn || !artistId) return
    api.get(`/follow/check/${artistId}`)
      .then(res => setFollowing(res.data.following))
      .catch(() => {})
  }, [isLoggedIn, artistId])

  const toggle = async () => {
    if (!isLoggedIn) { router.push('/login'); return }
    if (loading) return
    setLoading(true)
    try {
      if (following) {
        await api.delete(`/follow/${artistId}`)
        setFollowing(false)
        toast.success('Deixaste de seguir')
      } else {
        await api.post(`/follow/${artistId}`)
        setFollowing(true)
        toast.success('A seguir! 🎨')
      }
    } catch { toast.error('Erro') }
    setLoading(false)
  }

  return (
    <button onClick={toggle} disabled={loading}
      className={`flex items-center gap-2 px-4 py-2 font-bold text-sm rounded-xl border-2 transition-all ${following ? 'border-blue-400 bg-blue-50 text-blue-600 hover:bg-red-50 hover:border-red-300 hover:text-red-500' : 'border-blue-500 bg-blue-500 text-white hover:bg-blue-600'} ${className}`}>
      {following ? '✓' : '+'} {following ? t('common.following') : t('common.follow')}
    </button>
  )
}
