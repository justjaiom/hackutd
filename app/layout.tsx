import type { Metadata } from 'next'
import Auth0ProviderClient from '@/components/Auth0ProviderClient'
import './globals.css'

export const metadata: Metadata = {
  title: 'Adjacent - AI-Powered Collaborative Project Manager',
  description: 'Transform raw project data into structured, actionable plans with autonomous AI agents',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Auth0ProviderClient>
          {children}
        </Auth0ProviderClient>
      </body>
    </html>
  )
}

