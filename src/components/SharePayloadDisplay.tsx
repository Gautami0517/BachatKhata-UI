/**
 * Renders the shared payload for visual verification of the Share Target path.
 * Everything is also dumped into one readonly textarea for easy copy/paste debugging.
 */
import type { SharePayload } from '../types/share'

type SharePayloadDisplayProps = {
  payload: SharePayload
  hasContent: boolean
  loading: boolean
}

export function SharePayloadDisplay({ payload, hasContent, loading }: SharePayloadDisplayProps) {
  if (loading) {
    return <p className="muted">Loading shared content…</p>
  }

  if (!hasContent) {
    return (
      <p className="empty-state" role="status">
        No shared content received.
      </p>
    )
  }

  const textareaValue = [
    '=== Received Text ===',
    payload.text || '(empty)',
    '',
    '=== Received URL ===',
    payload.url || '(empty)',
    '',
    '=== Received Title ===',
    payload.title || '(empty)',
    '',
    '=== Received Files Count ===',
    String(payload.filesCount),
    '',
    '=== Raw Payload ===',
    JSON.stringify(payload.raw, null, 2),
  ].join('\n')

  return (
    <div className="share-results">
      <dl className="share-summary">
        <div>
          <dt>Received Text</dt>
          <dd>{payload.text || '—'}</dd>
        </div>
        <div>
          <dt>Received URL</dt>
          <dd>{payload.url || '—'}</dd>
        </div>
        <div>
          <dt>Received Files Count</dt>
          <dd>{payload.filesCount}</dd>
        </div>
      </dl>

      <label className="textarea-label" htmlFor="raw-share-payload">
        Raw Payload
      </label>
      <textarea
        id="raw-share-payload"
        className="raw-payload"
        readOnly
        value={textareaValue}
        rows={18}
        spellCheck={false}
      />
    </div>
  )
}
