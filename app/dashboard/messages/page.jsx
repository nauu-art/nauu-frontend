'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../../context/AuthContext'
import MessagesInbox from '../../../components/ui/MessagesInbox'
import DashboardNav from '../../../components/ui/DashboardNav'

export default function DashboardMessagesPage() {
  const { isLoggedIn, isArtist, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !isLoggedIn) router.push('/login')
    if (!loading && !isArtist) router.push('/account/messages')
  }, [loading, isLoggedIn, isArtist])

  return (
    <div className="flex min-h-screen">
      <DashboardNav />
      <div className="flex-1 md:ml-52 pt-14 md:pt-0" style={{height: '100vh'}}>
        <MessagesInbox basePath="/dashboard/messages" />
      </div>
    </div>
  )
}
