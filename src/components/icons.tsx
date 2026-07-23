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
