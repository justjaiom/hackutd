"use client"

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import FloatingParticles from '@/components/ui/floating-particles'
import { motion } from 'framer-motion'

export default function SignUp() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, fullName }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to sign up')
      }

      // Show success and redirect to signin
      alert(data.message)
      router.push('/signin')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <div className="fixed inset-0 bg-gradient-to-b from-blue-50/30 via-white to-cyan-50/20 pointer-events-none -z-10" />
      <FloatingParticles />

      <main className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="relative w-full max-w-2xl">
          {/* Gradient blobs from Hero */}
          <div
            className="absolute w-80 h-80 rounded-full filter blur-3xl z-0 pointer-events-none"
            style={{
              left: '4%',
              top: '50%',
              opacity: 0.75,
              background:
                'radial-gradient(circle at 30% 30%, #1c92d2 0%, #64b3e6 55%, transparent 80%)',
              transform: 'translateY(-50%) translateX(-10%)',
            }}
          />

          <div
            className="absolute w-64 h-64 rounded-full filter blur-2xl z-0 pointer-events-none"
            style={{
              right: '4%',
              top: '50%',
              opacity: 0.65,
              background:
                'radial-gradient(circle at 70% 30%, #1c92d2 0%, rgba(28,146,210,0.25) 60%, transparent 85%)',
              transform: 'translateY(-50%) translateX(10%)',
            }}
          />

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="relative z-10 max-w-md w-full space-y-8 bg-white rounded-2xl p-8 border border-gray-200 dark:border-neutral-800 mx-auto"
          >
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-black">
              Create your account
            </h2>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="fullName" className="sr-only">
                Full Name
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 bg-white placeholder-gray-400 text-black rounded-t-md focus:outline-none focus:ring-primary-600 focus:border-primary-600 focus:z-10 sm:text-sm"
                placeholder="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 bg-white placeholder-gray-400 text-black focus:outline-none focus:ring-primary-600 focus:border-primary-600 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 bg-white placeholder-gray-400 text-black rounded-b-md focus:outline-none focus:ring-primary-600 focus:border-primary-600 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center">{error}</div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-600 disabled:opacity-50"
            >
              {isLoading ? 'Creating account...' : 'Sign up'}
            </button>
          </div>
        </form>

        <div className="text-center">
          <p className="text-sm text-gray-700">
            Already have an account?{' '}
            <a href="/signin" className="text-primary-600 hover:text-primary-500">
              Sign in
            </a>
          </p>
        </div>
        </motion.div>
        </div>
      </main>
    </>
  )
}