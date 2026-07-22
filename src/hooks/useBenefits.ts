/**
 * Dashboard data hook — GET /benefits with React Query caching.
 * Import success invalidates BENEFITS_QUERY_KEY so the list refreshes automatically.
 */
import { useQuery } from '@tanstack/react-query'
import { BENEFITS_QUERY_KEY, fetchBenefits } from '../api/benefits'
import type { BenefitSort } from '../types/benefit'

export function useBenefits(sort: BenefitSort = 'expiring_soon') {
  return useQuery({
    queryKey: [...BENEFITS_QUERY_KEY, sort],
    queryFn: () => fetchBenefits(sort),
    staleTime: 30_000,
  })
}
