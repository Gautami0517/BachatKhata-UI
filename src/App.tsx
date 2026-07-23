import { useEffect } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ToastProvider } from './components/ToastProvider'
import { NotificationLaunchPrompt } from './components/NotificationLaunchPrompt'
import { NotificationProvider } from './hooks/useNotifications'
import { useAutoInstallPrompt } from './hooks/useAutoInstallPrompt'
import { AskResults } from './pages/AskResults'
import { Dashboard } from './pages/Dashboard'
import { Download } from './pages/Download'
import { ImportImage } from './pages/ImportImage'
import { ImportText } from './pages/ImportText'
import { OfferDetails } from './pages/OfferDetails'
import { Profile } from './pages/Profile'
import { ShareImport } from './pages/ShareImport'
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

export default function App() {
  useAutoInstallPrompt()

  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <NotificationProvider>
          <BrowserRouter>
            <NavigationLogger />
            <NotificationLaunchPrompt />
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/download" element={<Download />} />
              <Route path="/ask" element={<AskResults />} />
              <Route path="/benefits/:id" element={<OfferDetails />} />
              <Route path="/import/image" element={<ImportImage />} />
              <Route path="/import/text" element={<ImportText />} />
              <Route path="/share" element={<ShareImport />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </NotificationProvider>
      </ToastProvider>
    </QueryClientProvider>
  )
}
