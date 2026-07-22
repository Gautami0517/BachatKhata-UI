import axios from 'axios'

/**
 * Single Axios instance for the entire app.
 * Base URL comes only from VITE_API_BASE_URL so switching to a deployed
 * backend never requires code changes — only an env update.
 */
const baseURL = import.meta.env.VITE_API_BASE_URL

if (!baseURL) {
  console.warn(
    '[BenefitAI] VITE_API_BASE_URL is not set. API calls will fail until .env is configured.',
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
