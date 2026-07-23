/**
 * Profile — notification settings (ON / OFF). Mock user chrome only.
 */
import { useNavigate } from 'react-router-dom'
import { useNotifications } from '../hooks/useNotifications'
import { getErrorMessage, useToast } from '../components/ToastProvider'

export function Profile() {
  const navigate = useNavigate()
  const { pushToast } = useToast()
  const { supported, permission, enabled, busy, enable, disable } = useNotifications()

  const setOn = async () => {
    const result = await enable()
    if (!result.ok) {
      pushToast(result.reason || getErrorMessage(null, 'Could not enable notifications'))
      return
    }
    pushToast('Notifications turned ON', 'success')
  }

  const setOff = async () => {
    const result = await disable()
    if (!result.ok) {
      pushToast(result.reason || getErrorMessage(null, 'Could not disable notifications'))
      return
    }
    pushToast('Notifications turned OFF', 'info')
  }

  return (
    <main className="mx-auto min-h-[100dvh] max-w-lg bg-[#f9f9fb] px-5 pb-10 pt-4">
      <header className="mb-6 flex items-center gap-3">
        <button type="button" onClick={() => navigate(-1)} className="text-xl text-gray-800" aria-label="Back">
          ←
        </button>
        <h1 className="text-lg font-bold text-gray-900">Profile</h1>
      </header>

      <section className="mb-5 flex items-center gap-3 rounded-3xl border border-gray-100 bg-white p-4 shadow-sm">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#e9e5f6] text-sm font-bold text-[#3b3a8c]">
          PR
        </span>
        <div>
          <p className="font-semibold text-gray-900">Prajwal</p>
          <p className="text-xs text-gray-500">C-Vault demo account</p>
        </div>
      </section>

      <section className="rounded-3xl border border-gray-100 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-900">Notification Settings</h2>
        <p className="mt-1 text-xs leading-relaxed text-gray-500">
          Expiry reminders for benefits in your vault. More notification types can use this
          same channel later.
        </p>

        {!supported ? (
          <p className="mt-4 rounded-2xl bg-gray-50 px-3 py-3 text-xs text-gray-600">
            Push notifications are not supported in this browser.
          </p>
        ) : (
          <>
            <div className="mt-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-gray-900">Notifications</p>
                <p className="text-xs text-gray-500">
                  Browser: {permission}
                  {enabled ? ' · subscribed' : ''}
                </p>
              </div>
              <div className="flex rounded-full bg-gray-100 p-1">
                <button
                  type="button"
                  disabled={busy || enabled}
                  onClick={() => void setOn()}
                  className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                    enabled ? 'bg-[#3b3a8c] text-white shadow-sm' : 'text-gray-500'
                  }`}
                >
                  ON
                </button>
                <button
                  type="button"
                  disabled={busy || !enabled}
                  onClick={() => void setOff()}
                  className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                    !enabled ? 'bg-gray-700 text-white shadow-sm' : 'text-gray-500'
                  }`}
                >
                  OFF
                </button>
              </div>
            </div>

            {permission === 'denied' && (
              <p className="mt-3 text-xs text-amber-700">
                Permission is blocked at the browser level. Change it in site settings, then tap
                ON again.
              </p>
            )}
          </>
        )}
      </section>
    </main>
  )
}
