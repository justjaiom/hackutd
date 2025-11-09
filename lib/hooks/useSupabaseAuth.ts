'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'

const supabase = createClient()

export function useSupabaseAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSigningOut, setIsSigningOut] = useState(false)

  const signOut = async () => {
    try {
      setIsSigningOut(true)
      
      // First, sign out on the client-side to immediately clear the state
      await supabase.auth.signOut()
      
      // Also call the server-side signout endpoint to ensure session cleanup
      const response = await fetch('/api/auth/signout', {
        method: 'POST',
      })
      
      if (!response.ok) {
        console.warn('Server-side signout failed, but client-side signout succeeded')
      }
      
      // Clear user state immediately
      setUser(null)
      setIsSigningOut(false)
      
      // Redirect to home page
      window.location.href = '/'
    } catch (error) {
      console.error('Error signing out:', error)
      // Even if there's an error, try to clear the state and redirect
      setUser(null)
      setIsSigningOut(false)
      window.location.href = '/'
    }
  }

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser()
        if (error) {
          console.warn('Auth error:', error.message)
          setUser(null)
        } else {
          setUser(user)
        }
      } catch (error) {
        console.error('Error fetching user:', error)
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, !!session?.user)
      
      if (event === 'SIGNED_OUT' || !session) {
        setUser(null)
      } else if (session?.user) {
        setUser(session.user)
      }
      
      setIsLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return { user, isLoading, signOut, isSigningOut }
}