/**
 * Public install landing — share this URL with users.
 * Download triggers Android Chrome's native PWA install dialog.
 * Installed app still opens at `/` (Dashboard) via manifest start_url.
 */
import { motion } from 'framer-motion'
import { usePwaInstall } from '../hooks/usePwaInstall'

export function Download() {
  const { status, promptInstall, canInstall } = usePwaInstall()

  const buttonLabel =
    status === 'prompting'
      ? 'Downloading…'
      : status === 'installed'
        ? 'Open C-Vault'
        : status === 'checking'
          ? 'Preparing…'
          : status === 'unavailable'
            ? 'Install unavailable'
            : 'Download'

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 py-16">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,#ede9fe_0%,#fafafa_55%,#f5f3ff_100%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-24 top-24 h-64 w-64 rounded-full bg-violet-200/40 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 bottom-20 h-56 w-56 rounded-full bg-fuchsia-200/30 blur-3xl"
      />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="relative z-10 flex w-full max-w-sm flex-col items-center text-center"
      >
        <motion.img
          src="/icons/icon-192.png"
          alt=""
          width={88}
          height={88}
          initial={{ scale: 0.92, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.08, duration: 0.4 }}
          className="mb-6 rounded-[22px] shadow-[0_12px_40px_rgba(91,33,182,0.18)]"
        />

        <p className="text-sm font-semibold tracking-[0.2em] text-violet-500 uppercase">
          App
        </p>
        <h1 className="mt-2 text-5xl font-bold tracking-tight text-violet-700">C-Vault</h1>
        <p className="mt-3 max-w-xs text-base text-gray-500">
          Save coupons and benefits to your financial memory vault.
        </p>

        <motion.button
          type="button"
          whileTap={canInstall || status === 'installed' ? { scale: 0.98 } : undefined}
          disabled={status === 'checking' || status === 'prompting' || status === 'unavailable'}
          onClick={() => {
            if (status === 'installed') {
              window.location.assign('/')
              return
            }
            void promptInstall()
          }}
          className="mt-10 w-full rounded-2xl bg-violet-600 px-6 py-4 text-lg font-semibold text-white shadow-[0_10px_30px_rgba(124,58,237,0.35)] transition enabled:hover:bg-violet-700 disabled:cursor-not-allowed disabled:bg-violet-300"
        >
          {buttonLabel}
        </motion.button>

        {status === 'unavailable' ? (
          <p className="mt-4 text-sm leading-relaxed text-gray-500">
            Open this page in <span className="font-medium text-gray-700">Chrome on Android</span>,
            then use the browser menu → <span className="font-medium text-gray-700">Install app</span>
            .
          </p>
        ) : (
          <p className="mt-4 text-sm text-gray-400">Android Chrome · one tap to install</p>
        )}
      </motion.div>
    </main>
  )
}
