/**
 * Ask C-Vault results — from POST /benefits/ask (never GET /search).
 * Keep API order (Ask relevance `score`). benefitScore is display-only.
 */
import { useLocation, useNavigate } from 'react-router-dom'
import { CouponCard } from '../components/CouponCard'
import type { AskResponse } from '../types/benefit'

type LocationState = {
  response?: AskResponse
  query?: string
}

export function AskResults() {
  const navigate = useNavigate()
  const location = useLocation()
  const state = (location.state ?? {}) as LocationState
  const response = state.response

  if (!response) {
    return (
      <main className="mx-auto flex min-h-full flex-col items-center justify-center bg-[#fcf8fe] px-5 text-center">
        <p className="text-sm text-gray-500">No ask results. Try from the dashboard search bar.</p>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="mt-4 rounded-full bg-[#3b3a8c] px-5 py-2.5 text-sm font-semibold text-white"
        >
          Back to Dashboard
        </button>
      </main>
    )
  }

  const isFallback = response.matchType === 'category_fallback'
  const isEmpty = response.totalResults === 0 || response.results.length === 0
  const showMessage = Boolean(response.message?.trim())

  const topHighlightLabel = (() => {
    if (isEmpty) return null
    if (isFallback) return 'Best similar match'
    return 'Best match'
  })()

  return (
    <main className="mx-auto min-h-full bg-[#fcf8fe] px-4 pb-10 pt-4">
      <header className="mb-4 flex items-center gap-3">
        <button type="button" onClick={() => navigate('/')} className="text-xl text-gray-800" aria-label="Back">
          ←
        </button>
        <div>
          <h1 className="text-lg font-bold text-gray-900">Ask C-Vault</h1>
          <p className="text-xs text-gray-500">“{response.query}”</p>
        </div>
      </header>

      {showMessage && response.message && (
        <div
          className={`mb-4 rounded-2xl px-4 py-3 text-sm ${
            isFallback
              ? 'border border-amber-200 bg-amber-50 text-amber-950'
              : 'border border-gray-200 bg-white text-gray-700'
          }`}
          role="status"
        >
          {isFallback && (
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-amber-700">
              Similar offers
            </p>
          )}
          <p className={isFallback ? 'font-medium leading-relaxed' : 'leading-relaxed'}>
            {response.message}
          </p>
        </div>
      )}

      {isEmpty ? (
        <div className="rounded-3xl border border-dashed border-violet-200 bg-white px-5 py-10 text-center">
          <p className="font-semibold text-gray-900">No matching benefits</p>
          <p className="mt-2 text-sm text-gray-500">
            {response.message || 'Try a different brand, category, or code.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3.5">
          <p className="text-xs font-medium text-gray-500">
            {response.totalResults} result{response.totalResults === 1 ? '' : 's'}
            {isFallback ? ' · similar matches' : ''}
          </p>
          {/* API order preserved — sorted by Ask relevance score, not benefitScore */}
          {response.results.map((result, index) => (
            <CouponCard
              key={result.id}
              benefit={result}
              index={index}
              highlightLabel={index === 0 ? topHighlightLabel : null}
            />
          ))}
        </div>
      )}
    </main>
  )
}
