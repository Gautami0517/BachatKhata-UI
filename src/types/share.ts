/**
 * Shared content shape used when Android opens /share via Web Share Target.
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
  source: 'share_target_post' | 'query_params' | 'none'
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

export const SHARE_CACHE_NAME = 'c-vault-share-payload'
export const SHARE_PAYLOAD_CACHE_URL = '/__last_share_payload__'
export const SHARE_FILE_CACHE_PREFIX = '/__share_file_'

export function shareFileCacheUrl(index: number): string {
  return `${SHARE_FILE_CACHE_PREFIX}${index}__`
}

export function isImageMime(type: string | undefined | null): boolean {
  return Boolean(type && type.startsWith('image/'))
}
