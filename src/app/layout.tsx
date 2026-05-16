import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'EduBuddi AI â Training Platform',
  description: 'AI-powered training connected to revenue outcomes',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased">
        {children}
      </body>
    </html>
  )
}
