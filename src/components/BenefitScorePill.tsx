/**
 * benefitScore pill — matches dashboard mock (sparkle + value under discount).
 */
import { formatBenefitScore } from '../utils/benefitDisplay'
import { SparklesIcon } from './icons'

type BenefitScorePillProps = {
  score: number | null | undefined
  className?: string
  /** When true, hide entirely if score is missing (dashboard cards). */
  hideIfEmpty?: boolean
}

export function BenefitScorePill({
  score,
  className = '',
  hideIfEmpty = false,
}: BenefitScorePillProps) {
  const label = formatBenefitScore(score)
  if (!label && hideIfEmpty) return null

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border border-gray-200 bg-[#f3f4f6] px-2 py-0.5 text-[11px] font-semibold tabular-nums text-gray-800 ${className}`}
      title={label ? `Benefit score ${label}` : 'Benefit score unavailable'}
    >
      <SparklesIcon className="h-3 w-3 text-gray-700" />
      {label ?? '—'}
    </span>
  )
}
