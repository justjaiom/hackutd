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
        {/* Transparent 1x1 PNG favicon to effectively remove the site's favicon */}
        <link rel="icon" href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=" />
      </head>
      <body>
        <Auth0ProviderClient>
          {children}
        </Auth0ProviderClient>
      </body>
    </html>
  )
}

