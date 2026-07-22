/**
 * Explicit install CTA for Chromium-based browsers.
 * Hidden when the app is already installed or when beforeinstallprompt
 * is unavailable (e.g. iOS Safari / already installed).
 */
type InstallButtonProps = {
  canInstall: boolean
  isInstalled: boolean
  onInstall: () => void | Promise<void>
  className?: string
}

export function InstallButton({ canInstall, isInstalled, onInstall, className }: InstallButtonProps) {
  if (isInstalled || !canInstall) {
    return null
  }

  return (
    <button
      type="button"
      className={className ? `btn btn-primary ${className}` : 'btn btn-primary'}
      onClick={() => {
        void onInstall()
      }}
    >
      Install BachatKhata
    </button>
  )
}
