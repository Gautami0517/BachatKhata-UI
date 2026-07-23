/**
 * Auto-install PWA with zero UI (HTTPS / localhost only).
 */
import { useEffect } from 'react'
import { logInfo, logWarn } from '../utils/logger'

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  prompt(): Promise<void>
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

function isAlreadyInstalled(): boolean {
  const standalone = window.matchMedia('(display-mode: standalone)').matches
  const iosStandalone =
    'standalone' in navigator &&
    Boolean((navigator as Navigator & { standalone?: boolean }).standalone)
  return standalone || iosStandalone
}

export function useAutoInstallPrompt(): void {
  useEffect(() => {
    if (isAlreadyInstalled()) {
      logInfo('App already installed — skipping install prompt')
      return
    }

    if (!window.isSecureContext) {
      logWarn(
        `Install unavailable: not a secure context (${window.location.protocol}//${window.location.host}). Use HTTPS.`,
      )
      return
    }

    let prompted = false

    const onBeforeInstallPrompt = (event: Event) => {
      const bip = event as BeforeInstallPromptEvent
      bip.preventDefault()
      logInfo('Install Prompt Available — showing automatically', { platforms: bip.platforms })
      if (prompted) return
      prompted = true
      void (async () => {
        try {
          await bip.prompt()
          const choice = await bip.userChoice
          logInfo('Install prompt user choice', choice)
        } catch (error) {
          logWarn('Install prompt failed', error)
          prompted = false
        }
      })()
    }

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt)
    window.addEventListener('appinstalled', () => logInfo('App Installed'))

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt)
    }
  }, [])
}
