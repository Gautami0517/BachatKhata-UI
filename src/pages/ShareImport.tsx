/**
 * Share Target entry — captures Android shared text and POSTs /benefits/import.
 */
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { BENEFITS_QUERY_KEY, importBenefit } from '../api/benefits'
import { ImportProgress, type ImportStepItem } from '../components/ImportProgress'
import { SuccessCard } from '../components/SuccessCard'
import { getErrorMessage, useToast } from '../components/ToastProvider'
import { clearSharePayloadCache, useSharePayload } from '../hooks/useSharePayload'
import type { Benefit } from '../types/benefit'
import { composeSharedRawText } from '../utils/benefitDisplay'
import { logError, logInfo } from '../utils/logger'

type Phase = 'loading_share' | 'importing' | 'success' | 'error' | 'empty'

let activeImport: { rawText: string; promise: Promise<Benefit> } | null = null

export function ShareImport() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { pushToast } = useToast()
  const { payload, hasContent, loading: shareLoading } = useSharePayload()

  const [phase, setPhase] = useState<Phase>('loading_share')
  const [steps, setSteps] = useState<ImportStepItem[]>(stepper(1))
  const [imported, setImported] = useState<Benefit | null>(null)
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

  useEffect(() => {
    if (shareLoading) return
    if (!hasContent || !rawText) {
      setPhase('empty')
      return
    }

    let cancelled = false

    const run = async () => {
      setPhase('importing')
      setSteps(stepper(1))
      logInfo('Share import starting', { length: rawText.length })

      try {
        const started = Date.now()
        let promise: Promise<Benefit>
        if (activeImport?.rawText === rawText) {
          promise = activeImport.promise
        } else {
          promise = importBenefit({ rawText, source: 'google_pay_share' })
          activeImport = { rawText, promise }
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
        activeImport = null
      } catch (error) {
        if (activeImport?.rawText === rawText) activeImport = null
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
  }, [shareLoading, hasContent, rawText, queryClient, runId, pushToast])

  if (phase === 'success' && imported) {
    return <SuccessCard benefit={imported} onViewDashboard={() => navigate('/', { replace: true })} />
  }

  if (phase === 'importing' || phase === 'loading_share') {
    return <ImportProgress steps={steps} />
  }

  if (phase === 'error') {
    return (
      <main className="mx-auto flex min-h-[100dvh] max-w-lg flex-col items-center justify-center px-5 text-center">
        <h1 className="text-xl font-bold text-gray-900">Unable to import this benefit.</h1>
        <p className="mt-2 text-sm text-gray-500">
          Something went wrong while understanding or saving your offer.
        </p>
        <button
          type="button"
          onClick={() => {
            activeImport = null
            setRunId((v) => v + 1)
          }}
          className="mt-6 w-full rounded-full bg-violet-600 py-3.5 text-sm font-semibold text-white"
        >
          Retry
        </button>
        <button type="button" onClick={() => navigate('/')} className="mt-3 text-sm font-semibold text-violet-600">
          Back to Dashboard
        </button>
      </main>
    )
  }

  return (
    <main className="mx-auto flex min-h-[100dvh] max-w-lg flex-col items-center justify-center px-5 text-center">
      <h1 className="text-xl font-bold text-gray-900">No shared content received.</h1>
      <p className="mt-2 text-sm text-gray-500">
        Share a coupon into C-Vault, or use Import on the dashboard.
      </p>
      <button
        type="button"
        onClick={() => navigate('/')}
        className="mt-6 rounded-full bg-violet-600 px-6 py-3 text-sm font-semibold text-white"
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
