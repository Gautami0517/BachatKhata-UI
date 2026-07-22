/**
 * Dashboard — loads benefits from GET /benefits and shows them in a premium vault UI.
 * Search / recommendations are intentionally omitted for this milestone.
 */
import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { CouponCard } from '../components/CouponCard'
import { EmptyState } from '../components/EmptyState'
import { LoadingCardList } from '../components/LoadingCard'
import { PasteImportPanel } from '../components/PasteImportPanel'
import { useBenefits } from '../hooks/useBenefits'
import type { BenefitSort } from '../types/benefit'
import { formatCurrency, groupBenefitsByExpiry, sumPotentialSavings } from '../utils/benefitDisplay'

const SORT_CHIPS: Array<{ id: BenefitSort; label: string }> = [
  { id: 'expiring_soon', label: 'Expiring' },
  { id: 'newest', label: 'Newest' },
  { id: 'highest_discount_pct', label: 'Highest %' },
  { id: 'highest_savings', label: '₹ Highest' },
  { id: 'brand_az', label: 'A-Z' },
]

export function Dashboard() {
  const [sort, setSort] = useState<BenefitSort>('expiring_soon')
  const { data, isLoading, isError, refetch, isFetching } = useBenefits(sort)

  const groups = useMemo(() => groupBenefitsByExpiry(data ?? []), [data])
  const potentialSavings = useMemo(() => sumPotentialSavings(data ?? []), [data])
  const benefits = data ?? []
  const benefitCount = benefits.length

  return (
    <main className="mx-auto min-h-screen max-w-lg px-5 pb-10 pt-6">
      <header className="mb-5 flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-violet-600">BenefitAI</h1>
        <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-600">
          Financial Memory
        </span>
      </header>

      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-[28px] bg-violet-50 p-5"
      >
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-2xl font-bold text-gray-900">{benefitCount} Benefits</p>
            <p className="text-sm text-gray-500">Total in your vault</p>
            <p className="mt-3 text-lg font-semibold text-violet-700">
              {formatCurrency(potentialSavings)}
            </p>
            <p className="text-xs text-gray-500">Potential Savings</p>
          </div>
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-2xl shadow-sm">
            👛
          </div>
        </div>
      </motion.section>

      <PasteImportPanel />

      <div className="mt-5 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {SORT_CHIPS.map((chip) => {
          const selected = chip.id === sort
          return (
            <button
              key={chip.id}
              type="button"
              onClick={() => setSort(chip.id)}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${
                selected
                  ? 'bg-violet-600 text-white shadow-sm shadow-violet-200'
                  : 'bg-white text-gray-600 ring-1 ring-gray-200'
              }`}
            >
              {chip.label}
            </button>
          )
        })}
      </div>

      <section className="mt-5">
        {isLoading ? (
          <LoadingCardList count={4} />
        ) : isError ? (
          <div className="rounded-3xl border border-red-100 bg-red-50 px-5 py-8 text-center">
            <h3 className="font-semibold text-red-700">Unable to load benefits</h3>
            <p className="mt-2 text-sm text-red-600/80">
              Check that the backend is running and VITE_API_BASE_URL is correct.
            </p>
            <button
              type="button"
              onClick={() => void refetch()}
              className="mt-4 rounded-full bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white"
            >
              Try again
            </button>
          </div>
        ) : benefits.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-6">
            {isFetching && !isLoading && (
              <p className="text-center text-xs text-violet-500">Refreshing…</p>
            )}
            {groups.map((group) => (
              <div key={group.key}>
                <h2 className="mb-3 text-sm font-semibold text-gray-500">{group.label}</h2>
                <div className="space-y-3">
                  {group.items.map((benefit, index) => (
                    <CouponCard key={benefit.id} benefit={benefit} index={index} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
