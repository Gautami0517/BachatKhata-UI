/**
 * Share Target entry — Android Share Sheet → C-Vault.
 * - Text (e.g. GPay): POST /benefits/import
 * - Image (Gallery / screenshot): extract-image → review → save
 */
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { BENEFITS_QUERY_KEY, extractImage, importBenefit, saveExtracted } from '../api/benefits'
import {
  ExtractionPreviewCard,
  ImportProgress,
  type ImportStepItem,
} from '../components/ImportProgress'
import { SuccessCard } from '../components/SuccessCard'
import { getErrorMessage, useToast } from '../components/ToastProvider'
import {
  clearSharePayloadCache,
  readSharedImageFile,
  useSharePayload,
} from '../hooks/useSharePayload'
import type { Benefit, CouponPreview } from '../types/benefit'
import { isImageMime } from '../types/share'
import { composeSharedRawText, formatDiscount } from '../utils/benefitDisplay'
import { logError, logInfo } from '../utils/logger'

type Phase =
  | 'loading_share'
  | 'importing'
  | 'extracting'
  | 'review'
  | 'saving'
  | 'success'
  | 'error'
  | 'empty'

let activeTextImport: { rawText: string; promise: Promise<Benefit> } | null = null

export function ShareImport() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { pushToast } = useToast()
  const { payload, hasContent, loading: shareLoading } = useSharePayload()

  const [phase, setPhase] = useState<Phase>('loading_share')
  const [steps, setSteps] = useState<ImportStepItem[]>(stepper(1))
  const [imported, setImported] = useState<Benefit | null>(null)
  const [preview, setPreview] = useState<CouponPreview | null>(null)
  const [runId, setRunId] = useState(0)

  const rawText = useMemo(
    () =>
      composeSharedRawText({
        title: payload.title,
        text: payload.text,
        url: payload.url,
      }),
    [payload.title, payload.text, payload.url],
  )

  const hasImageShare = payload.files.some((f) => isImageMime(f.type)) || payload.filesCount > 0

  useEffect(() => {
    if (shareLoading) return

    let cancelled = false

    const run = async () => {
      // Prefer image when Android shared a file (Gallery / screenshot).
      if (hasImageShare) {
        setPhase('extracting')
        setSteps(stepper(1))
        try {
          const file = await readSharedImageFile(payload.files, 0)
          if (!file) {
            // File meta present but blob missing — fall through to text if any.
            if (!rawText) {
              setPhase('empty')
              return
            }
          } else {
            if (file.size > 5 * 1024 * 1024) {
              pushToast('Image must be under 5MB')
              setPhase('error')
              return
            }
            logInfo('Share image extract starting', { name: file.name, type: file.type, size: file.size })
            const result = await extractImage(file, 'android_image_share')
            if (cancelled) return
            setPreview(result)
            setSteps(stepper(2))
            setPhase('review')
            return
          }
        } catch (error) {
          logError('Share image extract failed', error)
          if (!cancelled) {
            setPhase('error')
            pushToast(getErrorMessage(error, 'Could not extract offer from shared image'))
          }
          return
        }
      }

      if (!hasContent || !rawText) {
        setPhase('empty')
        return
      }

      setPhase('importing')
      setSteps(stepper(1))
      logInfo('Share text import starting', { length: rawText.length })

      try {
        const started = Date.now()
        let promise: Promise<Benefit>
        if (activeTextImport?.rawText === rawText) {
          promise = activeTextImport.promise
        } else {
          promise = importBenefit({ rawText, source: 'google_pay_share' })
          activeTextImport = { rawText, promise }
        }

        await sleep(600)
        if (!cancelled) setSteps(stepper(2))

        const benefit = await promise
        await queryClient.invalidateQueries({ queryKey: BENEFITS_QUERY_KEY })

        const wait = Math.max(0, 2000 - (Date.now() - started))
        await sleep(wait)
        if (cancelled) return

        setSteps(stepper(3))
        await sleep(300)
        if (cancelled) return

        setImported(benefit)
        setPhase('success')
        await clearSharePayloadCache()
        activeTextImport = null
      } catch (error) {
        if (activeTextImport?.rawText === rawText) activeTextImport = null
        logError('Share import failed', error)
        if (!cancelled) {
          setPhase('error')
          pushToast(getErrorMessage(error, 'Unable to import this benefit.'))
        }
      }
    }

    void run()
    return () => {
      cancelled = true
    }
  }, [
    shareLoading,
    hasContent,
    hasImageShare,
    rawText,
    payload.files,
    queryClient,
    runId,
    pushToast,
  ])

  const confirmSave = async () => {
    if (!preview) return
    setPhase('saving')
    setSteps([
      { title: 'Reading offer', subtitle: 'Offer received', status: 'done' },
      { title: 'Processing offer', subtitle: 'Extracting details', status: 'done' },
      { title: 'Saving to vault', subtitle: 'Adding your offer to vault', status: 'active' },
    ])

    try {
      const benefit = await saveExtracted({
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
        source: preview.source ?? 'android_image_share',
        rawText: preview.rawText,
      })
      await queryClient.invalidateQueries({ queryKey: BENEFITS_QUERY_KEY })
      await clearSharePayloadCache()
      setImported(benefit)
      setSteps(stepper(3))
      setPhase('success')
    } catch (error) {
      pushToast(getErrorMessage(error, 'Could not save offer'))
      setPhase('review')
      setSteps(stepper(2))
    }
  }

  if (phase === 'success' && imported) {
    return <SuccessCard benefit={imported} onViewDashboard={() => navigate('/', { replace: true })} />
  }

  if (phase === 'review' && preview) {
    return (
      <main className="mx-auto flex min-h-full flex-col bg-[#fcf8fe] px-5 pb-8 pt-4">
        <div className="mb-6 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#3b3a8c] text-2xl text-white">
            ⚡
          </div>
          <h1 className="mt-4 text-2xl font-bold text-gray-900">Review extracted offer</h1>
          <p className="mt-1 text-sm text-gray-500">Shared image — confirm before saving</p>
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
            className="w-full rounded-full bg-[#3b3a8c] py-3.5 text-sm font-semibold text-white"
          >
            Save to vault
          </button>
          <button type="button" onClick={() => navigate('/')} className="w-full rounded-full py-3 text-sm font-semibold text-[#3b3a8c]">
            Cancel
          </button>
        </div>
      </main>
    )
  }

  if (phase === 'importing' || phase === 'extracting' || phase === 'saving' || phase === 'loading_share') {
    return (
      <ImportProgress
        steps={steps}
        preview={
          preview && phase === 'saving' ? (
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

  if (phase === 'error') {
    return (
      <main className="mx-auto flex min-h-full flex-col items-center justify-center px-5 text-center">
        <h1 className="text-xl font-bold text-gray-900">Unable to import this benefit.</h1>
        <p className="mt-2 text-sm text-gray-500">
          Something went wrong while understanding or saving your offer.
        </p>
        <button
          type="button"
          onClick={() => {
            activeTextImport = null
            setPreview(null)
            setRunId((v) => v + 1)
          }}
          className="mt-6 w-full rounded-full bg-[#3b3a8c] py-3.5 text-sm font-semibold text-white"
        >
          Retry
        </button>
        <button type="button" onClick={() => navigate('/')} className="mt-3 text-sm font-semibold text-[#3b3a8c]">
          Back to Dashboard
        </button>
      </main>
    )
  }

  return (
    <main className="mx-auto flex min-h-full flex-col items-center justify-center px-5 text-center">
      <h1 className="text-xl font-bold text-gray-900">No shared content received.</h1>
      <p className="mt-2 text-sm text-gray-500">
        Share a coupon screenshot or text into C-Vault, or use Import on the dashboard.
      </p>
      <button
        type="button"
        onClick={() => navigate('/')}
        className="mt-6 rounded-full bg-[#3b3a8c] px-6 py-3 text-sm font-semibold text-white"
      >
        View Dashboard
      </button>
    </main>
  )
}

function stepper(activeIndex: number): ImportStepItem[] {
  const items = [
    { title: 'Reading offer', subtitle: 'Offer received' },
    { title: 'Processing offer', subtitle: 'Extracting details' },
    { title: 'Saving to vault', subtitle: 'Adding your offer to vault' },
  ]
  return items.map((item, index) => ({
    ...item,
    status: index < activeIndex ? 'done' : index === activeIndex ? 'active' : 'pending',
  }))
}

function sleep(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms))
}
