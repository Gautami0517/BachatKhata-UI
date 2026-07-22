/**
 * Coupon list card — Brand/Merchant/Title fallbacks, discount, savings, code, expiry.
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
  isExpiringSoon,
} from '../utils/benefitDisplay'

type CouponCardProps = {
  benefit: Benefit
  index?: number
}

export function CouponCard({ benefit, index = 0 }: CouponCardProps) {
  const label = getBenefitLabel(benefit)
  const subtitle = getBenefitSubtitle(benefit)
  const discount = formatDiscount(benefit)
  const expiry = formatExpiryLabel(benefit.expiryDate)
  const urgent = isExpiringSoon(benefit.expiryDate)

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, delay: Math.min(index * 0.04, 0.24) }}
      className={`rounded-3xl border bg-white p-4 shadow-sm ${
        urgent ? 'border-red-200' : 'border-gray-100'
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-violet-100 text-sm font-bold text-violet-700"
          aria-hidden
        >
          {getBrandInitials(label)}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="truncate text-[15px] font-semibold text-gray-900">{label}</h3>
              <p className="mt-0.5 line-clamp-2 text-sm text-gray-500">{subtitle}</p>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-sm font-bold text-gray-900">{discount}</p>
              <span
                className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                  urgent ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-500'
                }`}
              >
                {expiry}
              </span>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
            {benefit.maximumDiscount != null && (
              <span>
                Max savings{' '}
                <strong className="font-semibold text-emerald-600">
                  {formatCurrency(benefit.maximumDiscount)}
                </strong>
              </span>
            )}
            {benefit.couponCode && (
              <span className="rounded-md bg-gray-50 px-1.5 py-0.5 font-mono text-[11px] text-gray-700">
                {benefit.couponCode}
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.article>
  )
}
