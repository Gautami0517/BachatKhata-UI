/**
 * Optional page chrome for future screens.
 * Dashboard / ShareImport are currently full-bleed mobile pages.
 */
import type { ReactNode } from 'react'

type AppLayoutProps = {
  children: ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  return <div className="min-h-screen bg-[#fafafa] text-gray-900">{children}</div>
}
