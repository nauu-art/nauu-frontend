'use client'
import { useAuth } from '../../../../context/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import DashboardNav from '../../../../components/ui/DashboardNav'
import MessagesInbox from '../../../../components/ui/MessagesInbox'
import { useParams } from 'next/navigation'

export default function DashboardConversationPage() {
  const { isLoggedIn, loading } = useAuth()
  const router = useRouter()
  const { id } = useParams()

  useEffect(() => {
    if (!loading && !isLoggedIn) router.push('/login')
  }, [loading, isLoggedIn])

  if (loading) return null

  return (
    <div className="flex min-h-screen">
      <DashboardNav />
      <div className="flex-1 md:ml-52" style={{height: '100vh'}}>
        <MessagesInbox basePath="/dashboard/messages" selectedId={id} />
      </div>
    </div>
  )
}
