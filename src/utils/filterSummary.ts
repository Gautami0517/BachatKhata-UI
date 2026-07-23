/**
 * Format selected filter values for the Filters sheet summary.
 * "All" | "Fashion" | "Fashion +2"
 */
export function formatFilterSummary(selected: string[]): string {
  if (selected.length === 0) return 'All'
  if (selected.length === 1) return selected[0]!
  return `${selected[0]} +${selected.length - 1}`
}

export type DashboardFilters = {
  categories: string[]
  merchants: string[]
  brands: string[]
}

export const EMPTY_FILTERS: DashboardFilters = {
  categories: [],
  merchants: [],
  brands: [],
}

export function hasActiveFilters(filters: DashboardFilters): boolean {
  return (
    filters.categories.length > 0 ||
    filters.merchants.length > 0 ||
    filters.brands.length > 0
  )
}

/** Stable initials for merchant/brand avatars (UI-only). */
export function filterItemInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length >= 2) {
    return `${parts[0]![0]!}${parts[1]![0]!}`.toUpperCase()
  }
  return name.trim().slice(0, 2).toUpperCase() || '?'
}

const AVATAR_TONES = [
  'bg-[#fff0e6] text-[#c45c1a]',
  'bg-[#fde8f0] text-[#b42358]',
  'bg-[#e8f1fb] text-[#2f5f9a]',
  'bg-[#ebe4f8] text-[#4c3d8f]',
  'bg-[#e8f6ee] text-[#1f6b45]',
  'bg-[#f5ead7] text-[#8a5a20]',
]

export function filterAvatarTone(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i += 1) {
    hash = (hash + name.charCodeAt(i) * (i + 1)) % AVATAR_TONES.length
  }
  return AVATAR_TONES[hash] ?? AVATAR_TONES[0]!
}
