/// <reference lib="webworker" />
/**
 * Custom service worker (injectManifest).
 *
 * Why this exists:
 * Android Share Target sends a multipart POST to `action` (/share).
 * A static SPA cannot read that POST body — the SW must intercept it,
 * extract shared fields/files, then redirect the user into the React app.
 */
import { cleanupOutdatedCaches, createHandlerBoundToURL, precacheAndRoute } from 'workbox-precaching'
import { NavigationRoute, registerRoute } from 'workbox-routing'

declare let self: ServiceWorkerGlobalScope

const SHARE_CACHE = 'bachatkhata-share-payload'
const SHARE_PAYLOAD_KEY = '/__last_share_payload__'

precacheAndRoute(self.__WB_MANIFEST)
cleanupOutdatedCaches()

// SPA navigations (GET /share, GET /, deep links) should serve index.html.
registerRoute(
  new NavigationRoute(createHandlerBoundToURL('index.html'), {
    denylist: [/^\/api\//],
  }),
)

type SharePayloadRecord = {
  title: string
  text: string
  url: string
  files: Array<{ name: string; type: string; size: number }>
  receivedAt: string
  source: 'share_target_post'
}

/**
 * Intercept Share Target POSTs from the Android Share Sheet.
 * Stores a JSON summary in Cache Storage, then 303-redirects to /share?...
 * so the React page can render the payload (and still work offline).
 */
async function handleShareTargetPost(request: Request): Promise<Response> {
  console.log('[SW] Share Target POST received', request.url)

  const formData = await request.formData()
  const title = String(formData.get('title') ?? '')
  const text = String(formData.get('text') ?? '')
  const sharedUrl = String(formData.get('url') ?? '')

  // Manifest param name is `media` — collect any File entries Android attached.
  const mediaEntries = formData
    .getAll('media')
    .filter((entry): entry is File => entry instanceof File && entry.size > 0)

  const payload: SharePayloadRecord = {
    title,
    text,
    url: sharedUrl,
    files: mediaEntries.map((file) => ({
      name: file.name,
      type: file.type,
      size: file.size,
    })),
    receivedAt: new Date().toISOString(),
    source: 'share_target_post',
  }

  console.log('[SW] Share payload extracted', payload)

  const cache = await caches.open(SHARE_CACHE)
  await cache.put(
    SHARE_PAYLOAD_KEY,
    new Response(JSON.stringify(payload), {
      headers: { 'Content-Type': 'application/json' },
    }),
  )

  // Keep raw file blobs available for debugging (optional image support).
  for (let index = 0; index < mediaEntries.length; index += 1) {
    await cache.put(`/__share_file_${index}__`, new Response(mediaEntries[index]))
  }

  const redirectUrl = new URL('/share', self.location.origin)
  redirectUrl.searchParams.set('shared', '1')
  if (title) redirectUrl.searchParams.set('title', title)
  if (text) redirectUrl.searchParams.set('text', text)
  if (sharedUrl) redirectUrl.searchParams.set('url', sharedUrl)
  redirectUrl.searchParams.set('files', String(mediaEntries.length))

  console.log('[SW] Redirecting into app', redirectUrl.toString())
  return Response.redirect(redirectUrl.toString(), 303)
}

registerRoute(
  ({ url, request }) => url.pathname === '/share' && request.method === 'POST',
  ({ request }) => handleShareTargetPost(request),
  'POST',
)

self.addEventListener('install', (event) => {
  console.log('[SW] install')
  // Activate immediately so Share Target works without waiting for old SW to leave.
  event.waitUntil(self.skipWaiting())
})

self.addEventListener('activate', (event) => {
  console.log('[SW] activate')
  event.waitUntil(self.clients.claim())
})

self.addEventListener('message', (event) => {
  console.log('[SW] message', event.data)
  if (event.data === 'SKIP_WAITING') {
    void self.skipWaiting()
  }
})
