/**
 * Import from text — POST /benefits/import (one-shot) with 3-step loading UX.
 */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ImportProgress, type ImportStepItem } from '../components/ImportProgress'
import { SuccessCard } from '../components/SuccessCard'
import { getErrorMessage, useToast } from '../components/ToastProvider'
import { useImportBenefit } from '../hooks/useBenefitMutations'
import type { Benefit } from '../types/benefit'

type Phase = 'form' | 'importing' | 'success'

const SAMPLE = `Flat 38% OFF on Smart Gas Leak Detector worth ₹3999
Voucher code: RIPPLESAFEG1
Valid on purchases above ₹3000
Maximum Discount ₹1200
Expires in 25 days`

export function ImportText() {
  const navigate = useNavigate()
  const { pushToast } = useToast()
  const importMutation = useImportBenefit()

  const [text, setText] = useState('')
  const [phase, setPhase] = useState<Phase>('form')
  const [saved, setSaved] = useState<Benefit | null>(null)
  const [steps, setSteps] = useState<ImportStepItem[]>(stepper(1))

  const runImport = async () => {
    const rawText = text.trim()
    if (!rawText) {
      pushToast('Paste coupon text first')
      return
    }

    setPhase('importing')
    setSteps(stepper(1))

    try {
      const started = Date.now()
      const benefitPromise = importMutation.mutateAsync({
        rawText,
        source: 'user_paste',
      })

      // Keep stepper readable even if API is fast.
      await sleep(700)
      setSteps(stepper(2))

      const benefit = await benefitPromise
      const remaining = Math.max(0, 1800 - (Date.now() - started))
      await sleep(remaining)
      setSteps(stepper(3))
      await sleep(350)

      setSaved(benefit)
      setPhase('success')
    } catch (error) {
      pushToast(getErrorMessage(error, 'Could not import offer'))
      setPhase('form')
    }
  }

  if (phase === 'success' && saved) {
    return <SuccessCard benefit={saved} onViewDashboard={() => navigate('/', { replace: true })} />
  }

  if (phase === 'importing') {
    return <ImportProgress steps={steps} onBack={() => navigate(-1)} />
  }

  return (
    <main className="mx-auto flex min-h-full flex-col bg-[#fcf8fe] px-5 py-6">
      <button type="button" onClick={() => navigate(-1)} className="mb-4 w-fit text-xl" aria-label="Back">
        ←
      </button>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Import from text</h1>
          <p className="mt-1 text-sm text-gray-500">Paste offer text — C-Vault will extract and save it.</p>
        </div>
        <button
          type="button"
          onClick={() => setText(SAMPLE)}
          className="shrink-0 rounded-full bg-violet-50 px-3 py-1.5 text-[11px] font-semibold text-violet-700"
        >
          Use sample
        </button>
      </div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={10}
        placeholder="Paste coupon / offer text…"
        className="mt-5 w-full flex-1 resize-y rounded-3xl border border-gray-200 bg-white px-4 py-3 text-sm leading-relaxed outline-none focus:border-violet-300 focus:ring-2 focus:ring-violet-100"
      />

      <button
        type="button"
        onClick={() => void runImport()}
        className="mt-4 w-full rounded-full bg-violet-600 py-3.5 text-sm font-semibold text-white"
      >
        Import offer
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
