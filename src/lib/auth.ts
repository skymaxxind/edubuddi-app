'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from './supabase'
import type { Profile } from '@/types/database'
import type { User } from '@supabase/supabase-js'

export function useAuth(requiredRole?: 'employee' | 'manager' | 'admin') {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        router.push('/login')
        return
      }

      setUser(session.user)

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single()

      if (profileData) {
        setProfile(profileData as Profile)

        if (requiredRole) {
          const roleHierarchy: Record<string, number> = { employee: 0, manager: 1, admin: 2 }
          if ((roleHierarchy[profileData.role] ?? 0) < (roleHierarchy[requiredRole] ?? 0)) {
            router.push('/dashboard')
            return
          }
        }
      }

      setLoading(false)
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.push('/login')
      } else {
        setUser(session.user)
      }
    })

    return () => subscription.unsubscribe()
  }, [router, requiredRole])

  const signOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return { user, profile, loading, signOut }
}
