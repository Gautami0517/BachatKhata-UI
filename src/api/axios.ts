import axios from 'axios'

/**
 * Single Axios instance for the entire app.
 * Base URL comes from VITE_API_BASE_URL. Leave it empty to call the same
 * origin (nginx proxies /benefits etc. to the API) — required for HTTPS PWA.
 */
const baseURL = import.meta.env.VITE_API_BASE_URL ?? ''

if (!baseURL && import.meta.env.DEV) {
  console.warn(
    '[BenefitAI] VITE_API_BASE_URL is not set. In dev, set it to your API (e.g. http://localhost:3000).',
  )
}

export const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60_000,
})

api.interceptors.request.use((config) => {
  console.log('[BenefitAI] API request', {
    method: config.method,
    url: `${config.baseURL ?? ''}${config.url ?? ''}`,
  })
  return config
})

api.interceptors.response.use(
  (response) => {
    console.log('[BenefitAI] API response', {
      status: response.status,
      url: response.config.url,
    })
    return response
  },
  (error: unknown) => {
    console.error('[BenefitAI] API error', error)
    return Promise.reject(error)
  },
)
