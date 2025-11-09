"use client"
import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import FloatingParticles from '@/components/ui/floating-particles'
import { ArrowLeft } from 'lucide-react'
import { motion } from 'framer-motion'

export default function SignIn() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const supabase = createClient()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        throw new Error(error.message)
      }

      router.push("/dashboard")
    } catch (err: any) {
      console.error("[signin] error", err)
      setError(err.message || "Failed to sign in")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      <div className="fixed inset-0 bg-gradient-to-b from-blue-50/30 via-white to-cyan-50/20 pointer-events-none -z-10" />
      <FloatingParticles />
      <main className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="relative w-full max-w-2xl">
          {/* Gradient blobs from Hero */}
          <div
            className="absolute w-80 h-80 rounded-full filter blur-3xl mix-blend-screen z-0"
            style={{
              left: '-6rem',
              top: '50%',
              opacity: 0.55,
              background:
                'radial-gradient(circle at 30% 30%, #1c92d2 0%, #f2fcfe 65%, transparent 80%)',
              transform: 'translateY(-50%)',
            }}
          />

          <div
            className="absolute w-64 h-64 rounded-full filter blur-2xl mix-blend-screen z-0"
            style={{
              right: '-6rem',
              top: '50%',
              opacity: 0.5,
              background:
                'radial-gradient(circle at 70% 30%, #C4E0E5 0%, rgba(196,224,229,0.9) 60%, transparent 85%)',
              transform: 'translateY(-50%)',
            }}
          />

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="relative z-10 max-w-md w-full space-y-8 bg-white rounded-2xl p-8 border border-gray-200 dark:border-neutral-800 mx-auto"
          >
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-black">Sign in to your account</h2>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 bg-white placeholder-gray-400 text-black rounded-t-md focus:outline-none focus:ring-primary-600 focus:border-primary-600 focus:z-10 sm:text-sm"
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

          {error && <div className="text-red-600 text-sm text-center">{error}</div>}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-600 disabled:opacity-50"
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </button>
          </div>
        </form>

        <div className="text-center">
          <div className="flex items-center justify-center gap-3">
            <a href="/" aria-label="Back to home" className="text-gray-500 hover:text-gray-700">
              <ArrowLeft className="w-4 h-4" />
            </a>
            <p className="text-sm text-gray-700 m-0">
              Don&apos;t have an account?{' '}
              <a href="/signup" className="text-primary-600 hover:text-primary-500">
                Sign up
              </a>
            </p>
          </div>
        </div>
        </motion.div>
        </div>
      </main>
    </div>
  )
}