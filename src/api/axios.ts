import axios from 'axios'

/**
 * Single Axios instance for the entire app.
 * Base URL comes from VITE_API_BASE_URL. Leave it empty to call the same
 * origin (nginx proxies /benefits etc. to the API) — required for HTTPS PWA.
 */
const baseURL = import.meta.env.VITE_API_BASE_URL ?? ''

if (!baseURL && import.meta.env.DEV) {
  console.warn(
    '[C-Vault] VITE_API_BASE_URL is not set. API calls will fail until .env is configured.',
  )
}

export const api = axios.create({
  baseURL,
  timeout: 60_000,
})

api.interceptors.request.use((config) => {
  // JSON by default; FormData must keep browser-generated multipart boundary.
  if (!(config.data instanceof FormData) && !config.headers['Content-Type']) {
    config.headers['Content-Type'] = 'application/json'
  }
  console.log('[C-Vault] API request', {
    method: config.method,
    url: `${config.baseURL ?? ''}${config.url ?? ''}`,
  })
  return config
})

api.interceptors.response.use(
  (response) => {
    console.log('[C-Vault] API response', {
      status: response.status,
      url: response.config.url,
    })
    return response
  },
  (error: unknown) => {
    console.error('[C-Vault] API error', error)
    return Promise.reject(error)
  },
)
