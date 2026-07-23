/**
 * Public install landing — /download
 * Branding matches C-Vault (lightning + indigo), not a separate product name.
 */
import { motion } from 'framer-motion'
import { LightningIcon, LightningOutlineIcon } from '../components/icons'
import { usePwaInstall } from '../hooks/usePwaInstall'

export function Download() {
  const { status, promptInstall, canInstall } = usePwaInstall()

  const buttonLabel =
    status === 'prompting'
      ? 'Installing…'
      : status === 'installed'
        ? 'Open C-Vault'
        : status === 'checking'
          ? 'Preparing…'
          : status === 'unavailable'
            ? 'Install unavailable'
            : 'Install C-Vault'

  return (
    <main className="relative flex min-h-full flex-col items-center justify-center overflow-hidden bg-[#fcf8fe] px-6 py-16">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,#e9e5f6_0%,#fcf8fe_55%,#f3f1fa_100%)]"
      />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="relative z-10 flex w-full max-w-sm flex-col items-center text-center"
      >
        <div className="mb-6 flex h-[88px] w-[88px] items-center justify-center rounded-full border-2 border-gray-900 bg-[#e9e5f6] shadow-[0_12px_40px_rgba(59,58,140,0.18)]">
          <LightningIcon className="h-10 w-10 text-gray-900" />
        </div>

        <div className="flex items-center gap-2">
          <LightningOutlineIcon className="h-6 w-6 text-gray-900" strokeWidth={1.8} />
          <h1 className="text-5xl font-bold tracking-tight text-[#3b3a8c]">C-Vault</h1>
        </div>
        <p className="mt-3 max-w-xs text-base text-gray-500">
          Save coupons and offers to your financial memory vault.
        </p>

        <motion.button
          type="button"
          whileTap={canInstall || status === 'installed' ? { scale: 0.98 } : undefined}
          disabled={status === 'checking' || status === 'prompting' || status === 'unavailable'}
          onClick={() => {
            if (status === 'installed') {
              // Auth gate first; already-signed-in users are redirected to Dashboard.
              window.location.assign('/login')
              return
            }
            void promptInstall()
          }}
          className="mt-10 w-full rounded-2xl bg-[#3b3a8c] px-6 py-4 text-lg font-semibold text-white shadow-[0_10px_30px_rgba(59,58,140,0.3)] transition enabled:hover:bg-[#2f2e70] disabled:cursor-not-allowed disabled:bg-[#9b9ac4]"
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
          <p className="mt-4 text-sm text-gray-400">Android Chrome · install C-Vault to your home screen</p>
        )}
      </motion.div>
    </main>
  )
}
