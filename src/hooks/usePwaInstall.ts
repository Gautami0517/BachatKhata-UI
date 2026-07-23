/**
 * Captures Chromium's `beforeinstallprompt` so a Download button can call
 * the native install dialog from a real user tap (required on Android Chrome).
 */
import { useCallback, useEffect, useState } from 'react'
import { logInfo, logWarn } from '../utils/logger'

export type PwaInstallStatus =
  | 'checking'
  | 'available'
  | 'unavailable'
  | 'installed'
  | 'prompting'

let deferredPrompt: BeforeInstallPromptEvent | null = null
let listenersBound = false

function bindInstallListeners(): void {
  if (listenersBound || typeof window === 'undefined') return
  listenersBound = true

  window.addEventListener('beforeinstallprompt', (event) => {
    const promptEvent = event as BeforeInstallPromptEvent
    promptEvent.preventDefault()
    deferredPrompt = promptEvent
    window.dispatchEvent(new Event('cvault:pwa-install-available'))
    logInfo('beforeinstallprompt ready for Download button')
  })

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null
    window.dispatchEvent(new Event('cvault:pwa-installed'))
    logInfo('PWA installed via Download button')
  })
}

// Listen as soon as this module loads (App imports Download → hook).
bindInstallListeners()

export function usePwaInstall() {
  const [status, setStatus] = useState<PwaInstallStatus>(() => {
    if (typeof window === 'undefined') return 'checking'
    if (window.matchMedia('(display-mode: standalone)').matches) return 'installed'
    if (deferredPrompt) return 'available'
    return 'checking'
  })

  useEffect(() => {
    bindInstallListeners()

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setStatus('installed')
      return
    }

    if (deferredPrompt) {
      setStatus('available')
    }

    // Chrome often fires beforeinstallprompt shortly after SW is ready.
    const onAvailable = () => setStatus('available')
    const onInstalled = () => setStatus('installed')
    window.addEventListener('cvault:pwa-install-available', onAvailable)
    window.addEventListener('cvault:pwa-installed', onInstalled)

    const timeoutId = window.setTimeout(() => {
      setStatus((current) => {
        if (current === 'checking') {
          logWarn('PWA install event not fired — Download unavailable on this browser/context')
          return 'unavailable'
        }
        return current
      })
    }, 8000)

    return () => {
      window.clearTimeout(timeoutId)
      window.removeEventListener('cvault:pwa-install-available', onAvailable)
      window.removeEventListener('cvault:pwa-installed', onInstalled)
    }
  }, [])

  const promptInstall = useCallback(async (): Promise<'accepted' | 'dismissed' | 'unavailable'> => {
    if (!deferredPrompt) {
      setStatus((current) => (current === 'installed' ? current : 'unavailable'))
      return 'unavailable'
    }

    setStatus('prompting')
    const promptEvent = deferredPrompt
    deferredPrompt = null

    try {
      await promptEvent.prompt()
      const choice = await promptEvent.userChoice
      logInfo('PWA install choice', { outcome: choice.outcome })
      if (choice.outcome === 'accepted') {
        setStatus('installed')
        return 'accepted'
      }
      setStatus('unavailable')
      return 'dismissed'
    } catch (error: unknown) {
      logWarn('PWA install prompt failed', { error })
      setStatus('unavailable')
      return 'unavailable'
    }
  }, [])

  return { status, promptInstall, canInstall: status === 'available' }
}
