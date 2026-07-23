/**
 * Import from image:
 * 1) POST /benefits/extract-image (preview, not saved)
 * 2) User confirms → POST /benefits/save → success
 */
import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ExtractionPreviewCard,
  ImportProgress,
  type ImportStepItem,
} from '../components/ImportProgress'
import { SuccessCard } from '../components/SuccessCard'
import { getErrorMessage, useToast } from '../components/ToastProvider'
import { useExtractImage, useSaveExtracted } from '../hooks/useBenefitMutations'
import type { Benefit, CouponPreview } from '../types/benefit'
import { formatDiscount } from '../utils/benefitDisplay'

type Phase = 'pick' | 'extracting' | 'review' | 'saving' | 'success'

export function ImportImage() {
  const navigate = useNavigate()
  const { pushToast } = useToast()
  const fileRef = useRef<HTMLInputElement>(null)
  const extractMutation = useExtractImage()
  const saveMutation = useSaveExtracted()

  const [phase, setPhase] = useState<Phase>('pick')
  const [preview, setPreview] = useState<CouponPreview | null>(null)
  const [saved, setSaved] = useState<Benefit | null>(null)
  const [steps, setSteps] = useState<ImportStepItem[]>(baseSteps(1))

  const onFile = async (file: File | undefined) => {
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      pushToast('Image must be under 5MB')
      return
    }

    setPhase('extracting')
    setSteps(baseSteps(1))

    try {
      const result = await extractMutation.mutateAsync({ file, source: 'gpay' })
      setPreview(result)
      setSteps(baseSteps(2))
      setPhase('review')
    } catch (error) {
      pushToast(getErrorMessage(error, 'Could not extract offer from image'))
      setPhase('pick')
      setSteps(baseSteps(0))
    }
  }

  const confirmSave = async () => {
    if (!preview) return
    setPhase('saving')
    setSteps([
      { title: 'Reading offer', subtitle: 'Offer received', status: 'done' },
      { title: 'Processing offer', subtitle: 'Extracting details', status: 'done' },
      { title: 'Saving to vault', subtitle: 'Adding your offer to vault', status: 'active' },
    ])

    try {
      const benefit = await saveMutation.mutateAsync({
        merchant: preview.merchant,
        brand: preview.brand,
        title: preview.title,
        category: preview.category,
        discountType: preview.discountType,
        discountValue: preview.discountValue,
        minimumSpend: preview.minimumSpend,
        maximumDiscount: preview.maximumDiscount,
        couponCode: preview.couponCode,
        expiryDate: preview.expiryDate,
        source: preview.source ?? 'gpay',
        rawText: preview.rawText,
      })
      setSaved(benefit)
      setSteps(baseSteps(3))
      setPhase('success')
    } catch (error) {
      pushToast(getErrorMessage(error, 'Could not save offer'))
      setPhase('review')
      setSteps(baseSteps(2))
    }
  }

  if (phase === 'success' && saved) {
    return <SuccessCard benefit={saved} onViewDashboard={() => navigate('/', { replace: true })} />
  }

  if (phase === 'extracting' || phase === 'saving') {
    return (
      <ImportProgress
        steps={steps}
        onBack={() => navigate(-1)}
        preview={
          preview ? (
            <ExtractionPreviewCard
              title={preview.title || ''}
              discountLabel={formatDiscount(preview)}
              couponCode={preview.couponCode}
            />
          ) : undefined
        }
      />
    )
  }

  if (phase === 'review' && preview) {
    return (
      <main className="mx-auto flex min-h-full flex-col bg-[#fcf8fe] px-5 pb-8 pt-4">
        <button type="button" onClick={() => navigate(-1)} className="mb-4 w-fit text-xl" aria-label="Back">
          ←
        </button>
        <div className="mb-6 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-violet-600 text-2xl text-white">
            ⚡
          </div>
          <h1 className="mt-4 text-2xl font-bold text-gray-900">Review extracted offer</h1>
          <p className="mt-1 text-sm text-gray-500">Confirm details before saving to your vault</p>
        </div>

        <ExtractionPreviewCard
          title={preview.title || ''}
          discountLabel={formatDiscount(preview)}
          couponCode={preview.couponCode}
        />

        <div className="mt-auto space-y-2 pt-8">
          <button
            type="button"
            onClick={() => void confirmSave()}
            className="w-full rounded-full bg-violet-600 py-3.5 text-sm font-semibold text-white"
          >
            Save to vault
          </button>
          <button
            type="button"
            onClick={() => {
              setPreview(null)
              setPhase('pick')
              fileRef.current?.click()
            }}
            className="w-full rounded-full py-3 text-sm font-semibold text-violet-600"
          >
            Choose another image
          </button>
        </div>

        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          className="hidden"
          onChange={(e) => void onFile(e.target.files?.[0])}
        />
      </main>
    )
  }

  return (
    <main className="mx-auto flex min-h-full flex-col bg-[#fcf8fe] px-5 py-6">
      <button type="button" onClick={() => navigate(-1)} className="mb-4 w-fit text-xl" aria-label="Back">
        ←
      </button>
      <h1 className="text-2xl font-bold text-gray-900">Import from image</h1>
      <p className="mt-2 text-sm text-gray-500">
        Upload a coupon screenshot (JPEG, PNG, GIF, or WebP — max 5MB).
      </p>

      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        className="hidden"
        onChange={(e) => void onFile(e.target.files?.[0])}
      />

      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        className="mt-8 flex flex-1 flex-col items-center justify-center rounded-3xl border-2 border-dashed border-violet-200 bg-white px-6 py-16"
      >
        <span className="text-4xl">🖼️</span>
        <span className="mt-3 text-sm font-semibold text-violet-700">Choose image</span>
      </button>
    </main>
  )
}

function baseSteps(completedThrough: number): ImportStepItem[] {
  const items = [
    { title: 'Reading offer', subtitle: 'Offer received' },
    { title: 'Processing offer', subtitle: 'Extracting details' },
    { title: 'Saving to vault', subtitle: 'Adding your offer to vault' },
  ]
  return items.map((item, index) => ({
    ...item,
    status:
      index < completedThrough ? 'done' : index === completedThrough ? 'active' : 'pending',
  }))
}
