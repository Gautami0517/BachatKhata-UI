/**
 * App shell: React Query + routes.
 * /download — shareable install landing (C-Vault Download button)
 * /         — Dashboard (also PWA start_url after install)
 * /share    — Share Target import
 */
import { useEffect } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Dashboard } from './pages/Dashboard'
import { Download } from './pages/Download'
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
    logInfo('Navigation', {
      pathname: location.pathname,
      search: location.search,
    })
  }, [location])

  return null
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <NavigationLogger />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/download" element={<Download />} />
          <Route path="/share" element={<ShareImport />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
