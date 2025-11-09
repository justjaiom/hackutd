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
import ChatBot from '@/components/ChatBot'
import { Project } from '@/types/board'
import {
	FileText, Building2, GitBranch, ServerCog, Video,
	MessageSquare, ListTodo, BookOpen, Layers,
	BarChart3, Trash2
} from 'lucide-react'

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
	// Make description & website project-specific (not shared at company level)
	const [projectDescription, setProjectDescription] = useState('')
	const [projectWebsite, setProjectWebsite] = useState('')
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
		if (!isAuthLoading && !user) router.replace('/signin')
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
				// Pull description & website from the project (project-specific)
				setProjectDescription(data.project?.description || '')
				setProjectWebsite(data.project?.metadata?.website || '')
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
		setIsDeleting(true)
		try {
			const res = await fetch(`/api/projects/${projectId}`, { method: 'DELETE' })
			if (res.ok) {
				router.push('/dashboard')
				router.refresh()
			} else {
				alert('Failed to delete project. Please try again.')
			}
		} catch {
			alert('An error occurred while deleting the project.')
		} finally {
			setIsDeleting(false)
			setShowDeleteConfirm(false)
		}
	}

	const activeClass =
		'border-blue-700 bg-blue-50 text-blue-700 font-medium'
	const inactiveClass =
		'border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors'

	const renderContent = () => {
		if (!project) {
			return <div className="text-sm text-gray-500">Project not found.</div>
		}

		switch (section) {
			case 'company':
				return (
					<div className="space-y-4 sm:space-y-6">
						<h2 className="text-lg sm:text-xl font-semibold flex items-center gap-2 text-gray-900">
							<Building2 className="h-4 w-4 sm:h-5 sm:w-5 text-blue-700" /> Project Profile & Context
						</h2>
						<form
							onSubmit={async (e) => {
								e.preventDefault()
								setIsSavingProfile(true)
								try {
									const res = await fetch(`/api/projects/${projectId}`, {
										method: 'PATCH',
										headers: { 'Content-Type': 'application/json' },
										body: JSON.stringify({
											project: {
												description: projectDescription,
												metadata: { context: projectContext, website: projectWebsite },
											},
										}),
									})
									if (res.ok) {
										const data = await res.json()
										setProjectDescription(data.project?.description || '')
										setProjectWebsite(data.project?.metadata?.website || '')
										setProjectContext(data.project?.metadata?.context || '')
									}
								} catch (err) {
									console.error('Save error', err)
								} finally {
									setIsSavingProfile(false)
								}
							}}
							className="space-y-4 sm:space-y-6"
						>
							<div className="grid gap-4 grid-cols-1 md:grid-cols-2">
								<div className="rounded-lg border border-gray-200 bg-gray-50 p-3 sm:p-4">
									<h3 className="text-sm font-medium text-gray-800 mb-2">Description</h3>
									<textarea
										placeholder="Project description"
										value={projectDescription}
										onChange={(e) => setProjectDescription(e.target.value)}
										className="w-full h-24 sm:h-32 rounded-md border border-gray-300 bg-white p-2 text-sm text-gray-900 outline-none focus:border-blue-700"
									/>
								</div>
								<div className="rounded-lg border border-gray-200 bg-gray-50 p-3 sm:p-4">
									<h3 className="text-sm font-medium text-gray-800 mb-2">Website</h3>
									<input
										placeholder="https://"
										value={projectWebsite}
										onChange={(e) => setProjectWebsite(e.target.value)}
										className="w-full rounded-md border border-gray-300 bg-white p-2 text-sm text-gray-900 outline-none focus:border-blue-700"
									/>
								</div>
							</div>

							<div className="rounded-lg border border-gray-200 bg-gray-50 p-3 sm:p-4">
								<h3 className="text-sm font-medium text-gray-800 mb-2">Context / Notes</h3>
								<textarea
									placeholder="Strategic goals, market context, team overview..."
									value={projectContext}
									onChange={(e) => setProjectContext(e.target.value)}
									className="w-full h-32 sm:h-40 rounded-md border border-gray-300 bg-white p-2 text-sm text-gray-900 outline-none focus:border-blue-700"
								/>
							</div>

							<div className="flex justify-end">
								<button
									type="submit"
									disabled={isSavingProfile}
									className="px-4 py-2 rounded-md bg-blue-700 text-white text-sm font-semibold hover:bg-blue-800 transition disabled:opacity-50"
								>
									{isSavingProfile ? 'Saving...' : 'Save Changes'}
								</button>
							</div>
						</form>
					</div>
				)

			case 'knowledge':
				return (
					<div className="space-y-4 sm:space-y-6">
						<h2 className="text-lg sm:text-xl font-semibold flex items-center gap-2 text-gray-900">
							<BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-blue-700" /> Knowledge Hub
						</h2>
						<div className="flex gap-2 mb-4 overflow-x-auto pb-2">
							{[
								{ key: 'docs', label: 'Documents', icon: FileText },
								{ key: 'repos', label: 'Repositories', icon: GitBranch },
								{ key: 'architecture', label: 'Architecture', icon: ServerCog }
							].map(item => (
								<button
									key={item.key}
									onClick={() => setKnowledgeSub(item.key as KnowledgeSub)}
									className={`rounded-md border px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm flex items-center gap-1 sm:gap-2 whitespace-nowrap flex-shrink-0 ${
										knowledgeSub === item.key ? activeClass : inactiveClass
									}`}
								>
									<item.icon className="h-3 w-3 sm:h-4 sm:w-4" />
									{item.label}
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
					<div className="space-y-4 sm:space-y-6">
						<h2 className="text-lg sm:text-xl font-semibold flex items-center gap-2 text-gray-900">
							<Video className="h-4 w-4 sm:h-5 sm:w-5 text-blue-700" /> Meetings & Communications
						</h2>
						<div className="flex gap-2 mb-4 overflow-x-auto pb-2">
							{[
								{ key: 'recordings', label: 'Recordings', icon: Video },
								{ key: 'transcripts', label: 'Transcripts', icon: MessageSquare },
								{ key: 'actions', label: 'Action Items', icon: ListTodo },
								{ key: 'decisions', label: 'Decisions', icon: Layers }
							].map(item => (
								<button
									key={item.key}
									onClick={() => setMeetingsSub(item.key as MeetingsSub)}
									className={`rounded-md border px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm flex items-center gap-1 sm:gap-2 whitespace-nowrap flex-shrink-0 ${
										meetingsSub === item.key ? activeClass : inactiveClass
									}`}
								>
									<item.icon className="h-3 w-3 sm:h-4 sm:w-4" />
									{item.label}
								</button>
							))}
						</div>
						{meetingsSub === 'recordings' && <Recordings projectId={projectId} />}
						{meetingsSub === 'transcripts' && <Transcripts projectId={projectId} />}
						{meetingsSub === 'actions' && (
							<div className="p-4 border border-gray-200 rounded-lg bg-white">
								<p className="text-sm text-gray-600">Action items component coming soon...</p>
							</div>
						)}
						{meetingsSub === 'decisions' && (
							<div className="p-4 border border-gray-200 rounded-lg bg-white">
								<p className="text-sm text-gray-600">Decisions component coming soon...</p>
							</div>
						)}
					</div>
				)

			case 'work':
				return (
					<div className="h-full flex flex-col p-3 sm:p-6">
						<div className="flex-shrink-0">
							<h2 className="text-lg sm:text-xl font-semibold flex items-center gap-2 text-gray-900 mb-3 sm:mb-4">
								<ListTodo className="h-4 w-4 sm:h-5 sm:w-5 text-blue-700" /> Work Board
							</h2>
							<div className="flex gap-2 mb-3 sm:mb-4 overflow-x-auto pb-2">
								{[
									{ key: 'kanban', label: 'Kanban Board', mobileLabel: 'Kanban', icon: Layers },
									{ key: 'epics', label: 'Epics', mobileLabel: 'Epics', icon: BookOpen },
									{ key: 'reports', label: 'Reports', mobileLabel: 'Reports', icon: BarChart3 }
								].map(item => (
									<button
										key={item.key}
										onClick={() => setWorkSub(item.key as WorkSub)}
										className={`rounded-md border px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm flex items-center gap-1 sm:gap-2 whitespace-nowrap flex-shrink-0 ${
											workSub === item.key ? activeClass : inactiveClass
										}`}
									>
										<item.icon className="h-3 w-3 sm:h-4 sm:w-4" />
										<span className="hidden sm:inline">{item.label}</span>
										<span className="sm:hidden">{item.mobileLabel}</span>
									</button>
								))}
							</div>
						</div>
						<div className="flex-1 overflow-hidden">
							{workSub === 'kanban' && <Board projectId={projectId} light={true} />}
							{workSub === 'epics' && (
								<div className="p-4 border border-gray-200 rounded-lg bg-white">
									<p className="text-sm text-gray-600">Epics component coming soon...</p>
								</div>
							)}
							{workSub === 'reports' && (
								<div className="p-4 border border-gray-200 rounded-lg bg-white">
									<p className="text-sm text-gray-600">Reports component coming soon...</p>
								</div>
							)}
						</div>
					</div>
				)

			default:
				return null
		}
	}

	return (
		<div className="h-screen bg-gray-50 text-gray-900 flex flex-col overflow-hidden">
			{/* Top bar */}
			<div className="border-b border-gray-200 bg-white/70 backdrop-blur-md flex-shrink-0">
				<div className="mx-auto flex max-w-7xl flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-5 gap-3">
					<div className="w-full sm:w-auto">
						<button onClick={() => router.push('/dashboard')} className="text-xs text-gray-600 hover:text-gray-900">
							← Back
						</button>
						<h1 className="mt-1 text-xl sm:text-2xl font-bold">{project?.name || 'Project'}</h1>
						{project?.description && (
							<p className="mt-1 text-sm text-gray-600 line-clamp-1">{project.description}</p>
						)}
					</div>

					<div className="flex gap-2 items-center w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0">
						{[
							{ key: 'company', label: 'Company', mobileLabel: 'Company' },
							{ key: 'knowledge', label: 'Knowledge Hub', mobileLabel: 'Knowledge' },
							{ key: 'meetings', label: 'Meetings & Comms', mobileLabel: 'Meetings' },
							{ key: 'work', label: 'Work Board', mobileLabel: 'Work' }
						].map(item => (
							<button
								key={item.key}
								onClick={() => setSection(item.key as SectionKey)}
								className={`rounded-md border px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm whitespace-nowrap flex-shrink-0 ${
									section === item.key ? activeClass : inactiveClass
								}`}
							>
								<span className="hidden sm:inline">{item.label}</span>
								<span className="sm:hidden">{item.mobileLabel}</span>
							</button>
						))}

						<button
							onClick={() => setShowDeleteConfirm(true)}
							className="rounded-md border border-red-300 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-red-600 hover:bg-red-50 flex items-center gap-1 sm:gap-2 flex-shrink-0"
						>
							<Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
							<span className="hidden sm:inline">Delete</span>
						</button>
					</div>
				</div>
			</div>

			<main className={`mx-auto max-w-7xl w-full flex-1 flex flex-col overflow-hidden ${section === 'work' ? 'p-0' : 'p-3 sm:p-6'}`}>
				{(isLoading || isAuthLoading) ? (
					<div className="flex items-center justify-center py-24">
						<div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-700 border-t-transparent" />
					</div>
				) : !user ? null : (
					<div className="flex-1 overflow-auto">
						{renderContent()}
					</div>
				)}
			</main>

			{/* Delete Confirmation Modal */}
			{showDeleteConfirm && (
				<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
					<div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
						<h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Project?</h3>
						<p className="text-sm text-gray-600 mb-6">
							Are you sure you want to delete this project? This action cannot be undone and will delete all associated tasks, files, and data.
						</p>
						<div className="flex gap-3 justify-end">
							<button
								onClick={() => setShowDeleteConfirm(false)}
								disabled={isDeleting}
								className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition disabled:opacity-50"
							>
								Cancel
							</button>
							<button
								onClick={handleDeleteProject}
								disabled={isDeleting}
								className="px-4 py-2 rounded-md bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition disabled:opacity-50 flex items-center gap-2"
							>
								{isDeleting ? (
									<>
										<div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
										Deleting...
									</>
								) : (
									<>
										<Trash2 className="h-4 w-4" />
										Delete Project
									</>
								)}
							</button>
						</div>
					</div>
				</div>
			)}

			{/* AI ChatBot */}
			<ChatBot projectId={projectId} />
		</div>
	)
}
