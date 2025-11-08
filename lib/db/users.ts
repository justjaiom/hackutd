import { createClient } from '@/lib/supabase/server'

export interface UserProfile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  company_name: string | null
  role: string
  onboarding_completed: boolean
  created_at: string
  updated_at: string
}

/**
 * Get the current user's profile
 */
export async function getCurrentUserProfile(): Promise<UserProfile | null> {
  try {
    const supabase = await createClient()
    
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return null
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error || !profile) {
      return null
    }

    return profile as UserProfile
  } catch (error) {
    console.error('Error getting user profile:', error)
    return null
  }
}

/**
 * Update user profile
 */
export async function updateUserProfile(
  userId: string,
  updates: Partial<UserProfile>
): Promise<UserProfile | null> {
  try {
    const supabase = await createClient()

    const { data: profile, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()

    if (error || !profile) {
      console.error('Error updating profile:', error)
      return null
    }

    return profile as UserProfile
  } catch (error) {
    console.error('Error updating user profile:', error)
    return null
  }
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    return !!user
  } catch (error) {
    return false
  }
}

/**
 * Get user's companies
 */
export async function getUserCompanies(userId: string) {
  try {
    const supabase = await createClient()

    const { data: companies, error } = await supabase
      .from('companies')
      .select('*')
      .eq('owner_id', userId)

    if (error) {
      console.error('Error getting user companies:', error)
      return []
    }

    return companies || []
  } catch (error) {
    console.error('Error getting user companies:', error)
    return []
  }
}

