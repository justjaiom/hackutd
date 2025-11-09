import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

type RouteContext = { params: { projectId: string } }

export async function GET(_request: Request, { params }: RouteContext) {
	try {
		const supabase = await createClient()
		// Minimal auth: if no user, return 401 (project page is gated in UI)
		const { data: userData } = await supabase.auth.getUser()
		if (!userData?.user) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		const { data: project, error: pErr } = await supabase
			.from('projects')
			.select('*')
			.eq('id', params.projectId)
			.single()

		if (pErr || !project) {
			return NextResponse.json({ error: 'Project not found' }, { status: 404 })
		}

		const { data: company } = await supabase
			.from('companies')
			.select('*')
			.eq('id', project.company_id)
			.single()

		return NextResponse.json({ project, company }, { status: 200 })
	} catch (error) {
		console.error('Get project error:', error)
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
	}
}

export async function PATCH(request: Request, { params }: RouteContext) {
	try {
		const supabase = await createClient()
		// Support bearer token for auth, fallback to cookies
		const authHeader = request.headers.get('Authorization')
		let user: any
		if (authHeader?.startsWith('Bearer ')) {
			const token = authHeader.slice(7)
			const { data, error } = await supabase.auth.getUser(token)
			if (!error && data.user) user = data.user
		}
		if (!user) {
			const { data } = await supabase.auth.getUser()
			if (data.user) user = data.user
		}
		if (!user) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		const body = await request.json()
		const { project: projectPatch, company: companyPatch } = body || {}

		// Load current records for merging JSON fields
		const { data: project, error: pErr } = await supabase
			.from('projects')
			.select('*')
			.eq('id', params.projectId)
			.single()
		if (pErr || !project) {
			return NextResponse.json({ error: 'Project not found' }, { status: 404 })
		}

		const { data: company, error: cErr } = await supabase
			.from('companies')
			.select('*')
			.eq('id', project.company_id)
			.single()
		if (cErr || !company) {
			return NextResponse.json({ error: 'Company not found' }, { status: 404 })
		}

		// Build updates
		let updatedProject = project
		if (projectPatch) {
			updatedProject = {
				...updatedProject,
				description: projectPatch.description ?? updatedProject.description,
				metadata: {
					...(updatedProject.metadata || {}),
					...(projectPatch.metadata || {}),
				},
			}
		}

		let updatedCompany = company
		if (companyPatch) {
			updatedCompany = {
				...updatedCompany,
				description: companyPatch.description ?? updatedCompany.description,
				settings: {
					...(updatedCompany.settings || {}),
					...(companyPatch.settings || {}),
				},
			}
			// Also map a plain 'website' field onto settings.website if provided
			if (typeof (companyPatch as any).website === 'string') {
				updatedCompany = {
					...updatedCompany,
					settings: { ...(updatedCompany.settings || {}), website: (companyPatch as any).website },
				}
			}
		}

		// Persist updates
		const updates: any[] = []
		if (projectPatch) {
			const { data: p } = await supabase
				.from('projects')
				.update({ description: updatedProject.description, metadata: updatedProject.metadata })
				.eq('id', params.projectId)
				.select()
				.single()
			if (p) updatedProject = p
		}
		if (companyPatch) {
			const { data: c } = await supabase
				.from('companies')
				.update({ description: updatedCompany.description, settings: updatedCompany.settings })
				.eq('id', company.id)
				.select()
				.single()
			if (c) updatedCompany = c
		}

		return NextResponse.json({ project: updatedProject, company: updatedCompany }, { status: 200 })
	} catch (error) {
		console.error('Update project/company error:', error)
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
	}
}

