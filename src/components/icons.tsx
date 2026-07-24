/** C-Vault icons — match brand lightning + filter assets. */

type IconProps = {
  className?: string
  strokeWidth?: number
}

/** Solid black bolt for the lavender chip */
export function LightningIcon({ className = 'h-5 w-5' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="currentColor">
      <path d="M13.05 2.4 5.6 13.35h6.05l-1.25 8.25 8.7-12.2h-5.85L13.05 2.4z" />
    </svg>
  )
}

/** Outline bolt for the C-Vault wordmark */
export function LightningOutlineIcon({ className = 'h-5 w-5', strokeWidth = 1.75 }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className={className}
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinejoin="miter"
      strokeLinecap="square"
    >
      <path d="M13.1 2.8 5.9 13.5h5.85L10.45 21.2 18.4 10.2h-5.7L13.1 2.8z" />
    </svg>
  )
}

/** Sliders filter — three lines with knobs */
export function FilterSlidersIcon({ className = 'h-5 w-5', strokeWidth = 1.7 }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className={className}
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    >
      <path d="M4 7h16" />
      <path d="M4 12h16" />
      <path d="M4 17h16" />
      <circle cx="8" cy="7" r="2.2" fill="currentColor" stroke="none" />
      <circle cx="15" cy="12" r="2.2" fill="currentColor" stroke="none" />
      <circle cx="10" cy="17" r="2.2" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function PlusCircleIcon({ className = 'h-11 w-11', strokeWidth = 1.5 }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden className={className} stroke="currentColor">
      <circle cx="24" cy="24" r="18" strokeWidth={strokeWidth} />
      <path d="M24 16v16M16 24h16" strokeWidth={strokeWidth} strokeLinecap="round" />
    </svg>
  )
}

export function SearchIcon({ className = 'h-5 w-5', strokeWidth = 1.7 }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className={className}
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    >
      <circle cx="11" cy="11" r="6.5" />
      <path d="M16.5 16.5 20 20" />
    </svg>
  )
}

/** Scissors / cut — coupon card actions */
export function ScissorsIcon({ className = 'h-4 w-4', strokeWidth = 1.7 }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className={className}
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="6" cy="6" r="2.5" />
      <circle cx="6" cy="18" r="2.5" />
      <path d="M8.2 7.8 20 18" />
      <path d="M8.2 16.2 14 12 8.2 7.8" />
      <path d="M14 12 20 6" />
    </svg>
  )
}

/** Three sparkles — Relevance / benefitScore */
export function SparklesIcon({ className = 'h-3.5 w-3.5' }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" aria-hidden className={className} fill="currentColor">
      <path d="M8 1.2 8.95 5.05 12.8 6 8.95 6.95 8 10.8 7.05 6.95 3.2 6 7.05 5.05 8 1.2z" />
      <path d="M12.6 8.4 13.15 10.35 15.1 10.9 13.15 11.45 12.6 13.4 12.05 11.45 10.1 10.9 12.05 10.35 12.6 8.4z" />
      <path d="M3.5 9.2 3.9 10.65 5.35 11.05 3.9 11.45 3.5 12.9 3.1 11.45 1.65 11.05 3.1 10.65 3.5 9.2z" />
    </svg>
  )
}

/** Filled star — Ask “Best match” badge */
export function StarIcon({ className = 'h-3.5 w-3.5' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="currentColor">
      <path d="M12 3.4 14.6 9l6 .5-4.5 3.9 1.4 5.8L12 16.4 6.5 19.2l1.4-5.8L3.4 9.5l6-.5L12 3.4z" />
    </svg>
  )
}

export function TrashIcon({ className = 'h-5 w-5', strokeWidth = 1.8 }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className={className}
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 7h16" />
      <path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
      <path d="M7 7v12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V7" />
      <path d="M10 11v6M14 11v6" />
    </svg>
  )
}

export function CheckCircleIcon({ className = 'h-5 w-5', strokeWidth = 1.8 }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className={className}
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="8.5" />
      <path d="m8.5 12.2 2.4 2.4 4.6-5" />
    </svg>
  )
}

export function CloseIcon({ className = 'h-5 w-5', strokeWidth = 1.8 }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className={className}
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    >
      <path d="M7 7 17 17M17 7 7 17" />
    </svg>
  )
}
