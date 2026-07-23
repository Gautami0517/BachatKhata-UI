import { useQuery } from '@tanstack/react-query'
import { fetchBenefitById } from '../api/benefits'

export function useBenefit(id: string | undefined) {
  return useQuery({
    queryKey: ['benefit', id],
    queryFn: () => fetchBenefitById(id!),
    enabled: Boolean(id),
  })
}
