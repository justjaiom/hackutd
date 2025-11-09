import type { Metadata } from 'next'
import Auth0ProviderClient from '@/components/Auth0ProviderClient'
import './globals.css'

export const metadata: Metadata = {
  title: 'Adjacent - AI-Powered Collaborative Project Manager',
  description: 'Transform raw project data into structured, actionable plans with autonomous AI agents',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=5',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        {/* Use Adjacent2.png from public/ as the site favicon */}
        <link rel="icon" href="/Adjacent2.png" />
      </head>
      <body>
        <Auth0ProviderClient>
          {children}
        </Auth0ProviderClient>
      </body>
    </html>
  )
}

