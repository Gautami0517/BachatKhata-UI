/**
 * Benefit (coupon) types mirrored from the Nest CouponResponseDto.
 * Keep display helpers tolerant of nulls — never render "null" in the UI.
 */

export type DiscountType =
  | 'PERCENTAGE'
  | 'FLAT'
  | 'CASHBACK'
  | 'FREEBIE'
  | 'OTHER'

export type Benefit = {
  id: string
  merchant: string | null
  brand: string | null
  /** Backend-provided: brand → merchant → title */
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
  createdAt: string
  updatedAt: string
}

/**
 * Sort values accepted by GET /benefits?sort=
 * (Backend SortOption enum — not the shorthand from the product brief.)
 */
export type BenefitSort =
  | 'expiring_soon'
  | 'newest'
  | 'highest_discount_pct'
  | 'highest_savings'
  | 'brand_az'

export type ImportBenefitRequest = {
  rawText: string
  source?: string
}
