'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../../context/AuthContext'
import MessagesInbox from '../../../components/ui/MessagesInbox'

export default function MessagesPage() {
  const { isLoggedIn, loading } = useAuth()
  const router = useRouter()
  useEffect(() => { if (!loading && !isLoggedIn) router.push('/login') }, [loading, isLoggedIn])
  if (loading) return null
  return (
    <div style={{height: '100vh'}} className="flex flex-col">
      <MessagesInbox basePath="/account/messages" />
    </div>
  )
}
