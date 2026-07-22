/**
 * Captures the browser `beforeinstallprompt` event so we can show
 * an explicit "Install BachatKhata" button (required for this PoC).
 *
 * Also tracks whether the app is already running as an installed PWA
 * so the button can be hidden.
 */
import { useEffect, useState } from 'react'
import { logInfo, logWarn } from '../utils/logger'

/** Chromium-only event; not yet in all TypeScript DOM lib builds. */
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  prompt(): Promise<void>
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

function isStandaloneDisplay(): boolean {
  const mediaStandalone = window.matchMedia('(display-mode: standalone)').matches
  // iOS Safari legacy flag when launched from home screen
  const iosStandalone = 'standalone' in navigator && Boolean((navigator as Navigator & { standalone?: boolean }).standalone)
  const twa = document.referrer.startsWith('android-app://')
  return mediaStandalone || iosStandalone || twa
}

export type InstallPromptState = {
  /** True when Chromium has fired beforeinstallprompt and we can call prompt(). */
  canInstall: boolean
  /** True when the app is already installed / running standalone. */
  isInstalled: boolean
  /** Triggers the native install dialog. */
  promptInstall: () => Promise<void>
}

export function useInstallPrompt(): InstallPromptState {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstalled, setIsInstalled] = useState(() => isStandaloneDisplay())

  useEffect(() => {
    logInfo('Install hook mounted', {
      displayModeStandalone: isStandaloneDisplay(),
      userAgent: navigator.userAgent,
    })

    const onBeforeInstallPrompt = (event: Event) => {
      // Prevent the mini-infobar so our custom Install button owns the UX.
      event.preventDefault()
      const bip = event as BeforeInstallPromptEvent
      setDeferredPrompt(bip)
      logInfo('Install Prompt Available', { platforms: bip.platforms })
    }

    const onAppInstalled = () => {
      setDeferredPrompt(null)
      setIsInstalled(true)
      logInfo('App Installed')
    }

    const onDisplayModeChange = (event: MediaQueryListEvent) => {
      logInfo('Display mode change', { matches: event.matches })
      if (event.matches) {
        setIsInstalled(true)
        setDeferredPrompt(null)
      }
    }

    const media = window.matchMedia('(display-mode: standalone)')

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt)
    window.addEventListener('appinstalled', onAppInstalled)
    media.addEventListener('change', onDisplayModeChange)

    if (isStandaloneDisplay()) {
      logInfo('App already running in installed/standalone mode')
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt)
      window.removeEventListener('appinstalled', onAppInstalled)
      media.removeEventListener('change', onDisplayModeChange)
    }
  }, [])

  const promptInstall = async () => {
    if (!deferredPrompt) {
      logWarn('promptInstall called but no deferred beforeinstallprompt event')
      return
    }

    logInfo('Showing native install prompt')
    await deferredPrompt.prompt()
    const choice = await deferredPrompt.userChoice
    logInfo('Install prompt user choice', choice)

    // Chromium only allows prompt() once per deferred event.
    setDeferredPrompt(null)
    if (choice.outcome === 'accepted') {
      setIsInstalled(true)
    }
  }

  return {
    canInstall: Boolean(deferredPrompt) && !isInstalled,
    isInstalled,
    promptInstall,
  }
}
