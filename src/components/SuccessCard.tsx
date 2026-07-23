/**
 * Success confirmation after import / save.
 * benefitScore sits between the detail card and View Dashboard (color bands).
 */
import { motion } from 'framer-motion'
import type { Benefit } from '../types/benefit'
import {
  benefitScoreTextClass,
  formatBenefitScore,
  formatDiscount,
  getBenefitLabel,
  getBenefitSubtitle,
  getBrandInitials,
} from '../utils/benefitDisplay'

type SuccessCardProps = {
  benefit: Benefit
  onViewDashboard: () => void
}

export function SuccessCard({ benefit, onViewDashboard }: SuccessCardProps) {
  const label = getBenefitLabel(benefit)
  const scoreLabel = formatBenefitScore(benefit.benefitScore)
  const scoreColor =
    benefit.benefitScore != null && Number.isFinite(benefit.benefitScore)
      ? benefitScoreTextClass(benefit.benefitScore)
      : 'text-gray-400'
  const expiryLabel = benefit.expiryDate
    ? new Date(benefit.expiryDate).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : '—'

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex min-h-full flex-col items-center justify-center bg-[#fcf8fe] px-5 py-10"
    >
      <div className="relative">
        <div className="absolute -inset-6 text-center text-lg opacity-80" aria-hidden>
          <span className="absolute left-0 top-2 text-yellow-400">◆</span>
          <span className="absolute right-2 top-0 text-sky-400">●</span>
          <span className="absolute bottom-0 left-4 text-emerald-400">■</span>
          <span className="absolute bottom-2 right-0 text-violet-400">●</span>
        </div>
        <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500 text-4xl text-white shadow-lg shadow-emerald-200">
          ✓
        </div>
      </div>

      <h1 className="mt-5 text-2xl font-bold text-gray-900">Offer Imported!</h1>
      <p className="mt-1 text-sm text-gray-500">Your offer has been saved successfully</p>

      <div className="mt-6 w-full max-w-md rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100 text-sm font-bold text-violet-700">
            {getBrandInitials(label)}
          </div>
          <div>
            <p className="font-semibold text-gray-900">{label}</p>
            <p className="text-sm text-gray-500">{getBenefitSubtitle(benefit)}</p>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-gray-100 text-sm">
          <Row label="Discount" value={formatDiscount(benefit)} accent />
          <Row label="Voucher Code" value={benefit.couponCode?.trim() || '—'} mono />
          <Row label="Expiry" value={expiryLabel} accent />
        </dl>
      </div>

      <p className={`mt-5 text-center text-base font-semibold tabular-nums ${scoreColor}`}>
        {scoreLabel != null ? `Benefit score ${scoreLabel}` : 'Benefit score —'}
      </p>

      <button
        type="button"
        onClick={onViewDashboard}
        className="mt-6 w-full max-w-md rounded-full bg-[#3b3a8c] px-5 py-3.5 text-sm font-semibold text-white shadow-md"
      >
        View Dashboard
      </button>
    </motion.div>
  )
}

function Row({
  label,
  value,
  accent,
  mono,
}: {
  label: string
  value: string
  accent?: boolean
  mono?: boolean
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-3">
      <dt className="text-gray-500">{label}</dt>
      <dd
        className={`text-right font-semibold ${accent ? 'text-emerald-600' : 'text-gray-900'} ${
          mono ? 'font-mono text-xs' : ''
        }`}
      >
        {value}
      </dd>
    </div>
  )
}
