'use client'
import { usePathname } from 'next/navigation'
import Navbar from './Navbar'
import Footer from './Footer'
import BottomNav from './BottomNav'

export default function ConditionalLayout({ children }) {
  const pathname = usePathname()
  const isDashboard = pathname.startsWith('/dashboard') || pathname.startsWith('/admin') || pathname.startsWith('/onboarding')

  return (
    <>
      {!isDashboard && <Navbar />}
      <main className={isDashboard ? '' : 'pb-20 md:pb-0'}>{children}</main>
      {!isDashboard && <Footer />}
      {!isDashboard && <BottomNav />}
    </>
  )
}
