/**
 * Dashboard Filters — bottom sheet + multi-select drill-downs.
 * Option lists come from GET /benefits/categories|merchants|brands only.
 */
import { useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  fetchBenefitBrands,
  fetchBenefitCategories,
  fetchBenefitMerchants,
} from '../api/benefits'
import {
  EMPTY_FILTERS,
  filterAvatarTone,
  filterItemInitials,
  formatFilterSummary,
  type DashboardFilters,
} from '../utils/filterSummary'
import { CloseIcon, SearchIcon } from './icons'
import { getErrorMessage, useToast } from './ToastProvider'

type FilterDimension = 'category' | 'merchant' | 'brand'

type FiltersSheetProps = {
  open: boolean
  filters: DashboardFilters
  onClose: () => void
  onApply: (next: DashboardFilters) => void
}

export function FiltersSheet({ open, filters, onClose, onApply }: FiltersSheetProps) {
  const [draft, setDraft] = useState<DashboardFilters>(filters)
  const [dimension, setDimension] = useState<FilterDimension | null>(null)

  useEffect(() => {
    if (!open) return
    setDraft(filters)
    setDimension(null)
  }, [open, filters])

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      if (dimension) setDimension(null)
      else onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, dimension, onClose])

  if (!open) return null

  if (dimension) {
    return (
      <FilterSelectScreen
        dimension={dimension}
        selected={
          dimension === 'category'
            ? draft.categories
            : dimension === 'merchant'
              ? draft.merchants
              : draft.brands
        }
        onBack={() => setDimension(null)}
        onDone={(values) => {
          const next: DashboardFilters = {
            ...draft,
            ...(dimension === 'category'
              ? { categories: values }
              : dimension === 'merchant'
                ? { merchants: values }
                : { brands: values }),
          }
          setDraft(next)
          onApply(next)
          setDimension(null)
          onClose()
        }}
      />
    )
  }

  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center bg-black/35">
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        aria-label="Dismiss filters"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="filters-sheet-title"
        className="relative z-10 w-full max-w-md rounded-t-[28px] bg-white px-5 pb-8 pt-3 shadow-2xl"
      >
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-gray-300" aria-hidden />

        <div className="relative mb-5 flex items-center justify-center">
          <h2 id="filters-sheet-title" className="text-lg font-bold text-[#3b3a8c]">
            Filters
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="absolute right-0 flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-700"
            aria-label="Close filters"
          >
            <CloseIcon className="h-4 w-4" strokeWidth={2} />
          </button>
        </div>

        <div className="space-y-3">
          <FilterRow
            tone="lavender"
            icon={<CategoryGridIcon />}
            label="Category"
            summary={formatFilterSummary(draft.categories)}
            onClick={() => setDimension('category')}
          />
          <FilterRow
            tone="pink"
            icon={<MerchantStoreIcon />}
            label="Merchant"
            summary={formatFilterSummary(draft.merchants)}
            onClick={() => setDimension('merchant')}
          />
          <FilterRow
            tone="blue"
            icon={<BrandTagIcon />}
            label="Brand"
            summary={formatFilterSummary(draft.brands)}
            onClick={() => setDimension('brand')}
          />
        </div>
      </div>
    </div>
  )
}

