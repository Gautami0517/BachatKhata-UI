/**
 * Import mutation hook — POST /benefits/import + cache invalidation.
 * ShareImport also calls the API directly when deduping StrictMode remounts;
 * other screens can use this hook for a simple imperative import.
 */
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { BENEFITS_QUERY_KEY, importBenefit } from '../api/benefits'
import type { ImportBenefitRequest } from '../types/benefit'
import { logInfo } from '../utils/logger'

export function useImportBenefit() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: ImportBenefitRequest) => importBenefit(payload),
    onSuccess: async (benefit) => {
      logInfo('Import succeeded — invalidating benefits cache', benefit.id)
      await queryClient.invalidateQueries({ queryKey: BENEFITS_QUERY_KEY })
    },
  })
}
