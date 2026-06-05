'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../../context/AuthContext'
import DashboardNav from '../../../components/ui/DashboardNav'
import PostsManager from '../../../components/ui/PostsManager'

export default function PostsPage() {
  const { isArtist, isLoggedIn, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !isLoggedIn) router.push('/login')
    if (!loading && !isArtist) router.push('/')
  }, [loading, isLoggedIn, isArtist])

  if (loading) return null

  return (
    <div className="flex min-h-screen bg-gray-50">
      <DashboardNav />
      <div className="flex-1 md:ml-52 p-5 md:p-8 max-w-3xl">
        <PostsManager apiBase="/posts" showNewsletter={true} />
      </div>
    </div>
  )
}
