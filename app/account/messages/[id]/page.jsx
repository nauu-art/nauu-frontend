'use client'
import { useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '../../../../context/AuthContext'
import MessagesInbox from '../../../../components/ui/MessagesInbox'

export default function MessagePage() {
  const { isLoggedIn, loading } = useAuth()
  const router = useRouter()
  const { id } = useParams()
  useEffect(() => { if (!loading && !isLoggedIn) router.push('/login') }, [loading, isLoggedIn])
  if (loading) return null
  return (
    <div style={{height: '100vh'}} className="flex flex-col">
      <MessagesInbox basePath="/account/messages" selectedId={id} />
    </div>
  )
}
