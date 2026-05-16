'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.push('/dashboard')
      } else {
        router.push('/login')
      }
    })
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-900">
      <div className="animate-pulse flex flex-col items-center gap-4">
        <div className="text-4xl font-bold text-white">ð EduBuddi</div>
        <div className="text-gray-400">Loading...</div>
      </div>
    </div>
  )
}
