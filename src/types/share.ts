/**
 * Shared content shape used by the Share Target PoC.
 * Mirrors what Android may send via Web Share Target params.
 */
export type SharedFileMeta = {
  name: string
  type: string
  size: number
}

export type SharePayload = {
  title: string
  text: string
  url: string
  filesCount: number
  files: SharedFileMeta[]
  receivedAt: string | null
  /** How the payload was obtained (POST cache, query string, or empty). */
  source: 'share_target_post' | 'query_params' | 'none'
  /** Full reconstructed object for the readonly "Raw Payload" textarea. */
  raw: Record<string, unknown>
}

export const EMPTY_SHARE_PAYLOAD: SharePayload = {
  title: '',
  text: '',
  url: '',
  filesCount: 0,
  files: [],
  receivedAt: null,
  source: 'none',
  raw: {},
}

/** Cache key written by the service worker after a Share Target POST. */
export const SHARE_CACHE_NAME = 'bachatkhata-share-payload'
export const SHARE_PAYLOAD_CACHE_URL = '/__last_share_payload__'
