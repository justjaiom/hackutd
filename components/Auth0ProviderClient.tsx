"use client"

import { useEffect, useState, ReactNode } from 'react'

export default function Auth0ProviderClient({ children }: { children: ReactNode }) {
  const [Provider, setProvider] = useState<any | null>(null)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const mod = await import('@auth0/nextjs-auth0/client')
        const P = mod.UserProvider ?? mod.default ?? null
        if (mounted && P) setProvider(() => P)
      } catch (err) {
        // If import fails, silently fall back to rendering children only
        console.warn('Auth0 client provider import failed:', err)
      }
    })()

    return () => {
      mounted = false
    }
  }, [])

  if (!Provider) {
    // Render children directly if provider isn't available yet
    return <>{children}</>
  }

  const Comp = Provider
  return <Comp>{children}</Comp>
}
