export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
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
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          company_name?: string | null
          role?: string
          onboarding_completed?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          company_name?: string | null
          role?: string
          onboarding_completed?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      companies: {
        Row: {
          id: string
          name: string
          description: string | null
          logo_url: string | null
          owner_id: string
          settings: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          logo_url?: string | null
          owner_id: string
          settings?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          logo_url?: string | null
          owner_id?: string
          settings?: Json
          created_at?: string
          updated_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          company_id: string
          name: string
          description: string | null
          status: string
          settings: Json
          metadata: Json
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          name: string
          description?: string | null
          status?: string
          settings?: Json
          metadata?: Json
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          name?: string
          description?: string | null
          status?: string
          settings?: Json
          metadata?: Json
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      tasks: {
        Row: {
          id: string
          project_id: string
          title: string
          description: string | null
          status: string
          priority: string
          assignee_id: string | null
          due_date: string | null
          estimated_effort: number | null
          actual_effort: number | null
          dependencies: string[]
          metadata: Json
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          title: string
          description?: string | null
          status?: string
          priority?: string
          assignee_id?: string | null
          due_date?: string | null
          estimated_effort?: number | null
          actual_effort?: number | null
          dependencies?: string[]
          metadata?: Json
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          title?: string
          description?: string | null
          status?: string
          priority?: string
          assignee_id?: string | null
          due_date?: string | null
          estimated_effort?: number | null
          actual_effort?: number | null
          dependencies?: string[]
          metadata?: Json
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      agents: {
        Row: {
          id: string
          project_id: string
          agent_type: string
          name: string
          status: string
          configuration: Json
          last_active_at: string | null
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          agent_type: string
          name: string
          status?: string
          configuration?: Json
          last_active_at?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          agent_type?: string
          name?: string
          status?: string
          configuration?: Json
          last_active_at?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
      }
      tensions: {
        Row: {
          id: string
          company_id: string
          project_id: string | null
          title: string
          description: string | null
          status: string
          priority: string
          detected_by_agent_id: string | null
          resolved_at: string | null
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          project_id?: string | null
          title: string
          description?: string | null
          status?: string
          priority?: string
          detected_by_agent_id?: string | null
          resolved_at?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          project_id?: string | null
          title?: string
          description?: string | null
          status?: string
          priority?: string
          detected_by_agent_id?: string | null
          resolved_at?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}

