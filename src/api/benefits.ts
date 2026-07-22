import { api } from './axios'
import type { Benefit, BenefitSort, ImportBenefitRequest } from '../types/benefit'

/** React Query key root — invalidate this after a successful import. */
export const BENEFITS_QUERY_KEY = ['benefits'] as const

/**
 * GET /benefits?sort=…
 * Default sort matches the Dashboard "Expiring" chip.
 */
export async function fetchBenefits(
  sort: BenefitSort = 'expiring_soon',
): Promise<Benefit[]> {
  const { data } = await api.get<Benefit[]>('/benefits', {
    params: { sort },
  })
  return data
}

/**
 * POST /benefits/import
 * Sends raw shared coupon text; backend extracts fields via Gemini.
 */
export async function importBenefit(
  payload: ImportBenefitRequest,
): Promise<Benefit> {
  const { data } = await api.post<Benefit>('/benefits/import', payload)
  return data
}
