import { useQuery } from '@tanstack/react-query'
import { BENEFITS_QUERY_KEY, fetchBenefits, type ListBenefitsParams } from '../api/benefits'

export function useBenefits(params: ListBenefitsParams = {}) {
  const sort = params.sort ?? 'expiring_soon'
  const status = params.status ?? 'unused'
  const categories = params.categories ?? []
  const merchants = params.merchants ?? []
  const brands = params.brands ?? []

  return useQuery({
    queryKey: [...BENEFITS_QUERY_KEY, sort, status, categories, merchants, brands],
    queryFn: () =>
      fetchBenefits({ sort, status, categories, merchants, brands }),
    staleTime: 30_000,
  })
}
