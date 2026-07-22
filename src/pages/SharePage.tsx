/**
 * Share Target landing page.
 * Android opens this route after the service worker handles the Share Sheet POST.
 */
import { Link } from 'react-router-dom'
import { SharePayloadDisplay } from '../components/SharePayloadDisplay'
import { useSharePayload } from '../hooks/useSharePayload'
import { logInfo } from '../utils/logger'
import { useEffect } from 'react'

export function SharePage() {
  const { payload, hasContent, loading } = useSharePayload()

  useEffect(() => {
    logInfo('Share page mounted')
  }, [])

  return (
    <main className="page share-page">
      <header className="hero compact">
        <p className="eyebrow">Share Target</p>
        <h1>BachatKhata</h1>
        <p className="tagline">Payload received from the Android Share Sheet</p>
      </header>

      <section className="panel" aria-labelledby="share-payload-heading">
        <h2 id="share-payload-heading">Shared Content</h2>
        <SharePayloadDisplay payload={payload} hasContent={hasContent} loading={loading} />
      </section>

      <div className="cta-stack">
        <Link className="btn btn-secondary" to="/">
          Back to Home
        </Link>
      </div>
    </main>
  )
}
