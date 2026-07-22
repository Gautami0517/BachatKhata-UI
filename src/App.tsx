/**
 * App shell: React Query + two routes (/ Dashboard, /share Share Import).
 */
import { useEffect } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Dashboard } from './pages/Dashboard'
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
          <Route path="/share" element={<ShareImport />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
