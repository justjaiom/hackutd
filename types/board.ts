export interface Task {
  id: string
  project_id: string
  title: string
  description?: string | null
  status: 'todo' | 'in_progress' | 'review' | 'done'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  task_type?: 'task' | 'bug' | 'feature' | 'epic' | 'story' | 'subtask' | 'improvement'
  workflow_state?: 'backlog' | 'todo' | 'in_progress' | 'in_review' | 'testing' | 'done' | 'blocked' | 'cancelled'
  assignee_id?: string | null
  assignee?: {
    id: string
    full_name?: string | null
    email: string
    avatar_url?: string | null
  }
  due_date?: string | null
  estimated_effort?: number | null
  actual_effort?: number | null
  story_points?: number | null
  time_spent?: number | null
  time_remaining?: number | null
  dependencies?: string[]
  labels?: string[]
  tags?: string[]
  blocked?: boolean
  blocked_reason?: string | null
  parent_task_id?: string | null
  sprint_id?: string | null
  epic_id?: string | null
  component?: string | null
  fix_version?: string | null
  resolution?: string | null
  metadata?: Record<string, any>
  created_by?: string | null
  created_at: string
  updated_at: string
  comments_count?: number
}

export interface BoardColumn {
  id: string
  title: string
  status: 'todo' | 'in_progress' | 'review' | 'done'
  color: string
}

export interface Project {
  id: string
  company_id: string
  name: string
  description?: string | null
  status: 'active' | 'archived' | 'completed' | 'on_hold'
  stage?: 'ideation' | 'planning' | 'development' | 'testing' | 'launch' | 'maintenance' | 'retirement'
  methodology?: 'agile' | 'scrum' | 'kanban' | 'waterfall' | 'lean' | 'devops' | 'hybrid'
  lifecycle_stage?: 'early' | 'growth' | 'mature' | 'declining'
  current_sprint?: string | null
  sprint_duration_days?: number
  health_score?: number | null
  completion_percentage?: number
  settings?: Record<string, any>
  metadata?: Record<string, any>
  created_by?: string | null
  created_at: string
  updated_at: string
}

export interface Epic {
  id: string
  project_id: string
  name: string
  description?: string | null
  status: 'active' | 'completed' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  start_date?: string | null
  end_date?: string | null
  created_by?: string | null
  created_at: string
  updated_at: string
}

export interface Sprint {
  id: string
  project_id: string
  name: string
  goal?: string | null
  start_date: string
  end_date: string
  status: 'planned' | 'active' | 'completed' | 'cancelled'
  created_by?: string | null
  created_at: string
  updated_at: string
}

