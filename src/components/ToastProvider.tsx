/**
 * Lightweight toast store — user-friendly API error feedback.
 */
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

type Toast = { id: number; message: string; tone: 'error' | 'success' | 'info' }

type ToastContextValue = {
  pushToast: (message: string, tone?: Toast['tone']) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const pushToast = useCallback((message: string, tone: Toast['tone'] = 'error') => {
    const id = Date.now() + Math.random()
    setToasts((prev) => [...prev, { id, message, tone }])
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 3500)
  }, [])

  const value = useMemo(() => ({ pushToast }), [pushToast])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-0 top-4 z-[100] flex flex-col items-center gap-2 px-4"
        aria-live="polite"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto max-w-sm rounded-2xl px-4 py-3 text-sm font-medium shadow-lg ${
              toast.tone === 'error'
                ? 'bg-red-600 text-white'
                : toast.tone === 'success'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gray-900 text-white'
            }`}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}

export function getErrorMessage(error: unknown, fallback = 'Something went wrong'): string {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const axiosLike = error as {
      response?: { status?: number; data?: { message?: string | string[] } }
    }
    const status = axiosLike.response?.status
    const message = axiosLike.response?.data?.message
    const fromBody = Array.isArray(message)
      ? message.join(', ')
      : typeof message === 'string' && message.trim()
        ? message
        : null

    if (fromBody) return fromBody
    if (status === 401) return 'Session expired. Please sign in again.'
    if (status === 403) return 'You do not have permission for this action.'
    if (status === 409) return 'That email is already registered.'
    if (status === 400) return 'Please check your input and try again.'
  }
  if (error instanceof Error && error.message) return error.message
  return fallback
}
