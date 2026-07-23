/**
 * Bottom Ask bar + Import FAB — matches C-Vault mock:
 * search full-width at bottom; thin black + circle above it on the right.
 */
import type { FormEvent } from 'react'
import { useState } from 'react'
import { PlusCircleIcon, SearchIcon } from './icons'

type AskBarProps = {
  onAsk: (query: string) => void
  onImport: () => void
  asking?: boolean
}

export function AskBar({ onAsk, onImport, asking }: AskBarProps) {
  const [query, setQuery] = useState('')

  const submit = (event?: FormEvent) => {
    event?.preventDefault()
    const trimmed = query.trim()
    if (!trimmed || asking) return
    onAsk(trimmed)
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40">
      <div className="pointer-events-auto mx-auto max-w-lg px-4 pb-[max(0.85rem,env(safe-area-inset-bottom))]">
        {/* Import FAB sits above the search bar, right-aligned */}
        <div className="mb-2 flex justify-end pr-1">
          <button
            type="button"
            onClick={onImport}
            className="flex flex-col items-center gap-0.5 text-gray-900"
            aria-label="Import"
          >
            <PlusCircleIcon className="h-12 w-12 text-gray-900" strokeWidth={1.6} />
            <span className="text-[11px] font-semibold tracking-wide text-gray-900">Import</span>
          </button>
        </div>

        <form
          onSubmit={submit}
          className="flex items-center gap-2.5 rounded-full border border-gray-300 bg-white px-4 py-3"
        >
          <button
            type="submit"
            disabled={asking}
            className="text-gray-400"
            aria-label="Ask C-Vault"
          >
            <SearchIcon className="h-[18px] w-[18px]" />
          </button>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search brand, category, code..."
            className="w-full bg-transparent text-sm text-gray-800 outline-none placeholder:text-gray-400"
          />
        </form>
      </div>
    </div>
  )
}
