/**
 * Offer Details — GET /benefits/:id
 * Header ↗ copies voucher code (if any) and opens merchant URL when available.
 */
import type { ReactNode } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useToast } from '../components/ToastProvider'
import { useBenefit } from '../hooks/useBenefit'
import {
  formatDiscount,
  getBenefitLabel,
  getBrandInitials,
  resolveOfferUrl,
} from '../utils/benefitDisplay'

export function OfferDetails() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { pushToast } = useToast()
  const { data: benefit, isLoading, isError, refetch } = useBenefit(id)

  if (isLoading) {
    return (
      <main className="mx-auto min-h-full overflow-x-hidden bg-[#fcf8fe] px-5 py-6">
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
      <main className="mx-auto flex min-h-full flex-col items-center justify-center overflow-x-hidden bg-[#fcf8fe] px-5 text-center">
        <h1 className="text-lg font-semibold text-gray-900">Offer not found</h1>
        <button
          type="button"
          onClick={() => void refetch()}
          className="mt-4 rounded-full bg-[#3b3a8c] px-5 py-2.5 text-sm font-semibold text-white"
        >
          Retry
        </button>
        <button type="button" onClick={() => navigate('/')} className="mt-3 text-sm text-[#3b3a8c]">
          Back to Dashboard
        </button>
      </main>
    )
  }

  const label = getBenefitLabel(benefit)
  const discount = formatDiscount(benefit)
  const offerUrl = resolveOfferUrl(benefit)
  const expiry = benefit.expiryDate
    ? new Date(benefit.expiryDate).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : '—'

  const copyCode = async (): Promise<boolean> => {
    if (!benefit.couponCode) return false
    try {
      await navigator.clipboard.writeText(benefit.couponCode)
      return true
    } catch {
      return false
    }
  }

  const openMerchant = async () => {
    if (!offerUrl) return

    const copied = await copyCode()
    window.open(offerUrl, '_blank', 'noopener,noreferrer')

    if (copied) {
      pushToast('Code copied — paste it at checkout', 'success')
    } else if (benefit.couponCode) {
      pushToast('Opened store — copy the code manually if needed', 'info')
    } else {
      pushToast('Opened store', 'info')
    }
  }

  return (
    <main className="mx-auto min-h-full overflow-x-hidden bg-[#fcf8fe] px-5 pb-10 pt-4">
      <header className="mb-6 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="shrink-0 text-xl text-[#3b3a8c]"
          aria-label="Back"
        >
          ←
        </button>
        <h1 className="min-w-0 truncate text-center text-base font-bold text-gray-900">
          Offer Details
        </h1>
        {offerUrl ? (
          <button
            type="button"
            onClick={() => void openMerchant()}
            className="shrink-0 text-xl text-[#3b3a8c]"
            aria-label="Copy code and open store"
            title="Copy code and open store"
          >
            ↗
          </button>
        ) : (
          <span className="inline-block w-6 shrink-0" aria-hidden />
        )}
      </header>

      <div className="flex items-start gap-3">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#e9e5f6] text-base font-bold text-[#3b3a8c]">
          {getBrandInitials(label)}
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="break-words text-xl font-bold text-gray-900">
            {benefit.displayName || label}
          </h2>
          <p className="mt-0.5 break-words text-sm text-gray-500">{benefit.title}</p>
        </div>
        <span className="shrink-0 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-600">
          {discount}
        </span>
      </div>

      <section className="mt-6 overflow-hidden rounded-3xl border border-gray-100 bg-white p-4 shadow-sm">
        <DetailRow
          icon="🎟"
          label="Voucher Code"
          value={benefit.couponCode || '—'}
          action={
            benefit.couponCode ? (
              <button
                type="button"
                onClick={() => {
                  void copyCode().then((ok) => {
                    if (ok) pushToast('Code copied', 'success')
                  })
                }}
                className="text-[#3b3a8c]"
                aria-label="Copy"
              >
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

      <section className="mt-6 min-w-0">
        <h3 className="mb-2 text-base font-bold text-gray-900">About this offer</h3>
        <div className="max-w-full overflow-hidden rounded-2xl bg-[#f3eef8] px-4 py-3 text-sm leading-relaxed text-gray-700 break-words whitespace-pre-wrap [overflow-wrap:anywhere]">
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
    <div className={`flex items-start gap-3 py-3 ${last ? '' : 'border-b border-gray-100'}`}>
      <span className="mt-0.5 shrink-0 text-base">{icon}</span>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-gray-400">{label}</p>
        <p className="break-words text-sm font-semibold text-gray-900 [overflow-wrap:anywhere]">
          {value}
        </p>
      </div>
      {action ? <div className="shrink-0 pt-1">{action}</div> : null}
    </div>
  )
}
