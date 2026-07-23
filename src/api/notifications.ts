import { api } from './axios'
import type { PushSubscriptionPayload } from '../types/notifications'

/**
 * GET /notifications/vapid-public-key (public)
 * Optional fallback when VITE_VAPID_PUBLIC_KEY is unset.
 */
export async function fetchVapidPublicKey(): Promise<string> {
  const { data } = await api.get<{ publicKey: string }>('/notifications/vapid-public-key')
  return data.publicKey
}

/**
 * POST /notifications/subscribe (auth)
 * Stores the browser PushSubscription under the logged-in user.id.
 */
export async function subscribePush(
  payload: PushSubscriptionPayload,
): Promise<{ id: string; endpoint: string }> {
  const { data } = await api.post<{ id: string; endpoint: string }>(
    '/notifications/subscribe',
    payload,
  )
  return data
}

/**
 * DELETE /notifications/subscribe (auth)
 * Removes only this user's subscription for the endpoint.
 */
export async function unsubscribePush(
  endpoint: string,
): Promise<{ removed: boolean; count: number }> {
  const { data } = await api.delete<{ removed: boolean; count: number }>(
    '/notifications/subscribe',
    { data: { endpoint } },
  )
  return data
}

/**
 * POST /notifications/test (auth)
 * Immediate demo push to this user's devices for a benefit they own.
 */
export async function testPush(
  benefitId: string,
): Promise<{ sent: number; failed: number }> {
  const { data } = await api.post<{ sent: number; failed: number }>('/notifications/test', {
    benefitId,
  })
  return data
}
