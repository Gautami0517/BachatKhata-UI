/**
 * One-shot launch popup: Enable push notifications? Yes / No.
 * Shown on each app load when notifications are not already enabled.
 * Permanent ON/OFF control lives only in Profile.
 */
import { useEffect, useState } from 'react'
import { useNotifications } from '../hooks/useNotifications'
import { LightningIcon } from './icons'
import { useToast } from './ToastProvider'

export function NotificationLaunchPrompt() {
  const { supported, enabled, busy, enable, permission } = useNotifications()
  const { pushToast } = useToast()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!supported) return

    // Wait briefly so preference/permission state has settled after syncOnLaunch.
    const timer = window.setTimeout(() => {
      if (enabled) return
      // Browser already blocked — Profile can still explain; no nag popup.
      if (permission === 'denied') return
      setOpen(true)
    }, 500)

    return () => window.clearTimeout(timer)
  }, [supported, enabled, permission])

  if (!open) return null

  const onYes = async () => {
    const result = await enable()
    setOpen(false)
    if (!result.ok) {
      pushToast(result.reason || 'Could not enable notifications')
    } else {
      pushToast('Notifications enabled', 'success')
    }
  }

  const onNo = () => {
    setOpen(false)
  }

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/35 px-6">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="notif-prompt-title"
        className="w-full max-w-[20rem] rounded-3xl border border-gray-200 bg-white p-5 shadow-2xl"
      >
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-gray-900 bg-[#e9e5f6]">
          <LightningIcon className="h-5 w-5 text-gray-900" />
        </div>
        <h2 id="notif-prompt-title" className="text-center text-base font-bold text-gray-900">
          Enable push notifications?
        </h2>
        <p className="mt-2 text-center text-sm leading-relaxed text-gray-500">
          Get reminders before your benefits expire. You can change this anytime in Profile.
        </p>
        <div className="mt-5 grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={onNo}
            disabled={busy}
            className="rounded-full border border-gray-300 bg-white py-2.5 text-sm font-semibold text-gray-700"
          >
            No
          </button>
          <button
            type="button"
            onClick={() => void onYes()}
            disabled={busy}
            className="rounded-full bg-[#3b3a8c] py-2.5 text-sm font-semibold text-white disabled:opacity-60"
          >
            {busy ? '…' : 'Yes'}
          </button>
        </div>
      </div>
    </div>
  )
}
