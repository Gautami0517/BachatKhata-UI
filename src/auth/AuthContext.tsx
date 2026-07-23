/**
 * Auth session — login / signup (then login) / logout / cold-start /auth/me.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import * as authApi from '../api/auth'
import {
  clearSession,
  getAccessToken,
  getRefreshToken,
  getStoredUser,
  setSession,
  setStoredUser,
} from '../api/authStorage'
import type { AuthUser, LoginBody, SignupBody } from '../types/auth'
import { NotificationService } from '../services/NotificationService'
import { logInfo } from '../utils/logger'

type AuthContextValue = {
  user: AuthUser | null
  accessToken: string | null
  isAuthenticated: boolean
  isBootstrapping: boolean
  login: (body: LoginBody) => Promise<void>
  signup: (body: SignupBody) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => getStoredUser())
  const [accessToken, setAccessToken] = useState<string | null>(() => getAccessToken())
  const [isBootstrapping, setIsBootstrapping] = useState(() => Boolean(getAccessToken()))

  useEffect(() => {
    let cancelled = false

    async function bootstrap() {
      const token = getAccessToken()
      if (!token) {
        setIsBootstrapping(false)
        return
      }

      try {
        const me = await authApi.fetchMe()
        if (cancelled) return
        setUser(me)
        setStoredUser(me)
        setAccessToken(getAccessToken() ?? token)
        logInfo('Session validated via /auth/me', { userId: me.id })
      } catch {
        // Keep a persisted session whenever tokens remain (offline / blip).
        // Only treat as logged out if storage was cleared (revoked refresh).
        if (cancelled) return
        const still = getAccessToken()
        const stored = getStoredUser()
        if (still) {
          setAccessToken(still)
          setUser(stored)
          logInfo('Keeping local session after bootstrap check failed')
        } else {
          setAccessToken(null)
          setUser(null)
        }
      } finally {
        if (!cancelled) setIsBootstrapping(false)
      }
    }

    void bootstrap()
    return () => {
      cancelled = true
    }
  }, [])

  const login = useCallback(async (body: LoginBody) => {
    const data = await authApi.login(body)
    setSession(data.accessToken, data.refreshToken, data.user)
    setAccessToken(data.accessToken)
    setUser(data.user)
    logInfo('Logged in', { userId: data.user.id })
    // Re-bind push under this auth UUID (upsert; replaces legacy "default" userId).
    void NotificationService.syncAfterLogin()
  }, [])

  const signup = useCallback(
    async (body: SignupBody) => {
      await authApi.signup(body)
      // Signup returns 201 empty — tokens only from login.
      await login({ email: body.email, password: body.password })
    },
    [login],
  )

  const logout = useCallback(async () => {
    // Detach push while Bearer is still valid.
    await NotificationService.detachBeforeLogout()

    const refreshToken = getRefreshToken()
    if (refreshToken) {
      try {
        await authApi.logout(refreshToken)
      } catch {
        // Best effort — always clear local session.
      }
    }
    clearSession()
    setAccessToken(null)
    setUser(null)
    logInfo('Logged out')
  }, [])

  const value = useMemo(
    () => ({
      user,
      accessToken,
      isAuthenticated: Boolean(accessToken),
      isBootstrapping,
      login,
      signup,
      logout,
    }),
    [user, accessToken, isBootstrapping, login, signup, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

/** Initials for avatar chip — e.g. "Prajwal Rao" → "PR". */
export function userInitials(name: string | undefined | null): string {
  if (!name?.trim()) return '?'
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length >= 2) {
    return `${parts[0]![0]!}${parts[1]![0]!}`.toUpperCase()
  }
  return name.trim().slice(0, 2).toUpperCase()
}
