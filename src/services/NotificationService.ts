/**
 * Isolated Web Push helpers — no React.
 * Handles permission, PushManager subscribe/unsubscribe, and backend sync.
 */
import { subscribePush, unsubscribePush } from '../api/notifications'
import type { PushSubscriptionPayload } from '../types/notifications'
import { logError, logInfo, logWarn } from '../utils/logger'

const PREF_KEY = 'c-vault.notifications.enabled'
const DENIED_KEY = 'c-vault.notifications.deniedHandled'

export class NotificationService {
  static isSupported(): boolean {
    return (
      typeof window !== 'undefined' &&
      'Notification' in window &&
      'serviceWorker' in navigator &&
      'PushManager' in window
    )
  }

  static getPermission(): NotificationPermission | 'unsupported' {
    if (!this.isSupported()) return 'unsupported'
    return Notification.permission
  }

  /** User preference toggle (Profile ON/OFF), independent of browser permission. */
  static getPreferenceEnabled(): boolean {
    const raw = localStorage.getItem(PREF_KEY)
    if (raw === null) {
      // Default ON once permission is granted.
      return Notification.permission === 'granted'
    }
    return raw === 'true'
  }

  static setPreferenceEnabled(enabled: boolean): void {
    localStorage.setItem(PREF_KEY, enabled ? 'true' : 'false')
  }

  static wasDeniedHandled(): boolean {
    return localStorage.getItem(DENIED_KEY) === 'true'
  }

  static markDeniedHandled(): void {
    localStorage.setItem(DENIED_KEY, 'true')
  }

  static getVapidPublicKey(): string | null {
    const key = import.meta.env.VITE_VAPID_PUBLIC_KEY?.trim()
    return key || null
  }

  /**
   * Request browser permission (user gesture recommended).
   * Does not re-prompt if already denied.
   */
  static async requestPermission(): Promise<NotificationPermission | 'unsupported'> {
    if (!this.isSupported()) {
      logWarn('Push API unsupported in this browser')
      return 'unsupported'
    }

    if (Notification.permission === 'denied') {
      this.markDeniedHandled()
      logWarn('Notification permission previously denied — not re-prompting')
      return 'denied'
    }

    if (Notification.permission === 'granted') {
      return 'granted'
    }

    try {
      const result = await Notification.requestPermission()
      logInfo('Notification permission result', result)
      if (result === 'denied') this.markDeniedHandled()
      return result
    } catch (error) {
      logError('Notification.requestPermission failed', error)
      return Notification.permission
    }
  }

  /** Convert VAPID key to Uint8Array for PushManager.subscribe. */
  static urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
    const raw = atob(base64)
    const output = new Uint8Array(raw.length)
    for (let i = 0; i < raw.length; i += 1) {
      output[i] = raw.charCodeAt(i)
    }
    return output
  }

  static subscriptionToPayload(subscription: PushSubscription): PushSubscriptionPayload {
    const json = subscription.toJSON()
    const endpoint = json.endpoint
    const p256dh = json.keys?.p256dh
    const auth = json.keys?.auth

    if (!endpoint || !p256dh || !auth) {
      throw new Error('Push subscription missing endpoint or keys')
    }

    return {
      endpoint,
      keys: { p256dh, auth },
    }
  }

  /**
   * Ensure SW is ready, subscribe with VAPID key, POST to backend.
   */
  static async enable(): Promise<{ ok: boolean; reason?: string }> {
    if (!this.isSupported()) {
      return { ok: false, reason: 'Push notifications are not supported in this browser.' }
    }

    const vapidKey = this.getVapidPublicKey()
    if (!vapidKey) {
      return { ok: false, reason: 'VITE_VAPID_PUBLIC_KEY is not configured.' }
    }

    const permission = await this.requestPermission()
    if (permission !== 'granted') {
      return {
        ok: false,
        reason:
          permission === 'denied'
            ? 'Notifications are blocked. Enable them in browser settings.'
            : 'Notification permission was not granted.',
      }
    }

    try {
      const registration = await navigator.serviceWorker.ready
      let subscription = await registration.pushManager.getSubscription()

      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: this.urlBase64ToUint8Array(vapidKey) as BufferSource,
        })
        logInfo('PushManager subscribed', subscription.endpoint)
      } else {
        logInfo('Existing push subscription reused', subscription.endpoint)
      }

      const payload = this.subscriptionToPayload(subscription)
      await subscribePush(payload)
      this.setPreferenceEnabled(true)
      logInfo('Push subscription stored on backend')
      return { ok: true }
    } catch (error) {
      logError('Failed to enable push notifications', error)
      return {
        ok: false,
        reason: error instanceof Error ? error.message : 'Failed to enable notifications.',
      }
    }
  }

  /**
   * Unsubscribe locally and remove from backend. Preference → OFF.
   */
  static async disable(): Promise<{ ok: boolean; reason?: string }> {
    if (!this.isSupported()) {
      this.setPreferenceEnabled(false)
      return { ok: true }
    }

    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()

      if (subscription) {
        const endpoint = subscription.endpoint
        try {
          await unsubscribePush(endpoint)
        } catch (error) {
          // Still drop local subscription even if backend call fails.
          logWarn('Backend unsubscribe failed — continuing locally', error)
        }
        await subscription.unsubscribe()
        logInfo('Push subscription removed')
      }

      this.setPreferenceEnabled(false)
      return { ok: true }
    } catch (error) {
      logError('Failed to disable push notifications', error)
      this.setPreferenceEnabled(false)
      return {
        ok: false,
        reason: error instanceof Error ? error.message : 'Failed to disable notifications.',
      }
    }
  }

  /**
   * On launch: if already granted + preference ON, refresh backend registration.
   * Never auto-prompts when permission is default/denied.
   */
  static async syncOnLaunch(): Promise<void> {
    if (!this.isSupported()) return
    if (Notification.permission !== 'granted') return
    if (!this.getPreferenceEnabled()) return

    try {
      await this.enable()
    } catch (error) {
      logWarn('Launch push sync failed gracefully', error)
    }
  }
}
