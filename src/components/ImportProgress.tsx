/**
 * 3-step import stepper matching C-Vault "Importing your offer" screen.
 */
import type { ReactNode } from 'react'

export type StepState = 'done' | 'active' | 'pending'

export type ImportStepItem = {
  title: string
  subtitle: string
  status: StepState
}

type ImportProgressProps = {
  steps: ImportStepItem[]
  preview?: ReactNode
  title?: string
  subtitle?: string
  onBack?: () => void
}

export function ImportProgress({
  steps,
  preview,
  title = 'Importing your offer',
  subtitle = 'Please wait while we process',
  onBack,
}: ImportProgressProps) {
  return (
    <div className="mx-auto flex min-h-[100dvh] max-w-lg flex-col bg-[#f7f7f8] px-5 pb-8 pt-4">
      {onBack && (
        <button type="button" onClick={onBack} className="mb-2 w-fit text-xl text-gray-800" aria-label="Back">
          ←
        </button>
      )}

      <div className="mt-4 flex flex-col items-center">
        <div className="relative flex h-20 w-20 items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-violet-100" />
          <div className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full bg-violet-600 text-2xl text-white">
            ⚡
          </div>
          <div className="absolute inset-x-[-24px] top-1/2 z-0 border-t-2 border-dashed border-sky-400" />
        </div>
        <h1 className="mt-5 text-center text-2xl font-bold text-gray-900">{title}</h1>
        <p className="mt-1 text-center text-sm text-gray-500">{subtitle}</p>
      </div>

      <ol className="mt-10 space-y-0 px-2">
        {steps.map((step, index) => (
          <li key={step.title} className="relative flex gap-3 pb-8 last:pb-0">
            {index < steps.length - 1 && (
              <span
                className={`absolute left-[15px] top-8 h-[calc(100%-1.75rem)] w-0.5 ${
                  step.status === 'done' ? 'bg-violet-500' : 'bg-gray-200'
                }`}
              />
            )}
            <StepDot status={step.status} />
            <div>
              <p
                className={`text-sm font-semibold ${
                  step.status === 'pending' ? 'text-gray-400' : 'text-gray-900'
                }`}
              >
                {step.title}
              </p>
              <p className={`text-xs ${step.status === 'pending' ? 'text-gray-300' : 'text-gray-500'}`}>
                {step.subtitle}
              </p>
            </div>
          </li>
        ))}
      </ol>

      {preview && <div className="mt-auto pt-4">{preview}</div>}
    </div>
  )
}

function StepDot({ status }: { status: StepState }) {
  if (status === 'done') {
    return (
      <span className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-600 text-sm text-white">
        ✓
      </span>
    )
  }
  if (status === 'active') {
    return (
      <span className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-violet-600 bg-white">
        <span className="h-2.5 w-2.5 rounded-full bg-violet-600" />
      </span>
    )
  }
  return <span className="relative z-10 h-8 w-8 shrink-0 rounded-full border-2 border-gray-200 bg-white" />
}

/** Preview card under the stepper after extract-image */
export function ExtractionPreviewCard({
  title,
  discountLabel,
  couponCode,
}: {
  title: string
  discountLabel: string
  couponCode: string | null
}) {
  return (
    <div className="rounded-2xl border border-violet-100 bg-violet-50 p-4">
      <div className="flex gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-600 text-white">
          🏷
        </div>
        <p className="text-sm leading-relaxed text-gray-800">
          <span className="font-bold text-gray-900">{discountLabel}</span>
          {title ? ` on ${title}` : ''}
        </p>
      </div>
      {couponCode && (
        <>
          <div className="my-3 border-t border-violet-100" />
          <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
            Voucher Code
          </p>
          <div className="mt-1.5 inline-block rounded-lg bg-white px-3 py-1.5 text-sm font-bold text-violet-700">
            {couponCode}
          </div>
        </>
      )}
    </div>
  )
}
