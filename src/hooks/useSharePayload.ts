/**
 * Loads shared content for the /share route (Web Share Target).
 * Prefers the service-worker cache, then falls back to query params.
 * Image blobs are stored by the SW at /__share_file_N__.
 */
import { useEffect, useState } from 'react'
import { useLocation, useSearchParams } from 'react-router-dom'
import {
  EMPTY_SHARE_PAYLOAD,
  SHARE_CACHE_NAME,
  SHARE_PAYLOAD_CACHE_URL,
  isImageMime,
  shareFileCacheUrl,
  type SharePayload,
  type SharedFileMeta,
} from '../types/share'
import { logError, logInfo } from '../utils/logger'

function hasMeaningfulContent(payload: SharePayload): boolean {
  return Boolean(payload.title || payload.text || payload.url || payload.filesCount > 0)
}

function buildPayload(partial: {
  title?: string
  text?: string
  url?: string
  files?: SharedFileMeta[]
  filesCount?: number
  receivedAt?: string | null
  source: SharePayload['source']
  extraRaw?: Record<string, unknown>
}): SharePayload {
  const files = partial.files ?? []
  const filesCount = partial.filesCount ?? files.length
  const title = partial.title ?? ''
  const text = partial.text ?? ''
  const url = partial.url ?? ''

  return {
    title,
    text,
    url,
    filesCount,
    files,
    receivedAt: partial.receivedAt ?? null,
    source: partial.source,
    raw: {
      title,
      text,
      url,
      filesCount,
      files,
      receivedAt: partial.receivedAt ?? null,
      source: partial.source,
      ...partial.extraRaw,
    },
  }
}

async function readPayloadFromShareCache(): Promise<SharePayload | null> {
  if (!('caches' in window)) return null

  try {
    const cache = await caches.open(SHARE_CACHE_NAME)
    const response = await cache.match(SHARE_PAYLOAD_CACHE_URL)
    if (!response) return null

    const data = (await response.json()) as {
      title?: string
      text?: string
      url?: string
      files?: SharedFileMeta[]
      receivedAt?: string
    }

    return buildPayload({
      title: data.title,
      text: data.text,
      url: data.url,
      files: data.files ?? [],
      receivedAt: data.receivedAt ?? null,
      source: 'share_target_post',
      extraRaw: { cacheRecord: data },
    })
  } catch (error) {
    logError('Failed reading share cache', error)
    return null
  }
}

/** Clears the one-shot share cache so a refresh does not re-import. */
export async function clearSharePayloadCache(): Promise<void> {
  if (!('caches' in window)) return
  try {
    const cache = await caches.open(SHARE_CACHE_NAME)
    await cache.delete(SHARE_PAYLOAD_CACHE_URL)
    for (let i = 0; i < 5; i += 1) {
      await cache.delete(shareFileCacheUrl(i))
    }
  } catch (error) {
    logError('Failed clearing share cache', error)
  }
}

/** Rebuild a File from the SW-cached share blob (Android image share). */
export async function readSharedImageFile(
  files: SharedFileMeta[],
  index = 0,
): Promise<File | null> {
  if (!('caches' in window)) return null
  try {
    const cache = await caches.open(SHARE_CACHE_NAME)
    const response = await cache.match(shareFileCacheUrl(index))
    if (!response) return null

    const blob = await response.blob()
    const meta = files[index]
    const type = meta?.type || blob.type || 'image/jpeg'
    if (!isImageMime(type) && !isImageMime(blob.type)) return null

    const name = meta?.name || `shared-image-${index}.jpg`
    return new File([blob], name, {
      type: isImageMime(type) ? type : blob.type || 'image/jpeg',
    })
  } catch (error) {
    logError('Failed reading shared image file', error)
    return null
  }
}

function readPayloadFromQuery(searchParams: URLSearchParams): SharePayload {
  const title = searchParams.get('title') ?? ''
  const text = searchParams.get('text') ?? ''
  const url = searchParams.get('url') ?? ''
  const filesParam = searchParams.get('files')
  const filesCount = filesParam ? Number.parseInt(filesParam, 10) || 0 : 0
  const sharedFlag = searchParams.get('shared')

  return buildPayload({
    title,
    text,
    url,
    filesCount,
    receivedAt: sharedFlag ? new Date().toISOString() : null,
    source: title || text || url || filesCount || sharedFlag ? 'query_params' : 'none',
    extraRaw: { query: Object.fromEntries(searchParams.entries()) },
  })
}

export type UseSharePayloadResult = {
  payload: SharePayload
  hasContent: boolean
  loading: boolean
}

export function useSharePayload(): UseSharePayloadResult {
  const [searchParams] = useSearchParams()
  const location = useLocation()
  const [payload, setPayload] = useState<SharePayload>(EMPTY_SHARE_PAYLOAD)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      setLoading(true)
      const fromCache = await readPayloadFromShareCache()
      const fromQuery = readPayloadFromQuery(searchParams)

      let next = EMPTY_SHARE_PAYLOAD
      if (fromCache && hasMeaningfulContent(fromCache)) {
        next = fromCache
      } else if (hasMeaningfulContent(fromQuery) || fromQuery.source === 'query_params') {
        next = fromQuery
      }

      logInfo('Share Payload resolved', next)
      if (!cancelled) {
        setPayload(next)
        setLoading(false)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [location.pathname, location.search, searchParams])

  return {
    payload,
    hasContent: hasMeaningfulContent(payload),
    loading,
  }
}
