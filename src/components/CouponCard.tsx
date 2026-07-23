/**
 * Dashboard coupon card — always-visible ✕ opens Take Action sheet.
 */
import { useEffect, useId, useState, type MouseEvent } from 'react'
import { Link } from 'react-router-dom'
import {
  useDeleteBenefit,
  useMarkBenefitUnused,
  useMarkBenefitUsed,
} from '../hooks/useBenefitMutations'
import type { AskResult, Benefit } from '../types/benefit'
import {
  formatDiscount,
  getBenefitLabel,
  getBenefitSubtitle,
  getBrandInitials,
} from '../utils/benefitDisplay'
import { BenefitScorePill } from './BenefitScorePill'
import { CheckCircleIcon, CloseIcon, TrashIcon } from './icons'
import { getErrorMessage, useToast } from './ToastProvider'

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
  /** Dashboard only — ✕ opens Take Action sheet */
  showActions?: boolean
}

function isFullBenefit(benefit: CardBenefit): benefit is Benefit {
  return 'isUsed' in benefit || 'rawText' in benefit
}

export function CouponCard({
  benefit,
  index = 0,
  urgency = 'later',
  showActions = false,
}: CouponCardProps) {
  const label = getBenefitLabel(benefit)
  const subtitle = getBenefitSubtitle(benefit)
  const discount = formatDiscount(benefit)
  const tone = AVATAR_TONES[index % AVATAR_TONES.length]
  const { pushToast } = useToast()

  const [sheetOpen, setSheetOpen] = useState(false)
  const titleId = useId()

  const deleteMutation = useDeleteBenefit()
  const markUsedMutation = useMarkBenefitUsed()
  const markUnusedMutation = useMarkBenefitUnused()
  const busy =
    deleteMutation.isPending || markUsedMutation.isPending || markUnusedMutation.isPending

  const isUsed = isFullBenefit(benefit) ? Boolean(benefit.isUsed) : false
  const benefitScore =
    'benefitScore' in benefit ? (benefit.benefitScore ?? null) : null

  const border =
    urgency === 'today'
      ? 'border-[#e4b4b0]'
      : urgency === 'tomorrow'
        ? 'border-[#e2d2b0]'
        : urgency === 'soon'
          ? 'border-[#c9c3e4]'
          : 'border-gray-200'

  useEffect(() => {
    if (!sheetOpen) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSheetOpen(false)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [sheetOpen])

  const onDelete = async (event: MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
    if (busy) return
    const ok = window.confirm('Delete this benefit?')
    if (!ok) return
    try {
      await deleteMutation.mutateAsync(benefit.id)
      setSheetOpen(false)
      pushToast('Benefit deleted', 'success')
    } catch (error) {
      pushToast(getErrorMessage(error, 'Could not delete benefit'))
    }
  }

  const onToggleUsed = async (event: MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
    if (busy) return
    try {
      if (isUsed) {
        await markUnusedMutation.mutateAsync(benefit.id)
        setSheetOpen(false)
        pushToast('Marked as unused', 'success')
      } else {
        await markUsedMutation.mutateAsync(benefit.id)
        setSheetOpen(false)
        pushToast('Marked as used', 'success')
      }
    } catch (error) {
      pushToast(getErrorMessage(error, 'Could not update benefit'))
    }
  }

  return (
    <>
      <div className={`relative rounded-[18px] border bg-white ${border}`}>
        <Link
          to={`/benefits/${benefit.id}`}
          className="flex items-center gap-3 p-3.5 pr-11 transition active:scale-[0.99]"
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
          <div className="flex shrink-0 flex-col items-end gap-1">
            <p className="text-[15px] font-bold text-gray-900">{discount}</p>
            <BenefitScorePill score={benefitScore} hideIfEmpty />
          </div>
        </Link>

        {showActions && (
          <button
            type="button"
            aria-label="Coupon actions"
            aria-haspopup="dialog"
            aria-expanded={sheetOpen}
            disabled={busy}
            onClick={(event) => {
              event.preventDefault()
              event.stopPropagation()
              setSheetOpen(true)
            }}
            className="absolute -right-1.5 -top-1.5 z-20 flex h-7 w-7 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-500 shadow-sm disabled:opacity-50"
          >
            <CloseIcon className="h-3.5 w-3.5" strokeWidth={2} />
          </button>
        )}
      </div>

      {showActions && sheetOpen && (
        <div
          className="fixed inset-0 z-[95] flex items-center justify-center bg-black/35 px-6"
          onClick={() => {
            if (!busy) setSheetOpen(false)
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="w-full max-w-[20rem] rounded-[28px] bg-white px-5 py-6 shadow-2xl"
            onClick={(event) => {
              event.preventDefault()
              event.stopPropagation()
            }}
          >
            <h2 id={titleId} className="text-center text-xl font-bold text-gray-900">
              Take Action
            </h2>
            <p className="mt-1.5 text-center text-sm text-gray-500">
              What would you like to do with this coupon?
            </p>

            <div className="mt-5 space-y-3">
              <button
                type="button"
                disabled={busy}
                onClick={(e) => void onDelete(e)}
                className="flex w-full items-center justify-center gap-2.5 rounded-2xl bg-[#fde8e8] px-4 py-3.5 text-[15px] font-semibold text-[#b42318] disabled:opacity-50"
              >
                <TrashIcon className="h-5 w-5" />
                Delete
              </button>

              <button
                type="button"
                disabled={busy}
                onClick={(e) => void onToggleUsed(e)}
                className="flex w-full items-center justify-center gap-2.5 rounded-2xl bg-[#e6f6ed] px-4 py-3.5 text-[15px] font-semibold text-[#1f6b45] disabled:opacity-50"
              >
                <CheckCircleIcon className="h-5 w-5" />
                {isUsed ? 'Unused' : 'Used'}
              </button>

              <button
                type="button"
                disabled={busy}
                onClick={(event) => {
                  event.preventDefault()
                  event.stopPropagation()
                  setSheetOpen(false)
                }}
                className="flex w-full items-center justify-center gap-2.5 rounded-2xl bg-[#eef0f6] px-4 py-3.5 text-[15px] font-semibold text-[#3a3f55] disabled:opacity-50"
              >
                <CloseIcon className="h-5 w-5" />
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
