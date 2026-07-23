/**
 * C-Vault Dashboard — visual match to the product mock.
 */
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AskBar } from '../components/AskBar'
import { CouponCard } from '../components/CouponCard'
import { EmptyState } from '../components/EmptyState'
import {
  EMPTY_FILTERS,
  FiltersSheet,
  type DashboardFilters,
} from '../components/FiltersSheet'
import { FilterSlidersIcon, LightningOutlineIcon, SparklesIcon } from '../components/icons'
import { ImportSheet } from '../components/ImportSheet'
import { LoadingCardList } from '../components/LoadingCard'
import { getErrorMessage, useToast } from '../components/ToastProvider'
import { useAuth, userInitials } from '../auth/AuthContext'
import { useAskBenefits } from '../hooks/useBenefitMutations'
import { useBenefits } from '../hooks/useBenefits'
import type { BenefitSort } from '../types/benefit'
import { groupBenefitsByExpiry } from '../utils/benefitDisplay'
import { formatFilterSummary, hasActiveFilters } from '../utils/filterSummary'

const SORT_CHIPS: Array<{ id: BenefitSort; label: string; sparkle?: boolean }> = [
  { id: 'highest_score', label: 'Relevance', sparkle: true },
  { id: 'newest', label: 'Newest' },
  { id: 'highest_discount_pct', label: 'Highest %' },
  { id: 'highest_savings', label: '₹ Highest' },
]

const GROUP_HEADER: Record<string, string> = {
  today: 'text-[#7a3b32]',
  tomorrow: 'text-[#6e5a3a]',
  soon: 'text-[#5c5568]',
  later: 'text-[#5c5568]',
  none: 'text-[#5c5568]',
}

export function Dashboard() {
  const navigate = useNavigate()
  const { pushToast } = useToast()
  const { user } = useAuth()
  const [sort, setSort] = useState<BenefitSort>('expiring_soon')
  const [filters, setFilters] = useState<DashboardFilters>(EMPTY_FILTERS)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [importOpen, setImportOpen] = useState(false)

  const { data, isLoading, isError, refetch, isFetching } = useBenefits({
    sort,
    categories: filters.categories,
    merchants: filters.merchants,
    brands: filters.brands,
  })
  const askMutation = useAskBenefits()

  const benefits = data ?? []
  const groups = useMemo(() => groupBenefitsByExpiry(benefits), [benefits])
  const firstName = user?.name?.trim().split(/\s+/)[0] || 'there'
  const initials = userInitials(user?.name)
  const filtersActive = hasActiveFilters(filters)

  const onAsk = async (query: string) => {
    try {
      const response = await askMutation.mutateAsync(query)
      navigate('/ask', { state: { response, query } })
    } catch (error) {
      pushToast(getErrorMessage(error, 'Ask C-Vault failed'))
    }
  }

  const onApplyFilters = (next: DashboardFilters) => {
    setFilters(next)
    // After Done from a dimension screen: reload sorted by C-Vault score high→low.
    setSort('highest_score')
  }

  return (
    <main className="mx-auto min-h-full bg-[#fcf8fe] px-4 pb-40 pt-5">
      <header className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <LightningOutlineIcon className="h-[22px] w-[22px] text-gray-900" strokeWidth={1.8} />
          <h1 className="text-[22px] font-bold tracking-tight text-[#3b3a8c]">C-Vault</h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-800">Hi! {firstName}</span>
          <button
            type="button"
            onClick={() => navigate('/profile')}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[#e8e4f6] text-xs font-bold text-[#3b3a8c]"
            aria-label="Open profile"
          >
            {initials}
          </button>
        </div>
      </header>

      <div className="relative z-30 mb-4 flex items-center gap-2">
        <div className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {SORT_CHIPS.map((chip) => {
            const selected = sort === chip.id
            return (
              <button
                key={chip.id}
                type="button"
                onClick={() => setSort(chip.id)}
                className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-medium ${
                  selected
                    ? 'bg-gray-900 text-white'
                    : 'border border-gray-300 bg-white text-gray-700'
                }`}
              >
                {chip.sparkle && (
                  <SparklesIcon className={`h-3.5 w-3.5 ${selected ? 'text-white' : 'text-gray-700'}`} />
                )}
                {chip.label}
              </button>
            )
          })}
        </div>

        <button
          type="button"
          onClick={() => setFiltersOpen(true)}
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border ${
            filtersActive
              ? 'border-[#3b3a8c] bg-[#e9e5f6] text-[#3b3a8c]'
              : 'border-gray-300 bg-white text-gray-700'
          }`}
          aria-label="Open filters"
        >
          <FilterSlidersIcon className="h-[18px] w-[18px]" />
        </button>
      </div>

      {filtersActive && (
        <p className="mb-3 text-xs font-medium text-[#3b3a8c]">
          {[
            filters.categories.length
              ? `Category: ${formatFilterSummary(filters.categories)}`
              : null,
            filters.merchants.length
              ? `Merchant: ${formatFilterSummary(filters.merchants)}`
              : null,
            filters.brands.length ? `Brand: ${formatFilterSummary(filters.brands)}` : null,
          ]
            .filter(Boolean)
            .join(' · ')}{' '}
          <button type="button" className="underline" onClick={() => setFilters(EMPTY_FILTERS)}>
            clear
          </button>
        </p>
      )}

      <section>
        {isLoading ? (
          <LoadingCardList count={4} />
        ) : isError ? (
          <div className="rounded-3xl border border-red-100 bg-red-50 px-5 py-8 text-center">
            <h3 className="font-semibold text-red-700">Unable to load benefits</h3>
            <button
              type="button"
              onClick={() => void refetch()}
              className="mt-4 rounded-full bg-[#3b3a8c] px-5 py-2.5 text-sm font-semibold text-white"
            >
              Try again
            </button>
          </div>
        ) : benefits.length === 0 ? (
          <EmptyState
            title="No offers yet"
            description="Tap Import to add an offer from image or text. Shared Google Pay coupons also land here."
          />
        ) : (
          <div className="space-y-5">
            {isFetching && !isLoading && (
              <p className="text-center text-xs text-[#3b3a8c]">Refreshing…</p>
            )}
            {groups.map((group) => (
              <div key={group.key}>
                <h2 className={`mb-2 text-sm font-semibold ${GROUP_HEADER[group.key] ?? 'text-stone-600'}`}>
                  {group.label}
                </h2>
                <div className="space-y-2.5">
                  {group.items.map((benefit, index) => (
                    <CouponCard
                      key={benefit.id}
                      benefit={benefit}
                      index={index}
                      urgency={group.key}
                      showActions
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <AskBar onAsk={(q) => void onAsk(q)} onImport={() => setImportOpen(true)} asking={askMutation.isPending} />

      <ImportSheet
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onImage={() => {
          setImportOpen(false)
          navigate('/import/image')
        }}
        onText={() => {
          setImportOpen(false)
          navigate('/import/text')
        }}
      />

      <FiltersSheet
        open={filtersOpen}
        filters={filters}
        onClose={() => setFiltersOpen(false)}
        onApply={onApplyFilters}
      />
    </main>
  )
}
