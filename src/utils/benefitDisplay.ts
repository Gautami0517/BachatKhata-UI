import type { Benefit } from '../types/benefit'

/** Brand → Merchant → Title fallback for card headings. Never returns empty. */
export function getBenefitLabel(benefit: {
  displayName?: string | null
  merchant?: string | null
  brand?: string | null
  title?: string | null
}): string {
  const label =
    benefit.displayName?.trim() ||
    benefit.merchant?.trim() ||
    benefit.brand?.trim() ||
    benefit.title?.trim()

  return label || 'Benefit'
}

/** Secondary line under the brand — prefers title, then merchant. */
export function getBenefitSubtitle(benefit: {
  displayName?: string | null
  merchant?: string | null
  brand?: string | null
  title?: string | null
  category?: string | null
}): string {
  const title = benefit.title?.trim()
  const merchant = benefit.merchant?.trim()
  const brand = benefit.brand?.trim()
  const label = getBenefitLabel(benefit)

  if (title && title !== label) return title
  if (merchant && merchant !== label) return merchant
  if (brand && brand !== label) return brand
  return benefit.category?.trim() || 'Saved offer'
}

export function formatDiscount(benefit: {
  discountType?: string | null
  discountValue?: number | null
}): string {
  const value = benefit.discountValue
  const type = benefit.discountType

  if (value == null) {
    if (type === 'FREEBIE') return 'Freebie'
    if (type === 'OTHER') return 'Special offer'
    return 'Offer'
  }

  switch (type) {
    case 'PERCENTAGE':
      return `${formatNumber(value)}% OFF`
    case 'FLAT':
      return `₹${formatNumber(value)} OFF`
    case 'CASHBACK':
      return value <= 100 && value === Math.floor(value)
        ? `${formatNumber(value)}% cashback`
        : `₹${formatNumber(value)} cashback`
    case 'FREEBIE':
      return 'Freebie'
    default:
      return `${formatNumber(value)} off`
  }
}

export function formatCurrency(amount: number | null | undefined): string {
  if (amount == null || Number.isNaN(amount)) return '—'
  return `₹${formatNumber(amount)}`
}

export function formatNumber(value: number): string {
  return Number.isInteger(value)
    ? value.toLocaleString('en-IN')
    : value.toLocaleString('en-IN', { maximumFractionDigits: 2 })
}

export function formatExpiryLabel(expiryDate: string | null): string {
  if (!expiryDate) return 'No expiry'
  const expiry = startOfDay(new Date(expiryDate))
  const today = startOfDay(new Date())
  const diffDays = Math.round((expiry.getTime() - today.getTime()) / 86_400_000)

  if (diffDays < 0) return 'Expired'
  if (diffDays === 0) return 'Expires Today'
  if (diffDays === 1) return 'Expires Tomorrow'
  return `${diffDays} days left`
}

export function isExpiringSoon(expiryDate: string | null): boolean {
  if (!expiryDate) return false
  const expiry = startOfDay(new Date(expiryDate))
  const today = startOfDay(new Date())
  const diffDays = Math.round((expiry.getTime() - today.getTime()) / 86_400_000)
  return diffDays >= 0 && diffDays <= 1
}

export type BenefitGroup = {
  key: string
  label: string
  items: Benefit[]
}

/** Group benefits for the Dashboard timeline sections. */
export function groupBenefitsByExpiry(benefits: Benefit[]): BenefitGroup[] {
  const buckets: Record<string, Benefit[]> = {
    today: [],
    tomorrow: [],
    soon: [],
    later: [],
    none: [],
  }

  for (const benefit of benefits) {
    if (!benefit.expiryDate) {
      buckets.none.push(benefit)
      continue
    }

    const expiry = startOfDay(new Date(benefit.expiryDate))
    const today = startOfDay(new Date())
    const diffDays = Math.round((expiry.getTime() - today.getTime()) / 86_400_000)

    if (diffDays <= 0) buckets.today.push(benefit)
    else if (diffDays === 1) buckets.tomorrow.push(benefit)
    else if (diffDays <= 7) buckets.soon.push(benefit)
    else buckets.later.push(benefit)
  }

  const groups: BenefitGroup[] = []
  if (buckets.today.length) groups.push({ key: 'today', label: 'Today', items: buckets.today })
  if (buckets.tomorrow.length) {
    groups.push({ key: 'tomorrow', label: 'Tomorrow', items: buckets.tomorrow })
  }
  if (buckets.soon.length) {
    const minDays = Math.min(
      ...buckets.soon.map((b) => {
        const expiry = startOfDay(new Date(b.expiryDate!))
        const today = startOfDay(new Date())
        return Math.round((expiry.getTime() - today.getTime()) / 86_400_000)
      }),
    )
    groups.push({
      key: 'soon',
      label: minDays === 3 ? 'In 3 days' : `In ${minDays}–7 days`,
      items: buckets.soon,
    })
  }
  if (buckets.later.length) groups.push({ key: 'later', label: 'Later', items: buckets.later })
  if (buckets.none.length) {
    groups.push({ key: 'none', label: 'No expiry date', items: buckets.none })
  }

  return groups
}

export function sumPotentialSavings(benefits: Benefit[]): number {
  return benefits.reduce((total, benefit) => total + (benefit.maximumDiscount ?? 0), 0)
}

/** Build the rawText body we POST to /benefits/import from Share Target fields. */
export function composeSharedRawText(parts: {
  title?: string
  text?: string
  url?: string
}): string {
  return [parts.title, parts.text, parts.url]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join('\n')
    .trim()
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

/** Initials for the brand avatar tile. */
export function getBrandInitials(label: string): string {
  const cleaned = label.trim()
  if (!cleaned) return 'B'
  const words = cleaned.split(/\s+/).filter(Boolean)
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase()
  return `${words[0][0] ?? ''}${words[1][0] ?? ''}`.toUpperCase()
}
