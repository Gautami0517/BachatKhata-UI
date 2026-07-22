/**
 * App shell: two routes only (/ and /share) plus navigation logging.
 */
import { useEffect } from 'react'
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom'
import { HomePage } from './pages/HomePage'
import { SharePage } from './pages/SharePage'
import { logInfo } from './utils/logger'

/** Logs every client-side navigation for remote debugging on Android. */
function NavigationLogger() {
  const location = useLocation()

  useEffect(() => {
    logInfo('Navigation Events', {
      pathname: location.pathname,
      search: location.search,
      hash: location.hash,
      fullUrl: window.location.href,
    })
  }, [location])

  return null
}

export default function App() {
  useEffect(() => {
    logInfo('App mounted', {
      href: window.location.href,
      displayMode: window.matchMedia('(display-mode: standalone)').matches
        ? 'standalone'
        : 'browser',
    })
  }, [])

  return (
    <BrowserRouter>
      <NavigationLogger />
      <div className="app-shell">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/share" element={<SharePage />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}
