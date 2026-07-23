/**
 * Single Axios instance — Bearer JWT + silent refresh on 401.
 */
import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import {
  clearSession,
  getAccessToken,
  getRefreshToken,
  setSession,
  setTokens,
} from './authStorage'

const baseURL = import.meta.env.VITE_API_BASE_URL ?? ''

if (!baseURL && import.meta.env.DEV) {
  console.warn(
    '[C-Vault] VITE_API_BASE_URL is not set. API calls will fail until .env is configured.',
  )
}

/** Public auth routes — never attach Bearer; never trigger refresh retry. */
const PUBLIC_AUTH_PATHS = ['/auth/signup', '/auth/login', '/auth/refresh', '/auth/logout']

function isPublicAuthRequest(url?: string): boolean {
  if (!url) return false
  return PUBLIC_AUTH_PATHS.some((path) => url.includes(path))
}

export const api = axios.create({
  baseURL,
  timeout: 60_000,
})

type RetryConfig = InternalAxiosRequestConfig & { _retry?: boolean }

let isRefreshing = false
let refreshWaiters: Array<{
  resolve: (token: string) => void
  reject: (error: unknown) => void
}> = []

function flushRefreshWaiters(error: unknown, token: string | null) {
  refreshWaiters.forEach(({ resolve, reject }) => {
    if (error || !token) reject(error ?? new Error('Session expired'))
    else resolve(token)
  })
  refreshWaiters = []
}

function redirectToLogin() {
  clearSession()
  if (typeof window === 'undefined') return
  const path = window.location.pathname
  if (path.startsWith('/login') || path.startsWith('/signup') || path.startsWith('/download')) {
    return
  }
  const next = encodeURIComponent(path + window.location.search)
  window.location.assign(`/login?next=${next}`)
}

api.interceptors.request.use((config) => {
  if (!(config.data instanceof FormData) && !config.headers['Content-Type']) {
    config.headers['Content-Type'] = 'application/json'
  }

  if (!isPublicAuthRequest(config.url)) {
    const token = getAccessToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
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
  async (error: AxiosError) => {
    const original = error.config as RetryConfig | undefined
    const status = error.response?.status

    console.error('[C-Vault] API error', error)

    if (
      status !== 401 ||
      !original ||
      original._retry ||
      isPublicAuthRequest(original.url)
    ) {
      return Promise.reject(error)
    }

    const storedRefresh = getRefreshToken()
    if (!storedRefresh) {
      redirectToLogin()
      return Promise.reject(error)
    }

    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        refreshWaiters.push({ resolve, reject })
      }).then((token) => {
        original.headers.Authorization = `Bearer ${token}`
        return api(original)
      })
    }

    original._retry = true
    isRefreshing = true

    try {
      // Use bare axios to avoid interceptor recursion on refresh failure.
      const { data } = await axios.post(
        `${baseURL}/auth/refresh`,
        { refreshToken: storedRefresh },
        { headers: { 'Content-Type': 'application/json' }, timeout: 30_000 },
      )

      const accessToken = data.accessToken as string
      const refreshToken = data.refreshToken as string
      const user = data.user

      if (user) {
        setSession(accessToken, refreshToken, user)
      } else {
        setTokens(accessToken, refreshToken)
      }

      flushRefreshWaiters(null, accessToken)
      original.headers.Authorization = `Bearer ${accessToken}`
      return api(original)
    } catch (refreshError) {
      flushRefreshWaiters(refreshError, null)
      // Only force logout when the server rejects the refresh token.
      // Network / 5xx blips keep local tokens so the user stays signed in.
      const refreshStatus = axios.isAxiosError(refreshError)
        ? refreshError.response?.status
        : undefined
      if (refreshStatus === 401 || refreshStatus === 403) {
        redirectToLogin()
      }
      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  },
)
