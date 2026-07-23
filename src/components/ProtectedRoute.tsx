/**
 * Require accessToken for vault screens. Public auth pages stay open.
 */
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isBootstrapping } = useAuth()
  const location = useLocation()

  if (isBootstrapping) {
    return (
      <main className="mx-auto flex min-h-full items-center justify-center bg-[#fcf8fe] px-5">
        <p className="text-sm text-gray-500">Checking session…</p>
      </main>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return <>{children}</>
}

/** Redirect authenticated users away from login/signup. */
export function GuestOnly({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isBootstrapping } = useAuth()

  if (isBootstrapping) {
    return (
      <main className="mx-auto flex min-h-full items-center justify-center bg-[#fcf8fe] px-5">
        <p className="text-sm text-gray-500">Loading…</p>
      </main>
    )
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
