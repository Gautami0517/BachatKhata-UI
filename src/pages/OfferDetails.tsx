/**
 * Offer Details — GET /benefits/:id
 */
import type { ReactNode } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useBenefit } from '../hooks/useBenefit'
import {
  formatDiscount,
  getBenefitLabel,
  getBrandInitials,
} from '../utils/benefitDisplay'

export function OfferDetails() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: benefit, isLoading, isError, refetch } = useBenefit(id)

  if (isLoading) {
    return (
      <main className="mx-auto min-h-[100dvh] max-w-lg bg-white px-5 py-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-32 rounded bg-gray-100" />
          <div className="h-16 w-16 rounded-2xl bg-violet-50" />
          <div className="h-40 rounded-3xl bg-gray-50" />
        </div>
      </main>
    )
  }

  if (isError || !benefit) {
    return (
      <main className="mx-auto flex min-h-[100dvh] max-w-lg flex-col items-center justify-center bg-white px-5 text-center">
        <h1 className="text-lg font-semibold text-gray-900">Offer not found</h1>
        <button
          type="button"
          onClick={() => void refetch()}
          className="mt-4 rounded-full bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white"
        >
          Retry
        </button>
        <button type="button" onClick={() => navigate('/')} className="mt-3 text-sm text-violet-600">
          Back to Dashboard
        </button>
      </main>
    )
  }

  const label = getBenefitLabel(benefit)
  const discount = formatDiscount(benefit)
  const expiry = benefit.expiryDate
    ? new Date(benefit.expiryDate).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : '—'

  const copyCode = async () => {
    if (!benefit.couponCode) return
    try {
      await navigator.clipboard.writeText(benefit.couponCode)
    } catch {
      // ignore
    }
  }

  return (
    <main className="mx-auto min-h-[100dvh] max-w-lg bg-white px-5 pb-10 pt-4">
      <header className="mb-6 flex items-center justify-between">
        <button type="button" onClick={() => navigate(-1)} className="text-xl text-violet-600" aria-label="Back">
          ←
        </button>
        <h1 className="text-base font-bold text-gray-900">Offer Details</h1>
        <button type="button" className="text-xl text-violet-600" aria-label="Share" disabled>
          ↗
        </button>
      </header>

      <div className="flex items-start gap-3">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-100 text-base font-bold text-violet-700">
          {getBrandInitials(label)}
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-xl font-bold text-gray-900">{benefit.displayName || label}</h2>
          <p className="text-sm text-gray-500">{benefit.title}</p>
        </div>
        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-600">
          {discount}
        </span>
      </div>

      <section className="mt-6 rounded-3xl border border-gray-100 bg-white p-4 shadow-sm">
        <DetailRow
          icon="🎟"
          label="Voucher Code"
          value={benefit.couponCode || '—'}
          action={
            benefit.couponCode ? (
              <button type="button" onClick={() => void copyCode()} className="text-violet-600" aria-label="Copy">
                ⎘
              </button>
            ) : null
          }
        />
        <DetailRow icon="%" label="Offer" value={discount} />
        <DetailRow icon="🕒" label="Expires" value={expiry} />
        <DetailRow icon="🏠" label="Category" value={benefit.category || '—'} />
        <DetailRow icon="ℹ" label="Source" value={benefit.source || '—'} last />
      </section>

      <section className="mt-6">
        <h3 className="mb-2 text-base font-bold text-gray-900">About this offer</h3>
        <div className="rounded-2xl bg-gray-50 px-4 py-3 text-sm leading-relaxed text-gray-700 whitespace-pre-wrap">
          {benefit.rawText || benefit.title}
        </div>
      </section>
    </main>
  )
}

function DetailRow({
  icon,
  label,
  value,
  action,
  last,
}: {
  icon: string
  label: string
  value: string
  action?: ReactNode
  last?: boolean
}) {
  return (
    <div className={`flex items-center gap-3 py-3 ${last ? '' : 'border-b border-gray-100'}`}>
      <span className="text-base">{icon}</span>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-gray-400">{label}</p>
        <p className="truncate text-sm font-semibold text-gray-900">{value}</p>
      </div>
      {action}
    </div>
  )
}
