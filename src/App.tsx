import { useEffect } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider, useAuth } from './auth/AuthContext'
import { GuestOnly, ProtectedRoute } from './components/ProtectedRoute'
import { ToastProvider } from './components/ToastProvider'
import { NotificationLaunchPrompt } from './components/NotificationLaunchPrompt'
import { NotificationProvider } from './hooks/useNotifications'
import { AppLayout } from './layouts/AppLayout'
import { AskResults } from './pages/AskResults'
import { Dashboard } from './pages/Dashboard'
import { Download } from './pages/Download'
import { ImportImage } from './pages/ImportImage'
import { ImportText } from './pages/ImportText'
import { Login } from './pages/Login'
import { OfferDetails } from './pages/OfferDetails'
import { Profile } from './pages/Profile'
import { ShareImport } from './pages/ShareImport'
import { Signup } from './pages/Signup'
import { logInfo } from './utils/logger'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: true,
    },
  },
})

function NavigationLogger() {
  const location = useLocation()
  useEffect(() => {
    logInfo('Navigation', { pathname: location.pathname, search: location.search })
  }, [location])
  return null
}

/** Skip notif prompt on public / install surfaces; only when signed in. */
function ConditionalNotificationPrompt() {
  const { pathname } = useLocation()
  const { isAuthenticated, isBootstrapping } = useAuth()
  if (isBootstrapping) return null
  if (!isAuthenticated) return null
  if (pathname === '/download' || pathname === '/login' || pathname === '/signup') return null
  return <NotificationLaunchPrompt />
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <AuthProvider>
          <NotificationProvider>
            <BrowserRouter>
              <AppLayout>
                <NavigationLogger />
                <ConditionalNotificationPrompt />
                <Routes>
                  <Route
                    path="/login"
                    element={
                      <GuestOnly>
                        <Login />
                      </GuestOnly>
                    }
                  />
                  <Route
                    path="/signup"
                    element={
                      <GuestOnly>
                        <Signup />
                      </GuestOnly>
                    }
                  />
                  <Route path="/download" element={<Download />} />

                  <Route
                    path="/"
                    element={
                      <ProtectedRoute>
                        <Dashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/ask"
                    element={
                      <ProtectedRoute>
                        <AskResults />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/benefits/:id"
                    element={
                      <ProtectedRoute>
                        <OfferDetails />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/import/image"
                    element={
                      <ProtectedRoute>
                        <ImportImage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/import/text"
                    element={
                      <ProtectedRoute>
                        <ImportText />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/share"
                    element={
                      <ProtectedRoute>
                        <ShareImport />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute>
                        <Profile />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </AppLayout>
            </BrowserRouter>
          </NotificationProvider>
        </AuthProvider>
      </ToastProvider>
    </QueryClientProvider>
  )
}
