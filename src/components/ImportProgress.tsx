/**
 * Animated import experience — communicates AI understanding while the API runs.
 * Step 1 completes immediately; step 2 stays active during the request;
 * steps 3–4 complete after success (with a minimum 2.5s overall duration).
 */
import { AnimatePresence, motion } from 'framer-motion'

export type ImportStepStatus = 'pending' | 'active' | 'done'

export type ImportStep = {
  id: string
  label: string
  icon: string
  status: ImportStepStatus
}

type ImportProgressProps = {
  steps: ImportStep[]
  rawText: string
}

export function ImportProgress({ steps, rawText }: ImportProgressProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.35 }}
      className="flex min-h-[70vh] flex-col items-center justify-center px-5 py-8"
    >
      <div className="w-full max-w-md rounded-[28px] border border-gray-100 bg-white p-6 shadow-sm">
        <div className="mx-auto mb-5 flex h-24 w-24 items-center justify-center rounded-3xl bg-violet-50">
          <motion.div
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
            className="text-5xl"
            aria-hidden
          >
            🤖
          </motion.div>
        </div>

        <h1 className="text-center text-2xl font-bold tracking-tight text-gray-900">
          Importing Your Benefit
        </h1>
        <p className="mt-2 text-center text-sm leading-relaxed text-gray-500">
          BenefitAI is understanding your offer and securely saving it to your Financial Memory.
        </p>

        <ol className="mt-8 space-y-0">
          {steps.map((step, index) => (
            <li key={step.id} className="relative flex gap-3 pb-6 last:pb-0">
              {index < steps.length - 1 && (
                <span
                  className={`absolute left-[15px] top-8 h-[calc(100%-1.5rem)] w-px ${
                    step.status === 'done' ? 'bg-violet-300' : 'bg-gray-200'
                  }`}
                  aria-hidden
                />
              )}

              <StepIcon status={step.status} icon={step.icon} />

              <div className="pt-0.5">
                <p
                  className={`text-sm font-semibold ${
                    step.status === 'pending' ? 'text-gray-400' : 'text-gray-900'
                  }`}
                >
                  {step.label}
                </p>
                <AnimatePresence>
                  {step.status === 'active' && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="mt-0.5 text-xs text-violet-600"
                    >
                      In progress…
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            </li>
          ))}
        </ol>

        {rawText && (
          <div className="mt-2 rounded-2xl bg-violet-50 px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-violet-500">
              Shared offer
            </p>
            <p className="mt-1 line-clamp-4 text-sm leading-relaxed text-violet-900/80">
              “{rawText}”
            </p>
          </div>
        )}
      </div>
    </motion.div>
  )
}

function StepIcon({ status, icon }: { status: ImportStepStatus; icon: string }) {
  if (status === 'done') {
    return (
      <motion.span
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-600 text-sm text-white"
      >
        ✓
      </motion.span>
    )
  }

  if (status === 'active') {
    return (
      <span className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-100 text-base shadow-[0_0_0_4px_rgba(124,58,237,0.12)]">
        <motion.span
          animate={{ rotate: 360 }}
          transition={{ duration: 1.4, repeat: Infinity, ease: 'linear' }}
          className="inline-block"
        >
          {icon}
        </motion.span>
      </span>
    )
  }

  return (
    <span className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-gray-200 bg-white text-sm opacity-50">
      {icon}
    </span>
  )
}
