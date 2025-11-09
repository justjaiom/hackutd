export interface Project {
	id: string
	company_id: string
	name: string
	description?: string | null
	status?: 'active' | 'archived' | 'completed' | 'on_hold'
	stage?: 'ideation' | 'planning' | 'development' | 'testing' | 'launch' | 'maintenance' | 'retirement'
	methodology?: 'agile' | 'scrum' | 'kanban' | 'waterfall' | 'lean' | 'devops' | 'hybrid'
	lifecycle_stage?: 'early' | 'growth' | 'mature' | 'declining'
	created_by?: string | null
	created_at: string
	updated_at: string
}

export type ProjectId = Project['id']
