'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../../context/AuthContext'
import PostsManager from '../../../components/ui/PostsManager'

export default function UserPostsPage() {
  const { isLoggedIn, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !isLoggedIn) router.push('/login')
  }, [loading, isLoggedIn])

  if (loading) return null

  return (
    <div className="p-5 md:p-8 max-w-3xl">
      <PostsManager apiBase="/posts-generic" showNewsletter={false} />
    </div>
  )
}
