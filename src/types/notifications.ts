/**
 * Push subscription payload matching Nest SubscribePushDto.
 */
export type PushSubscriptionPayload = {
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
}

/** Backend push JSON body — keep type-agnostic for future notification kinds. */
export type IncomingPushPayload = {
  title?: string
  body?: string
  icon?: string
  badge?: string
  url?: string
  type?: string
  benefitId?: string
  [key: string]: unknown
}

export type NotificationPermissionState = NotificationPermission | 'unsupported'
