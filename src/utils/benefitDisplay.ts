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

const KNOWN_MERCHANT_SITES: Record<string, string> = {
  myntra: 'https://www.myntra.com',
  zomato: 'https://www.zomato.com',
  swiggy: 'https://www.swiggy.com',
  amazon: 'https://www.amazon.in',
  flipkart: 'https://www.flipkart.com',
  ajio: 'https://www.ajio.com',
  nykaa: 'https://www.nykaa.com',
  meesho: 'https://www.meesho.com',
  bigbasket: 'https://www.bigbasket.com',
  blinkit: 'https://blinkit.com',
  'google pay': 'https://pay.google.com',
  gpay: 'https://pay.google.com',
}

/**
 * Resolve a usable merchant/offer URL for "copy code + open site".
 * Prefers an explicit URL in raw text, then domain-like fields, then known merchants.
 */
export function resolveOfferUrl(benefit: {
  rawText?: string | null
  merchant?: string | null
  brand?: string | null
  source?: string | null
  title?: string | null
}): string | null {
  const blobs = [benefit.rawText, benefit.source, benefit.merchant, benefit.brand, benefit.title]
    .filter(Boolean)
    .join('\n')

  const httpsMatch = blobs.match(/https?:\/\/[^\s<>"']+/i)
  if (httpsMatch) {
    return sanitizeUrl(httpsMatch[0])
  }

  const wwwMatch = blobs.match(/\bwww\.[a-z0-9][-a-z0-9.]*\.[a-z]{2,}(?:\/[^\s<>"']*)?/i)
  if (wwwMatch) {
    return sanitizeUrl(`https://${wwwMatch[0]}`)
  }

  const domainMatch = blobs.match(
    /\b(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+(?:com|in|co\.in|net|org|io|app)(?:\/[^\s<>"']*)?/i,
  )
  if (domainMatch) {
    const candidate = domainMatch[0]
    // Ignore email-like leftovers
    if (!candidate.includes('@')) {
      return sanitizeUrl(`https://${candidate}`)
    }
  }

  for (const value of [benefit.merchant, benefit.brand, benefit.source, benefit.title]) {
    const key = value?.trim().toLowerCase()
    if (!key) continue
    for (const [name, url] of Object.entries(KNOWN_MERCHANT_SITES)) {
      if (key === name || key.includes(name)) return url
    }
  }

  return null
}

function sanitizeUrl(raw: string): string | null {
  const cleaned = raw.replace(/[),.;!?]+$/g, '')
  try {
    const url = new URL(cleaned)
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null
    return url.toString()
  } catch {
    return null
  }
}

/** Display API benefitScore as mock-style one decimal (e.g. 9 → "9.0"). */
export function formatBenefitScore(score: number | null | undefined): string | null {
  if (score == null || !Number.isFinite(score)) return null
  return (Math.round(score * 10) / 10).toFixed(1)
}

/**
 * Success-screen color bands on the API 0–10 scale:
 * ≥8 green · 3–<8 yellow · <3 red
 */
export function benefitScoreBand(
  score: number,
): 'high' | 'mid' | 'low' {
  if (score >= 8) return 'high'
  if (score >= 3) return 'mid'
  return 'low'
}

export function benefitScoreTextClass(score: number): string {
  const band = benefitScoreBand(score)
  if (band === 'high') return 'text-emerald-600'
  if (band === 'mid') return 'text-amber-500'
  return 'text-red-600'
}
