/**
 * Share Import page — entry point for Android Web Share Target.
 * Captures shared text and immediately POSTs /benefits/import (no extra taps).
 *
 * Module-level dedupe prevents React StrictMode from importing the same
 * shared payload twice during development remounts.
 */
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { AnimatePresence } from 'framer-motion'
import { BENEFITS_QUERY_KEY, importBenefit } from '../api/benefits'
import { ImportProgress, type ImportStep } from '../components/ImportProgress'
import { SuccessCard } from '../components/SuccessCard'
import { clearSharePayloadCache, useSharePayload } from '../hooks/useSharePayload'
import type { Benefit } from '../types/benefit'
import { composeSharedRawText } from '../utils/benefitDisplay'
import { logError, logInfo } from '../utils/logger'

type Phase = 'loading_share' | 'importing' | 'success' | 'error' | 'empty'

const MIN_IMPORT_MS = 2500
const SUCCESS_REDIRECT_MS = 1000
const STEP_STAGGER_MS = 450

const BASE_STEPS: Array<Omit<ImportStep, 'status'>> = [
  { id: 'receive', label: 'Receiving shared offer', icon: '✓' },
  { id: 'understand', label: 'Understanding your benefit', icon: '🧠' },
  { id: 'organize', label: 'Organizing your financial memory', icon: '📂' },
  { id: 'save', label: 'Saving to your Benefit Vault', icon: '💾' },
]

/** Dedupes concurrent imports of the same raw text (StrictMode / remounts). */
let activeImport: { rawText: string; promise: Promise<Benefit> } | null = null

function buildSteps(activeIndex: number, completedThrough: number): ImportStep[] {
  return BASE_STEPS.map((step, index) => {
    if (index <= completedThrough) return { ...step, status: 'done' as const }
    if (index === activeIndex) return { ...step, status: 'active' as const }
    return { ...step, status: 'pending' as const }
  })
}

export function ShareImport() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { payload, hasContent, loading: shareLoading } = useSharePayload()

  const [phase, setPhase] = useState<Phase>('loading_share')
  const [steps, setSteps] = useState<ImportStep[]>(() => buildSteps(1, 0))
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

    const runImport = async () => {
      const startedAt = Date.now()
      setPhase('importing')
      setSteps(buildSteps(1, 0))
      logInfo('Starting benefit import', { length: rawText.length, runId })

      try {
        let benefitPromise: Promise<Benefit>
        if (activeImport?.rawText === rawText) {
          benefitPromise = activeImport.promise
        } else {
          benefitPromise = importBenefit({
            rawText,
            source: 'google_pay_share',
          })
          activeImport = { rawText, promise: benefitPromise }
        }

        const benefit = await benefitPromise
        await queryClient.invalidateQueries({ queryKey: BENEFITS_QUERY_KEY })

        const elapsed = Date.now() - startedAt
        const wait = Math.max(0, MIN_IMPORT_MS - elapsed)
        if (wait > 0) await sleep(wait)

        if (cancelled) return

        setSteps(buildSteps(2, 1))
        await sleep(STEP_STAGGER_MS)
        if (cancelled) return

        setSteps(buildSteps(3, 2))
        await sleep(STEP_STAGGER_MS)
        if (cancelled) return

        setSteps(buildSteps(-1, 3))
        setImported(benefit)
        setPhase('success')
        await clearSharePayloadCache()
        activeImport = null
        logInfo('Import UX complete — showing success')
      } catch (error) {
        if (activeImport?.rawText === rawText) activeImport = null
        logError('Import failed', error)
        if (!cancelled) setPhase('error')
      }
    }

    void runImport()

    return () => {
      cancelled = true
    }
  }, [shareLoading, hasContent, rawText, queryClient, runId])

  useEffect(() => {
    if (phase !== 'success') return

    const timer = window.setTimeout(() => {
      navigate('/', { replace: true })
    }, SUCCESS_REDIRECT_MS)

    return () => window.clearTimeout(timer)
  }, [phase, navigate])

  const goDashboard = () => navigate('/', { replace: true })

  const retry = () => {
    activeImport = null
    setRunId((value) => value + 1)
  }

  return (
    <main className="mx-auto min-h-screen max-w-lg bg-[#fafafa]">
      <AnimatePresence mode="wait">
        {(phase === 'loading_share' || phase === 'importing') && (
          <ImportProgress key="import" steps={steps} rawText={rawText} />
        )}

        {phase === 'success' && imported && (
          <SuccessCard key="success" benefit={imported} onViewDashboard={goDashboard} />
        )}

        {phase === 'error' && (
          <ErrorPanel key="error" onRetry={retry} onDashboard={goDashboard} />
        )}

        {phase === 'empty' && <EmptySharePanel key="empty" onDashboard={goDashboard} />}
      </AnimatePresence>
    </main>
  )
}

function ErrorPanel({
  onRetry,
  onDashboard,
}: {
  onRetry: () => void
  onDashboard: () => void
}) {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-5 py-8 text-center">
      <div className="w-full max-w-md rounded-[28px] border border-red-100 bg-white p-6 shadow-sm">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-2xl">
          ⚠️
        </div>
        <h1 className="mt-4 text-xl font-bold text-gray-900">Unable to import this benefit.</h1>
        <p className="mt-2 text-sm leading-relaxed text-gray-500">
          Something went wrong while understanding or saving your offer.
        </p>
        <button
          type="button"
          onClick={onRetry}
          className="mt-6 w-full rounded-full bg-violet-600 px-5 py-3.5 text-sm font-semibold text-white"
        >
          Retry
        </button>
        <button
          type="button"
          onClick={onDashboard}
          className="mt-3 w-full rounded-full px-5 py-3 text-sm font-semibold text-violet-600"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  )
}

function EmptySharePanel({ onDashboard }: { onDashboard: () => void }) {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-5 py-8 text-center">
      <div className="w-full max-w-md rounded-[28px] border border-gray-100 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-bold text-gray-900">No shared content received.</h1>
        <p className="mt-2 text-sm text-gray-500">
          Open Google Pay, share a coupon, and choose BenefitAI from the Android Share Sheet.
        </p>
        <p className="mt-4 rounded-2xl bg-violet-50 px-3 py-2 text-left text-xs text-violet-700">
          Dev tip: open{' '}
          <code className="font-mono">/share?text=Flat%2038%25%20OFF%20code%20TEST123</code> to
          simulate a share.
        </p>
        <button
          type="button"
          onClick={onDashboard}
          className="mt-6 w-full rounded-full bg-violet-600 px-5 py-3.5 text-sm font-semibold text-white"
        >
          View Dashboard
        </button>
      </div>
    </div>
  )
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms)
  })
}
