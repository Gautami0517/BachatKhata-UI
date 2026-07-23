import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  askBenefits,
  BENEFITS_QUERY_KEY,
  deleteBenefit,
  extractImage,
  importBenefit,
  markBenefitUnused,
  markBenefitUsed,
  saveExtracted,
} from '../api/benefits'
import type { ImportBenefitRequest, SaveExtractedPayload } from '../types/benefit'
import { logInfo } from '../utils/logger'

export function useAskBenefits() {
  return useMutation({
    mutationFn: (query: string) => askBenefits(query),
  })
}

export function useImportBenefit() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: ImportBenefitRequest) => importBenefit(payload),
    onSuccess: async (benefit) => {
      logInfo('Import succeeded', benefit.id)
      await queryClient.invalidateQueries({ queryKey: BENEFITS_QUERY_KEY })
    },
  })
}

export function useExtractImage() {
  return useMutation({
    mutationFn: ({ file, source }: { file: File; source?: string }) =>
      extractImage(file, source),
  })
}

export function useSaveExtracted() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: SaveExtractedPayload) => saveExtracted(payload),
    onSuccess: async (benefit) => {
      logInfo('Save extracted succeeded', benefit.id)
      await queryClient.invalidateQueries({ queryKey: BENEFITS_QUERY_KEY })
    },
  })
}

export function useDeleteBenefit() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteBenefit(id),
    onSuccess: async (_void, id) => {
      logInfo('Benefit deleted', id)
      await queryClient.invalidateQueries({ queryKey: BENEFITS_QUERY_KEY })
    },
  })
}

export function useMarkBenefitUsed() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => markBenefitUsed(id),
    onSuccess: async (benefit) => {
      logInfo('Benefit marked used', benefit.id)
      await queryClient.invalidateQueries({ queryKey: BENEFITS_QUERY_KEY })
    },
  })
}

export function useMarkBenefitUnused() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => markBenefitUnused(id),
    onSuccess: async (benefit) => {
      logInfo('Benefit marked unused', benefit.id)
      await queryClient.invalidateQueries({ queryKey: BENEFITS_QUERY_KEY })
    },
  })
}
