/**
 * Dashboard coupon card — C-Vault style with group-aware border accents.
 */
import { Link } from 'react-router-dom'
import type { AskResult, Benefit } from '../types/benefit'
import {
  formatDiscount,
  getBenefitLabel,
  getBenefitSubtitle,
  getBrandInitials,
} from '../utils/benefitDisplay'

type CardBenefit = Benefit | AskResult

const AVATAR_TONES = [
  'bg-[#fde8e8] text-[#b42318]',
  'bg-[#f5ead7] text-[#8a5a20]',
  'bg-[#ebe4f8] text-[#4c3d8f]',
  'bg-[#e8f1fb] text-[#2f5f9a]',
  'bg-[#e8f6ee] text-[#1f6b45]',
]

type CouponCardProps = {
  benefit: CardBenefit
  index?: number
  /** today | tomorrow | soon | later | none */
  urgency?: string
}

export function CouponCard({ benefit, index = 0, urgency = 'later' }: CouponCardProps) {
  const label = getBenefitLabel(benefit)
  const subtitle = getBenefitSubtitle(benefit)
  const discount = formatDiscount(benefit)
  const tone = AVATAR_TONES[index % AVATAR_TONES.length]

  const border =
    urgency === 'today'
      ? 'border-[#e4b4b0]'
      : urgency === 'tomorrow'
        ? 'border-[#e2d2b0]'
        : urgency === 'soon'
          ? 'border-[#c9c3e4]'
          : 'border-gray-200'

  return (
    <Link
      to={`/benefits/${benefit.id}`}
      className={`flex items-center gap-3 rounded-[18px] border bg-white p-3.5 transition active:scale-[0.99] ${border}`}
    >
      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] text-sm font-bold ${tone}`}
      >
        {getBrandInitials(label)}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[15px] font-semibold text-gray-900">{label}</p>
        <p className="mt-0.5 truncate text-sm text-gray-500">{subtitle}</p>
      </div>
      <p className="shrink-0 text-[15px] font-bold text-gray-900">{discount}</p>
    </Link>
  )
}
