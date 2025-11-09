"use client"

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSupabaseAuth } from '@/lib/hooks/useSupabaseAuth'
import Board from '@/components/Board/Board'
import DocFiles from '@/components/KnowledgeHub/DocFiles'
import Repositories from '@/components/KnowledgeHub/Repositories'
import Architecture from '@/components/KnowledgeHub/Architecture'
import Recordings from '@/components/KnowledgeHub/Recordings'
import Transcripts from '@/components/KnowledgeHub/Transcripts'
import { Project } from '@/types/board'
import { FileText, Building2, GitBranch, ServerCog, Video, MessageSquare, ListTodo, BookOpen, Layers, BarChart3, Trash2 } from 'lucide-react'

type SectionKey = 'company' | 'knowledge' | 'meetings' | 'work'
type KnowledgeSub = 'docs' | 'repos' | 'architecture'
type MeetingsSub = 'recordings' | 'transcripts' | 'actions' | 'decisions'
type WorkSub = 'epics' | 'kanban' | 'reports'

export default function ProjectPage() {
	const params = useParams()
	const router = useRouter()
	const { user, isLoading: isAuthLoading } = useSupabaseAuth()
	const projectId = params?.projectId as string
		const [project, setProject] = useState<Project | null>(null)
		const [company, setCompany] = useState<any | null>(null)
		const [isSavingProfile, setIsSavingProfile] = useState(false)
		const [companyDescription, setCompanyDescription] = useState('')
		const [companyWebsite, setCompanyWebsite] = useState('')
		const [projectContext, setProjectContext] = useState('')
	const [isLoading, setIsLoading] = useState(true)
	const [section, setSection] = useState<SectionKey>('company')
	const [knowledgeSub, setKnowledgeSub] = useState<KnowledgeSub>('docs')
	const [meetingsSub, setMeetingsSub] = useState<MeetingsSub>('recordings')
	const [workSub, setWorkSub] = useState<WorkSub>('kanban')
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
	const [isDeleting, setIsDeleting] = useState(false)

	// Authentication check
	useEffect(() => {
		if (!isAuthLoading && !user) {
			router.replace('/signin')
		}
	}, [user, isAuthLoading, router])

	useEffect(() => {
		if (!projectId || !user) return
		fetchProject()
	}, [projectId, user])

		const fetchProject = async () => {
			try {
				const res = await fetch(`/api/projects/${projectId}`)
				if (res.ok) {
					const data = await res.json()
					setProject(data.project || null)
					setCompany(data.company || null)
					setCompanyDescription(data.company?.description || '')
					setCompanyWebsite(data.company?.settings?.website || '')
					setProjectContext(data.project?.metadata?.context || '')
				}
			} catch (e) {
				console.error('Error loading project', e)
			} finally {
				setIsLoading(false)
			}
		}

	const handleDeleteProject = async () => {
		if (!projectId) return
		
		console.log('Starting delete for project:', projectId)
		setIsDeleting(true)
		try {
			const res = await fetch(`/api/projects/${projectId}`, {
				method: 'DELETE',
			})
			
			console.log('Delete response status:', res.status)
			
			if (res.ok) {
				console.log('Delete successful, navigating to dashboard')
				// Redirect to dashboard after successful deletion
				router.push('/dashboard')
				// Also trigger a refresh to ensure the dashboard updates
				router.refresh()
			} else {
				const errorData = await res.json()
				console.error('Failed to delete project:', errorData)
				alert('Failed to delete project. Please try again.')
				setIsDeleting(false)
				setShowDeleteConfirm(false)
			}
		} catch (error) {
			console.error('Error deleting project:', error)
			alert('An error occurred while deleting the project.')
			setIsDeleting(false)
			setShowDeleteConfirm(false)
		}
	}

	const renderContent = () => {
		if (!project) {
			return <div className="text-sm text-gray-500">Project not found.</div>
		}

		switch (section) {
					case 'company':
						return (
							<div className="space-y-6">
								<h2 className="text-xl font-semibold flex items-center gap-2"><Building2 className="h-5 w-5" /> Company Profile & Context</h2>
								<form
									onSubmit={async (e) => {
										e.preventDefault()
										setIsSavingProfile(true)
										try {
											const res = await fetch(`/api/projects/${projectId}`, {
												method: 'PATCH',
												headers: { 'Content-Type': 'application/json' },
												body: JSON.stringify({
													company: { description: companyDescription, website: companyWebsite },
													project: { metadata: { context: projectContext } },
												}),
											})
											if (res.ok) {
												const data = await res.json()
												setCompanyDescription(data.company?.description || '')
												setCompanyWebsite(data.company?.settings?.website || '')
												setProjectContext(data.project?.metadata?.context || '')
											} else {
												console.error('Failed to save profile section')
											}
										} catch (err) {
											console.error('Save error', err)
										} finally {
											setIsSavingProfile(false)
										}
									}}
									className="space-y-6"
								>
									<div className="grid gap-4 md:grid-cols-2">
												<div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
													<h3 className="text-sm font-medium text-gray-800 mb-2">Description</h3>
													<textarea
														placeholder="Company / product description"
														value={companyDescription}
														onChange={(e) => setCompanyDescription(e.target.value)}
														className="w-full h-32 rounded-md border border-gray-300 bg-white p-2 text-sm text-black outline-none focus:border-blue-500"
													/>
												</div>
										<div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
											<h3 className="text-sm font-medium text-gray-800 mb-2">Website</h3>
											<input
												placeholder="https://"
												value={companyWebsite}
												onChange={(e) => setCompanyWebsite(e.target.value)}
												className="w-full rounded-md border border-gray-300 bg-white p-2 text-sm text-black outline-none focus:border-blue-500"
											/>
										</div>
									</div>
									<div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
										<h3 className="text-sm font-medium text-gray-800 mb-2">Context / Notes</h3>
										<textarea
											placeholder="Strategic goals, market context, team overview..."
											value={projectContext}
											onChange={(e) => setProjectContext(e.target.value)}
											className="w-full h-40 rounded-md border border-gray-300 bg-white p-2 text-sm text-black outline-none focus:border-blue-500"
										/>
									</div>
									<div className="flex justify-end">
										<button
											type="submit"
											disabled={isSavingProfile}
											className="px-4 py-2 rounded-md bg-blue-500 text-white text-sm font-semibold disabled:opacity-50"
										>
											{isSavingProfile ? 'Saving...' : 'Save Changes'}
										</button>
									</div>
								</form>
							</div>
						)
			case 'knowledge':
				return (
					<div className="space-y-6">
						<div className="flex gap-2 flex-wrap">
							{[
								{ key: 'docs', label: 'Docs & Files', icon: FileText },
								{ key: 'repos', label: 'Repositories / Code', icon: GitBranch },
								{ key: 'architecture', label: 'Tech Architecture', icon: ServerCog }
							].map(item => (
								<button
									key={item.key}
									onClick={() => setKnowledgeSub(item.key as KnowledgeSub)}
									className={`flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm ${knowledgeSub === item.key ? 'border-blue-500 bg-blue-500/10 text-blue-700' : 'border-gray-200 hover:bg-gray-50 text-gray-700'}`}
								>
									<item.icon className="h-4 w-4" /> {item.label}
								</button>
							))}
					</div>
					{knowledgeSub === 'docs' && <DocFiles projectId={projectId} />}
					{knowledgeSub === 'repos' && <Repositories projectId={projectId} />}
					{knowledgeSub === 'architecture' && <Architecture projectId={projectId} />}
				</div>
				)
			case 'meetings':
				return (
					<div className="space-y-6">
						<div className="flex gap-2 flex-wrap">
							{[
								{ key: 'recordings', label: 'Recordings', icon: Video },
								{ key: 'transcripts', label: 'Transcripts & Notes', icon: MessageSquare },
								{ key: 'actions', label: 'Action Items', icon: ListTodo },
								{ key: 'decisions', label: 'Decision Log', icon: BookOpen }
							].map(item => (
								<button
									key={item.key}
									onClick={() => setMeetingsSub(item.key as MeetingsSub)}
									className={`flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm ${meetingsSub === item.key ? 'border-blue-500 bg-blue-500/10 text-blue-700' : 'border-gray-200 hover:bg-gray-50 text-gray-700'}`}
								>
									<item.icon className="h-4 w-4" /> {item.label}
								</button>
							))}
						</div>
						{meetingsSub === 'recordings' && <Recordings projectId={projectId} />}
						{meetingsSub === 'transcripts' && <Transcripts projectId={projectId} />}
						{meetingsSub === 'actions' && (
							<div className="rounded-lg border border-gray-800 bg-gray-900/40 p-4 min-h-64">
								<p className="text-sm text-gray-400">Track follow-up action items extracted from meetings.</p>
							</div>
						)}
						{meetingsSub === 'decisions' && (
							<div className="rounded-lg border border-gray-800 bg-gray-900/40 p-4 min-h-64">
								<p className="text-sm text-gray-400">Log architectural & product decisions with rationale.</p>
							</div>
						)}
					</div>
				)
			case 'work':
				return (
					<div className="space-y-6">
						<div className="flex gap-2 flex-wrap">
							{[
								{ key: 'epics', label: 'Epics', icon: Layers },
								{ key: 'kanban', label: 'Sprints / Kanban', icon: ListTodo },
								{ key: 'reports', label: 'Reports & Insights', icon: BarChart3 }
							].map(item => (
								<button
									key={item.key}
									onClick={() => setWorkSub(item.key as WorkSub)}
									className={`flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm ${workSub === item.key ? 'border-blue-500 bg-blue-500/10 text-blue-700' : 'border-gray-200 hover:bg-gray-50 text-gray-700'}`}
								>
									<item.icon className="h-4 w-4" /> {item.label}
								</button>
							))}
						</div>
						<div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
							{workSub === 'epics' && <p className="text-sm text-gray-600">Manage Epics (placeholder).</p>}
							{workSub === 'kanban' && (
								<div className="h-[70vh] rounded-lg border border-gray-200 bg-white p-4">
									<Board projectId={projectId} light />
								</div>
							)}
							{workSub === 'reports' && <p className="text-sm text-gray-600">Velocity, burndown, tension insights (placeholder).</p>}
						</div>
					</div>
				)
			default:
				return null
		}
	}

	return (
		<div className="min-h-screen bg-white text-black">
			<div className="border-b border-gray-200 bg-white/60 backdrop-blur-sm">
				<div className="mx-auto flex max-w-7xl items-center justify-between p-5">
					<div>
						<button onClick={() => router.push('/dashboard')} className="text-xs text-gray-600 hover:text-gray-800">← Back</button>
						<h1 className="mt-1 text-2xl font-bold text-black">{project?.name || 'Project'}</h1>
						{project?.description && <p className="mt-1 text-sm text-gray-600 line-clamp-1">{project.description}</p>}
					</div>
					<div className="flex gap-2 items-center">
						{[
							{ key: 'company', label: 'Company Context' },
							{ key: 'knowledge', label: 'Knowledge Hub' },
							{ key: 'meetings', label: 'Meetings & Comms' },
							{ key: 'work', label: 'Work Board' }
						].map(item => (
							<button
								key={item.key}
								onClick={() => setSection(item.key as SectionKey)}
								className={`rounded-md border px-3 py-2 text-sm ${section === item.key ? 'border-blue-500 bg-blue-500/10 text-blue-700' : 'border-gray-200 hover:bg-gray-50 text-gray-700'}`}
							>
								{item.label}
							</button>
						))}
						<button
							onClick={() => setShowDeleteConfirm(true)}
							className="rounded-md border border-red-200 px-3 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
							title="Delete Project"
						>
							<Trash2 className="h-4 w-4" />
							Delete
						</button>
					</div>
				</div>
			</div>
			<main className="mx-auto max-w-7xl p-6">
				{(isLoading || isAuthLoading) ? (
					<div className="flex items-center justify-center py-24">
						<div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
					</div>
				) : !user ? null : (
					renderContent()
				)}
			</main>

			{/* Delete Confirmation Modal */}
			{showDeleteConfirm && (
				<div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
					<div className="bg-white rounded-xl border border-gray-200 max-w-md w-full p-6 shadow-2xl">
						<div className="flex items-start gap-4">
							<div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
								<Trash2 className="w-5 h-5 text-red-600" />
							</div>
							<div className="flex-1">
								<h3 className="text-lg font-semibold text-gray-900 mb-2">
									Delete Project?
								</h3>
								<p className="text-sm text-gray-600 mb-4">
									Are you sure you want to delete "<strong>{project?.name}</strong>"? This action cannot be undone and will permanently delete all tasks, files, and data associated with this project.
								</p>
								<div className="flex gap-3 justify-end">
									<button
										onClick={() => setShowDeleteConfirm(false)}
										disabled={isDeleting}
										className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-900 rounded-lg transition-colors disabled:opacity-50"
									>
										Cancel
									</button>
									<button
										onClick={handleDeleteProject}
										disabled={isDeleting}
										className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
									>
										{isDeleting ? (
											<>
												<div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
												Deleting...
											</>
										) : (
											<>
												<Trash2 className="w-4 h-4" />
												Delete Project
											</>
										)}
									</button>
								</div>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	)
}

