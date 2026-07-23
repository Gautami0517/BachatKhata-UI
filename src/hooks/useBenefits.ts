import { useQuery } from '@tanstack/react-query'
import { BENEFITS_QUERY_KEY, fetchBenefits, type ListBenefitsParams } from '../api/benefits'

export function useBenefits(params: ListBenefitsParams = {}) {
  const sort = params.sort ?? 'expiring_soon'
  const category = params.category ?? null
  const status = params.status ?? 'unused'

  return useQuery({
    queryKey: [...BENEFITS_QUERY_KEY, sort, category, status],
    queryFn: () => fetchBenefits({ sort, category, status }),
    staleTime: 30_000,
  })
}
