/**
 * Types mirrored from Nest CouponResponseDto / Ask / Preview DTOs.
 */

export type DiscountType =
  | 'PERCENTAGE'
  | 'FLAT'
  | 'CASHBACK'
  | 'FREEBIE'
  | 'OTHER'

export type BenefitSort =
  | 'expiring_soon'
  | 'newest'
  | 'highest_discount_pct'
  | 'highest_savings'
  | 'highest_score'
  | 'category'

export type BenefitStatus = 'unused' | 'used' | 'all'

export type Benefit = {
  id: string
  merchant: string | null
  brand: string | null
  displayName: string
  title: string
  category: string | null
  discountType: DiscountType
  discountValue: number | null
  minimumSpend: number | null
  maximumDiscount: number | null
  couponCode: string | null
  expiryDate: string | null
  source: string | null
  rawText: string
  isUsed: boolean
  usedAt: string | null
  /** C-Vault usefulness score from API (0–10). Null if not scored. */
  benefitScore: number | null
  createdAt: string
  updatedAt: string
}

/** POST /benefits/extract-image — nothing saved yet */
export type CouponPreview = {
  merchant: string | null
  brand: string | null
  title: string | null
  category: string | null
  discountType: string | null
  discountValue: number | null
  minimumSpend: number | null
  maximumDiscount: number | null
  couponCode: string | null
  expiryDate: string | null
  source: string | null
  rawText: string
  benefitScore?: number | null
}

export type SaveExtractedPayload = {
  merchant?: string | null
  brand?: string | null
  title?: string | null
  category?: string | null
  discountType?: string | null
  discountValue?: number | null
  minimumSpend?: number | null
  maximumDiscount?: number | null
  couponCode?: string | null
  expiryDate?: string | null
  source?: string | null
  rawText: string
}

export type ImportBenefitRequest = {
  rawText: string
  source?: string
}

export type AskIntent = {
  merchant: string | null
  brand: string | null
  category: string | null
  product: string | null
  expectedSpend: number | null
  sortPreference: 'BEST_MATCH' | 'HIGHEST_DISCOUNT' | 'EXPIRING_SOON' | null
}

export type AskResult = {
  id: string
  merchant: string | null
  brand: string | null
  displayName: string
  title: string
  category: string | null
  discountType: DiscountType
  discountValue: number | null
  minimumSpend: number | null
  maximumDiscount: number | null
  couponCode: string | null
  expiryDate: string | null
  score: number
  benefitScore?: number | null
}

export type AskMatchType = 'product' | 'category_fallback' | 'general' | null

export type AskResponse = {
  query: string
  intent: AskIntent
  totalResults: number
  results: AskResult[]
  matchType?: AskMatchType
  message?: string
}

/** Fixed category dropdown — no /categories endpoint yet */
export const FIXED_CATEGORIES = [
  'Fashion',
  'Electronics',
  'Travel',
  'Food',
  'Groceries',
  'Home',
  'Health',
  'Home Appliances',
] as const

export type FixedCategory = (typeof FIXED_CATEGORIES)[number]
