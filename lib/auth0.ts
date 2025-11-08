import { getSession } from '@auth0/nextjs-auth0'
import { createClient } from '@/lib/supabase/server'

export async function getAuth0User() {
  try {
    const session = await getSession()
    return session?.user || null
  } catch (error) {
    console.error('Error getting Auth0 user:', error)
    return null
  }
}

export async function getCurrentUserProfile() {
  try {
    const session = await getSession()
    if (!session?.user?.sub) {
      return null
    }

    const supabase = await createClient()
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('auth0_id', session.user.sub)
      .single()

    if (error || !profile) {
      return null
    }

    return profile
  } catch (error) {
    console.error('Error getting user profile:', error)
    return null
  }
}

export async function requireAuth() {
  const session = await getSession()
  if (!session?.user) {
    throw new Error('Unauthorized')
  }
  return session.user
}

