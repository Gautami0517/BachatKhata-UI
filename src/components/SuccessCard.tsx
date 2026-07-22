/**
 * Success confirmation after a benefit is imported.
 * Shown briefly (~1s) before auto-navigating to the Dashboard.
 */
import { motion } from 'framer-motion'
import type { Benefit } from '../types/benefit'
import {
  formatCurrency,
  formatDiscount,
  formatExpiryLabel,
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.35 }}
      className="flex min-h-[70vh] flex-col items-center justify-center px-5 py-8"
    >
      <div className="w-full max-w-md text-center">
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 18 }}
          className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500 text-4xl text-white shadow-lg shadow-emerald-200"
        >
          ✓
        </motion.div>

        <h1 className="mt-5 text-2xl font-bold text-gray-900">Benefit Imported Successfully</h1>
        <p className="mt-2 text-sm text-gray-500">Your offer has been saved to Financial Memory.</p>

        <div className="mt-6 rounded-[28px] border border-gray-100 bg-white p-5 text-left shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100 text-sm font-bold text-violet-700">
              {getBrandInitials(label)}
            </div>
            <div>
              <p className="font-semibold text-gray-900">{label}</p>
              <p className="text-sm text-gray-500">{getBenefitSubtitle(benefit)}</p>
            </div>
          </div>

          <dl className="mt-5 space-y-3 text-sm">
            <Row label="Discount" value={formatDiscount(benefit)} accent="green" />
            <Row
              label="Coupon Code"
              value={benefit.couponCode?.trim() || '—'}
              mono={Boolean(benefit.couponCode)}
            />
            <Row label="Potential Savings" value={formatCurrency(benefit.maximumDiscount)} accent="green" />
            <Row
              label="Merchant"
              value={benefit.merchant?.trim() || benefit.brand?.trim() || label}
            />
            <Row label="Expiry" value={formatExpiryLabel(benefit.expiryDate)} />
          </dl>
        </div>

        <button
          type="button"
          onClick={onViewDashboard}
          className="mt-6 w-full rounded-full bg-violet-600 px-5 py-3.5 text-sm font-semibold text-white shadow-md shadow-violet-200 transition hover:bg-violet-700"
        >
          View Dashboard
        </button>
        <p className="mt-3 text-xs text-gray-400">Redirecting in 1 sec…</p>
      </div>
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
  accent?: 'green'
  mono?: boolean
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-gray-500">{label}</dt>
      <dd
        className={`text-right font-semibold ${
          accent === 'green' ? 'text-emerald-600' : 'text-gray-900'
        } ${mono ? 'font-mono text-xs' : ''}`}
      >
        {value}
      </dd>
    </div>
  )
}
