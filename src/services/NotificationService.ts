/**
 * Web Push helpers — JWT-scoped backend subscriptions.
 * Never POST /notifications/subscribe without an access token.
 */
import { getAccessToken } from '../api/authStorage'
import {
  fetchVapidPublicKey,
  subscribePush,
  testPush,
  unsubscribePush,
} from '../api/notifications'
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

  static getVapidPublicKeyFromEnv(): string | null {
    const key = import.meta.env.VITE_VAPID_PUBLIC_KEY?.trim()
    return key || null
  }

  /** Prefer build-time key; fall back to GET /notifications/vapid-public-key. */
  static async resolveVapidPublicKey(): Promise<string | null> {
    const fromEnv = this.getVapidPublicKeyFromEnv()
    if (fromEnv) return fromEnv
    try {
      const fromApi = await fetchVapidPublicKey()
      return fromApi?.trim() || null
    } catch (error) {
      logWarn('Could not fetch VAPID public key', error)
      return null
    }
  }

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
   * Ensure PushManager subscription exists and POST to backend under JWT user.
   * Always POSTs (upsert) so obsolete "default" userId rows are overwritten.
   */
  static async registerWithBackend(options: {
    requestPermission: boolean
  }): Promise<{ ok: boolean; reason?: string }> {
    if (!this.isSupported()) {
      return { ok: false, reason: 'Push notifications are not supported in this browser.' }
    }

    if (!getAccessToken()) {
      return { ok: false, reason: 'Sign in required before enabling notifications.' }
    }

    const vapidKey = await this.resolveVapidPublicKey()
    if (!vapidKey) {
      return { ok: false, reason: 'VITE_VAPID_PUBLIC_KEY is not configured.' }
    }

    let permission: NotificationPermission | 'unsupported' = Notification.permission
    if (options.requestPermission) {
      permission = await this.requestPermission()
    }
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
      logInfo('Push subscription stored on backend for auth user')
      return { ok: true }
    } catch (error) {
      logError('Failed to register push subscription', error)
      return {
        ok: false,
        reason: error instanceof Error ? error.message : 'Failed to enable notifications.',
      }
    }
  }

  /** User taps Allow / Profile ON — may prompt for permission. */
  static async enable(): Promise<{ ok: boolean; reason?: string }> {
    return this.registerWithBackend({ requestPermission: true })
  }

  /**
   * After login / cold start with JWT: if browser already granted, upsert
   * subscription under the real auth userId (replaces legacy "default").
   */
  static async syncAfterLogin(): Promise<void> {
    if (!getAccessToken()) return
    if (!this.isSupported()) return
    if (Notification.permission !== 'granted') return

    try {
      const result = await this.registerWithBackend({ requestPermission: false })
      if (!result.ok) {
        logWarn('Post-login push sync skipped', result.reason)
      }
    } catch (error) {
      logWarn('Post-login push sync failed gracefully', error)
    }
  }

  /** Profile OFF — DELETE on backend (auth), then drop browser subscription. */
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
        if (getAccessToken()) {
          try {
            await unsubscribePush(endpoint)
          } catch (error) {
            logWarn('Backend unsubscribe failed — continuing locally', error)
          }
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
   * Before clearing JWT on logout: best-effort DELETE for this endpoint.
   * Keeps the browser PushSubscription so the next login can re-upsert under the new user.
   */
  static async detachBeforeLogout(): Promise<void> {
    if (!this.isSupported()) return
    if (!getAccessToken()) return

    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()
      if (!subscription) return

      await unsubscribePush(subscription.endpoint)
      logInfo('Push subscription detached before logout', subscription.endpoint)
    } catch (error) {
      logWarn('Logout push detach failed (best effort)', error)
    }
  }

  /** Optional debug — POST /notifications/test { benefitId }. */
  static async sendTest(benefitId: string): Promise<{ ok: boolean; reason?: string }> {
    if (!getAccessToken()) {
      return { ok: false, reason: 'Sign in required.' }
    }
    try {
      const result = await testPush(benefitId)
      logInfo('Test push sent', result)
      return { ok: true }
    } catch (error) {
      logError('Test push failed', error)
      return {
        ok: false,
        reason: error instanceof Error ? error.message : 'Test push failed.',
      }
    }
  }
}
