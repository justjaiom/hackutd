import { createClient } from '@/lib/supabase/server'

export interface Company {
  id: string
  name: string
  description: string | null
  logo_url: string | null
  owner_id: string
  settings: Record<string, any>
  created_at: string
  updated_at: string
}

/**
 * Create a new company
 */
export async function createCompany(
  name: string,
  ownerId: string,
  description?: string
): Promise<Company | null> {
  try {
    const supabase = await createClient()

    const { data: company, error } = await supabase
      .from('companies')
      .insert({
        name,
        owner_id: ownerId,
        description: description || null,
      })
      .select()
      .single()

    if (error || !company) {
      console.error('Error creating company:', error)
      return null
    }

    return company as Company
  } catch (error) {
    console.error('Error creating company:', error)
    return null
  }
}

/**
 * Get company by ID
 */
export async function getCompany(companyId: string): Promise<Company | null> {
  try {
    const supabase = await createClient()

    const { data: company, error } = await supabase
      .from('companies')
      .select('*')
      .eq('id', companyId)
      .single()

    if (error || !company) {
      console.error('Error getting company:', error)
      return null
    }

    return company as Company
  } catch (error) {
    console.error('Error getting company:', error)
    return null
  }
}

/**
 * Get all companies for a user
 */
export async function getUserCompanies(userId: string): Promise<Company[]> {
  try {
    const supabase = await createClient()

    // Get companies where user is owner
    const { data: ownedCompanies, error: ownedError } = await supabase
      .from('companies')
      .select('*')
      .eq('owner_id', userId)

    if (ownedError) {
      console.error('Error getting owned companies:', ownedError)
    }

    // Get companies where user is a member
    const { data: memberCompanies, error: memberError } = await supabase
      .from('company_members')
      .select('companies(*)')
      .eq('user_id', userId)

    if (memberError) {
      console.error('Error getting member companies:', memberError)
    }

    const owned = (ownedCompanies || []) as Company[]
    const member = (memberCompanies || []).map((m: any) => m.companies) as Company[]

    // Combine and remove duplicates
    const allCompanies = [...owned, ...member]
    const uniqueCompanies = allCompanies.filter(
      (company, index, self) =>
        index === self.findIndex((c) => c.id === company.id)
    )

    return uniqueCompanies
  } catch (error) {
    console.error('Error getting user companies:', error)
    return []
  }
}

/**
 * Update company
 */
export async function updateCompany(
  companyId: string,
  updates: Partial<Company>
): Promise<Company | null> {
  try {
    const supabase = await createClient()

    const { data: company, error } = await supabase
      .from('companies')
      .update(updates)
      .eq('id', companyId)
      .select()
      .single()

    if (error || !company) {
      console.error('Error updating company:', error)
      return null
    }

    return company as Company
  } catch (error) {
    console.error('Error updating company:', error)
    return null
  }
}

