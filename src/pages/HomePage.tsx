/**
 * Home page — install entry point and navigation into the Share Target test route.
 */
import { Link } from 'react-router-dom'
import { InstallButton } from '../components/InstallButton'
import { useInstallPrompt } from '../hooks/useInstallPrompt'

export function HomePage() {
  const { canInstall, isInstalled, promptInstall } = useInstallPrompt()

  const statusLabel = isInstalled
    ? 'Installed (standalone / display-mode)'
    : canInstall
      ? 'Installable — prompt available'
      : 'Not installed (install prompt not available yet)'

  return (
    <main className="page home-page">
      <header className="hero">
        <p className="eyebrow">PWA Test</p>
        <h1>BachatKhata</h1>
        <p className="tagline">AI Financial Memory Agent — Share Target proof of concept</p>
      </header>

      <section className="panel" aria-labelledby="install-status-heading">
        <h2 id="install-status-heading">Installation Status</h2>
        <p className="status-line" data-installed={isInstalled ? 'true' : 'false'}>
          {statusLabel}
        </p>

        {/* Large primary CTA — only rendered when beforeinstallprompt is available */}
        <div className="cta-stack">
          <InstallButton
            className="btn-large"
            canInstall={canInstall}
            isInstalled={isInstalled}
            onInstall={promptInstall}
          />
          <Link className="btn btn-secondary btn-large" to="/share">
            Go to Share Test
          </Link>
        </div>
      </section>

      <section className="panel hints">
        <h2>How to verify Share Target</h2>
        <ol>
          <li>Deploy over HTTPS (Vercel) and open the site in Chrome on Android.</li>
          <li>Install BachatKhata to the home screen.</li>
          <li>Open Google Pay → share coupon / text.</li>
          <li>Confirm BachatKhata appears in the Android Share Sheet.</li>
          <li>Share into BachatKhata and inspect the payload on /share.</li>
        </ol>
      </section>
    </main>
  )
}
