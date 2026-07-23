import { useQuery } from '@tanstack/react-query'
import { BENEFITS_QUERY_KEY, fetchBenefits, type ListBenefitsParams } from '../api/benefits'

export function useBenefits(params: ListBenefitsParams = {}) {
  const sort = params.sort ?? 'expiring_soon'
  const category = params.category ?? null

  return useQuery({
    queryKey: [...BENEFITS_QUERY_KEY, sort, category],
    queryFn: () => fetchBenefits({ sort, category }),
    staleTime: 30_000,
  })
}
