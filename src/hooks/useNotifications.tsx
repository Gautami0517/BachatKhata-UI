/**
 * Notification context + useNotifications hook.
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
import { useAuth } from '../auth/AuthContext'
import { NotificationService } from '../services/NotificationService'
import { logInfo } from '../utils/logger'

type NotificationContextValue = {
  supported: boolean
  permission: NotificationPermission | 'unsupported'
  preferenceEnabled: boolean
  enabled: boolean
  busy: boolean
  enable: () => Promise<{ ok: boolean; reason?: string }>
  disable: () => Promise<{ ok: boolean; reason?: string }>
  refresh: () => void
}

const NotificationContext = createContext<NotificationContextValue | null>(null)

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, isBootstrapping } = useAuth()
  const supported = NotificationService.isSupported()
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>(
    () => NotificationService.getPermission(),
  )
  const [preferenceEnabled, setPreferenceEnabled] = useState(() =>
    NotificationService.getPreferenceEnabled(),
  )
  const [busy, setBusy] = useState(false)

  const refresh = useCallback(() => {
    setPermission(NotificationService.getPermission())
    setPreferenceEnabled(NotificationService.getPreferenceEnabled())
  }, [])

  // After JWT is ready: upsert push under this user if permission already granted.
  useEffect(() => {
    refresh()
    if (isBootstrapping || !isAuthenticated) return
    void NotificationService.syncAfterLogin().then(() => refresh())
    logInfo('NotificationProvider sync (authenticated)', {
      supported,
      permission: NotificationService.getPermission(),
    })
  }, [refresh, supported, isAuthenticated, isBootstrapping])

  const enable = useCallback(async () => {
    setBusy(true)
    try {
      const result = await NotificationService.enable()
      refresh()
      return result
    } finally {
      setBusy(false)
    }
  }, [refresh])

  const disable = useCallback(async () => {
    setBusy(true)
    try {
      const result = await NotificationService.disable()
      refresh()
      return result
    } finally {
      setBusy(false)
    }
  }, [refresh])

  const enabled = permission === 'granted' && preferenceEnabled

  const value = useMemo(
    () => ({
      supported,
      permission,
      preferenceEnabled,
      enabled,
      busy,
      enable,
      disable,
      refresh,
    }),
    [supported, permission, preferenceEnabled, enabled, busy, enable, disable, refresh],
  )

  return (
    <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>
  )
}

export function useNotifications(): NotificationContextValue {
  const ctx = useContext(NotificationContext)
  if (!ctx) {
    throw new Error('useNotifications must be used within NotificationProvider')
  }
  return ctx
}
