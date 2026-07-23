import { api } from './axios'
import type { PushSubscriptionPayload } from '../types/notifications'

/**
 * POST /notifications/subscribe
 * Stores the browser PushSubscription on the backend.
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
 * DELETE /notifications/subscribe
 * Removes the subscription by endpoint.
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
