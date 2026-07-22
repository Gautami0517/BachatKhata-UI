/**
 * Loads shared content for the /share route.
 *
 * Order of precedence:
 * 1. Cache written by the service worker after a Share Target POST
 * 2. URL query params (redirect from SW, or manual GET testing)
 * 3. Empty payload
 */
import { useEffect, useState } from 'react'
import { useLocation, useSearchParams } from 'react-router-dom'
import {
  EMPTY_SHARE_PAYLOAD,
  SHARE_CACHE_NAME,
  SHARE_PAYLOAD_CACHE_URL,
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

  const payload: SharePayload = {
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

  return payload
}

async function readPayloadFromShareCache(): Promise<SharePayload | null> {
  if (!('caches' in window)) {
    return null
  }

  try {
    const cache = await caches.open(SHARE_CACHE_NAME)
    const response = await cache.match(SHARE_PAYLOAD_CACHE_URL)
    if (!response) {
      logInfo('Share cache miss — no POST payload stored yet')
      return null
    }

    const data = (await response.json()) as {
      title?: string
      text?: string
      url?: string
      files?: SharedFileMeta[]
      receivedAt?: string
      source?: string
    }

    logInfo('Share cache hit', data)

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

function readPayloadFromQuery(searchParams: URLSearchParams): SharePayload {
  const title = searchParams.get('title') ?? ''
  const text = searchParams.get('text') ?? ''
  const url = searchParams.get('url') ?? ''
  const filesParam = searchParams.get('files')
  const filesCount = filesParam ? Number.parseInt(filesParam, 10) || 0 : 0
  const sharedFlag = searchParams.get('shared')

  const queryObject = Object.fromEntries(searchParams.entries())

  return buildPayload({
    title,
    text,
    url,
    filesCount,
    receivedAt: sharedFlag ? new Date().toISOString() : null,
    source: title || text || url || filesCount || sharedFlag ? 'query_params' : 'none',
    extraRaw: { query: queryObject },
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

    logInfo('Navigation Events — /share effect', {
      pathname: location.pathname,
      search: location.search,
      href: window.location.href,
    })

    const load = async () => {
      setLoading(true)

      const fromCache = await readPayloadFromShareCache()
      const fromQuery = readPayloadFromQuery(searchParams)

      // Prefer cache (full POST body) when present; fall back to query string.
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
