"use client"

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

type CreateProjectModalProps = {
	isOpen: boolean
	onClose: () => void
	onCreated?: (project: any) => void
}

export default function CreateProjectModal({ isOpen, onClose, onCreated }: CreateProjectModalProps) {
	const [name, setName] = useState("")
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const supabase = createClient()
	const [accessToken, setAccessToken] = useState<string | null>(null)

	useEffect(() => {
		let mounted = true
		;(async () => {
			const sess = await supabase.auth.getSession()
			if (mounted) setAccessToken(sess.data.session?.access_token || null)
		})()
		return () => { mounted = false }
	}, [supabase])

	if (!isOpen) return null

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		if (!name.trim()) {
			setError("Please enter a project name")
			return
		}
		setError(null)
		setIsSubmitting(true)
			try {
				// Ensure we have latest session token just before submit
				if (!accessToken) {
					const fresh = await supabase.auth.getSession()
					const token = fresh.data.session?.access_token || null
					if (token) setAccessToken(token)
				}

				const doPost = async (token?: string) => {
					const headers: Record<string, string> = { 'Content-Type': 'application/json' }
					if (token) headers['Authorization'] = `Bearer ${token}`
					const res = await fetch('/api/projects', {
						method: 'POST',
						headers,
						body: JSON.stringify({ name: name.trim(), accessToken: token ?? undefined }),
						credentials: 'include'
					})
					return res
				}

				console.log('Create project accessToken present?', !!accessToken)
				let res = await doPost(accessToken || undefined)
				if (res.status === 401 && !accessToken) {
					// Retry once after fetching a fresh session token
					const sess = await supabase.auth.getSession()
					const token = sess.data.session?.access_token || undefined
					res = await doPost(token)
				}

				if (!res.ok) {
					const err = await res.json().catch(() => ({}))
					console.error('Create project failed', err)
					throw new Error(err.error + (err.details ? `: ${err.details}` : '') || 'Failed to create project')
				}
				const created = await res.json()
				onCreated?.(created.project)
				onClose()
				setName("")
			} catch (e: any) {
				setError(e.message || 'Failed to create project')
			} finally {
				setIsSubmitting(false)
			}
	}

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
			<div className="w-full max-w-md rounded-xl border border-gray-800 bg-[#0f0f10] p-6 shadow-xl">
				<div className="mb-4">
					<h2 className="text-xl font-semibold">Create a new project</h2>
					<p className="mt-1 text-sm text-gray-400">Give your project a short, clear name. You can change it later.</p>
				</div>
				<form onSubmit={handleSubmit} className="space-y-4">
					<div>
						<label className="mb-2 block text-sm text-gray-300">Project name</label>
						<input
							autoFocus
							type="text"
							value={name}
							onChange={(e) => setName(e.target.value)}
							placeholder="e.g., Apollo Revamp"
							className="w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-white outline-none focus:border-indigo-500"
						/>
					</div>
					{error && <p className="text-sm text-red-400">{error}</p>}
					<div className="flex items-center justify-end gap-3 pt-2">
						<button
							type="button"
							onClick={onClose}
							disabled={isSubmitting}
							className="rounded-lg border border-gray-700 px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 disabled:opacity-50"
						>
							Cancel
						</button>
						<button
							type="submit"
							disabled={isSubmitting}
							className="rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2 text-sm font-semibold text-white hover:opacity-95 disabled:opacity-50"
						>
							{isSubmitting ? 'Creating…' : 'Create Project'}
						</button>
					</div>
				</form>
			</div>
		</div>
	)
}
