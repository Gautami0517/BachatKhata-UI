/**
 * Rounded mobile screen shell — soft corners like a native app viewport.
 */
import type { ReactNode } from 'react'

type AppLayoutProps = {
  children: ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  return <div className="app-screen text-gray-900">{children}</div>
}
