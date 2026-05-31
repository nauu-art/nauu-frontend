'use client'
import { useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '../../../../context/AuthContext'
import DashboardNav from '../../../../components/ui/DashboardNav'
import MessagesInbox from '../../../../components/ui/MessagesInbox'

export default function DashboardMessagePage() {
  const { isLoggedIn, isArtist, loading } = useAuth()
  const router = useRouter()
  const { id } = useParams()
  useEffect(() => {
    if (!loading && !isLoggedIn) router.push('/login')
    if (!loading && !isArtist) router.push('/')
  }, [loading, isLoggedIn, isArtist])
  if (loading) return null
  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <DashboardNav />
      <div className="flex-1 pt-14 md:pt-0" style={{height: '100vh'}}>
        <MessagesInbox basePath="/dashboard/messages" selectedId={id} />
      </div>
    </div>
  )
}
