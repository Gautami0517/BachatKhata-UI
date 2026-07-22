/**
 * Demo helper: paste raw coupon text and run the same import journey as Share Target.
 * Useful when testing from a phone browser without Android Share Sheet.
 */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const SAMPLE = `Flat 38% OFF on Smart Gas Leak Detector worth ₹3999
Voucher code: RIPPLESAFEG1
Valid on purchases above ₹3000
Maximum Discount ₹1200
Expires in 25 days`

export function PasteImportPanel() {
  const navigate = useNavigate()
  const [text, setText] = useState('')
  const [error, setError] = useState('')

  const submit = () => {
    const rawText = text.trim()
    if (!rawText) {
      setError('Paste coupon text first.')
      return
    }

    setError('')
    const params = new URLSearchParams({
      text: rawText,
      shared: '1',
    })
    navigate(`/share?${params.toString()}`)
  }

  return (
    <section className="mt-5 rounded-[28px] border border-violet-100 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-gray-900">Test coupon import</h2>
          <p className="mt-0.5 text-xs leading-relaxed text-gray-500">
            Paste offer text here to verify Gemini parsing — same flow as Google Pay Share.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setText(SAMPLE)
            setError('')
          }}
          className="shrink-0 rounded-full bg-violet-50 px-3 py-1.5 text-[11px] font-semibold text-violet-700"
        >
          Use sample
        </button>
      </div>

      <textarea
        value={text}
        onChange={(event) => {
          setText(event.target.value)
          if (error) setError('')
        }}
        rows={5}
        placeholder="Paste coupon / offer text from Google Pay, email, or SMS…"
        className="mt-3 w-full resize-y rounded-2xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm leading-relaxed text-gray-800 outline-none placeholder:text-gray-400 focus:border-violet-300 focus:bg-white focus:ring-2 focus:ring-violet-100"
      />

      {error && <p className="mt-2 text-xs font-medium text-red-600">{error}</p>}

      <button
        type="button"
        onClick={submit}
        className="mt-3 w-full rounded-full bg-violet-600 px-4 py-3 text-sm font-semibold text-white shadow-sm shadow-violet-200 transition hover:bg-violet-700"
      >
        Import &amp; parse
      </button>
    </section>
  )
}