function FilterRow({
  tone,
  icon,
  label,
  summary,
  onClick,
}: {
  tone: 'lavender' | 'pink' | 'blue'
  icon: ReactNode
  label: string
  summary: string
  onClick: () => void
}) {
  const toneClass =
    tone === 'lavender'
      ? 'bg-[#ebe4f8] text-[#4c3d8f]'
      : tone === 'pink'
        ? 'bg-[#fde8e8] text-[#b42318]'
        : 'bg-[#e8f1fb] text-[#2f5f9a]'

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-2xl border border-gray-100 bg-white px-3.5 py-3.5 text-left shadow-sm"
    >
      <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${toneClass}`}>
        {icon}
      </span>
      <span className="min-w-0 flex-1 text-[15px] font-semibold text-gray-900">{label}</span>
      <span className="max-w-[40%] truncate text-sm text-gray-400">{summary}</span>
      <span className="text-lg text-gray-300" aria-hidden>
        ›
      </span>
    </button>
  )
}

function FilterSelectScreen({
  dimension,
  selected,
  onBack,
  onDone,
}: {
  dimension: FilterDimension
  selected: string[]
  onBack: () => void
  onDone: (values: string[]) => void
}) {
  const { pushToast } = useToast()
  const [query, setQuery] = useState('')
  const [options, setOptions] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [picked, setPicked] = useState<string[]>(selected)

  const title =
    dimension === 'category' ? 'Category' : dimension === 'merchant' ? 'Merchant' : 'Brand'
  const placeholder = `Search ${dimension}...`

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setLoading(true)
      try {
        const list =
          dimension === 'category'
            ? await fetchBenefitCategories()
            : dimension === 'merchant'
              ? await fetchBenefitMerchants()
              : await fetchBenefitBrands()
        if (!cancelled) setOptions(list)
      } catch (error) {
        if (!cancelled) {
          setOptions([])
          pushToast(getErrorMessage(error, `Could not load ${dimension}s`))
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [dimension, pushToast])

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return options
    return options.filter((item) => item.toLowerCase().includes(q))
  }, [options, query])

  const toggle = (value: string) => {
    setPicked((prev) =>
      prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value],
    )
  }

  return (
    <div className="fixed inset-0 z-[95] flex justify-center bg-[#fcf8fe]">
      <div className="flex h-full w-full max-w-md flex-col bg-white">
        <header className="flex items-center gap-3 px-4 pb-3 pt-4">
          <button
            type="button"
            onClick={onBack}
            className="text-xl text-gray-800"
            aria-label="Back"
          >
            ←
          </button>
          <h2 className="flex-1 text-center text-lg font-bold text-[#3b3a8c]">{title}</h2>
          <span className="w-6" aria-hidden />
        </header>

        <div className="px-4 pb-3">
          <label className="flex items-center gap-2 rounded-2xl bg-gray-100 px-3.5 py-3">
            <SearchIcon className="h-4 w-4 shrink-0 text-gray-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={placeholder}
              className="w-full bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400"
            />
          </label>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-4">
          {loading ? (
            <p className="px-3 py-8 text-center text-sm text-gray-500">Loading…</p>
          ) : visible.length === 0 ? (
            <p className="px-3 py-8 text-center text-sm text-gray-500">
              {options.length === 0
                ? `No ${dimension}s in your vault yet.`
                : 'No matches.'}
            </p>
          ) : (
            <ul>
              {visible.map((item) => {
                const checked = picked.includes(item)
                return (
                  <li key={item}>
                    <button
                      type="button"
                      onClick={() => toggle(item)}
                      className="flex w-full items-center gap-3 px-3 py-3.5 text-left"
                    >
                      <span
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold ${filterAvatarTone(item)}`}
                      >
                        {filterItemInitials(item)}
                      </span>
                      <span className="min-w-0 flex-1 truncate text-[15px] font-medium text-gray-900">
                        {item}
                      </span>
                      <span
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${
                          checked
                            ? 'border-[#3b3a8c] bg-[#3b3a8c] text-white'
                            : 'border-gray-300 bg-white'
                        }`}
                        aria-hidden
                      >
                        {checked ? (
                          <svg viewBox="0 0 12 12" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M2.5 6.2 4.8 8.5 9.5 3.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        ) : null}
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        <div className="border-t border-gray-100 px-4 pb-6 pt-3">
          <button
            type="button"
            onClick={() => onDone(picked)}
            className="w-full rounded-2xl bg-[#3b3a8c] py-3.5 text-sm font-semibold text-white"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}

function CategoryGridIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
      <rect x="4" y="4" width="7" height="7" rx="1.5" />
      <rect x="13" y="4" width="7" height="7" rx="1.5" />
      <rect x="4" y="13" width="7" height="7" rx="1.5" />
      <rect x="13" y="13" width="7" height="7" rx="1.5" />
    </svg>
  )
}

function MerchantStoreIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path d="M4 9.5 5.5 5h13L20 9.5" strokeLinejoin="round" />
      <path d="M5 9.5V19h14V9.5" />
      <path d="M10 19v-5h4v5" />
    </svg>
  )
}

function BrandTagIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path d="M3.5 12.5 12.5 3.5h6v6L9.5 18.5a2 2 0 0 1-2.8 0L3.5 15.3a2 2 0 0 1 0-2.8Z" strokeLinejoin="round" />
      <circle cx="16.2" cy="7.8" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  )
}

export { EMPTY_FILTERS }
export type { DashboardFilters }
