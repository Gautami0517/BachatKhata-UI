/**
 * Ask C-Vault results — from POST /benefits/ask (never GET /search).
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

      {response.matchType === 'category_fallback' && response.message && (
        <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {response.message}
        </div>
      )}

      {response.totalResults === 0 ? (
        <div className="rounded-3xl border border-dashed border-violet-200 bg-white px-5 py-10 text-center">
          <p className="font-semibold text-gray-900">No matching offers</p>
          <p className="mt-2 text-sm text-gray-500">
            {response.message || 'Try a different brand, category, or code.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          <p className="mb-2 text-xs font-medium text-gray-500">
            {response.totalResults} result{response.totalResults === 1 ? '' : 's'}
          </p>
          {response.results.map((result, index) => (
            <CouponCard key={result.id} benefit={result} index={index} />
          ))}
        </div>
      )}
    </main>
  )
}
