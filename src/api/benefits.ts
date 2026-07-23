import { api } from './axios'
import type {
  AskResponse,
  Benefit,
  BenefitSort,
  BenefitStatus,
  CouponPreview,
  ImportBenefitRequest,
  SaveExtractedPayload,
} from '../types/benefit'

export const BENEFITS_QUERY_KEY = ['benefits'] as const

export type ListBenefitsParams = {
  sort?: BenefitSort
  category?: string | null
  status?: BenefitStatus
}

export async function fetchBenefits(
  params: ListBenefitsParams = {},
): Promise<Benefit[]> {
  const { data } = await api.get<Benefit[]>('/benefits', {
    params: {
      sort: params.sort ?? 'expiring_soon',
      status: params.status ?? 'unused',
      ...(params.category ? { category: params.category } : {}),
    },
  })
  return data
}

export async function fetchBenefitById(id: string): Promise<Benefit> {
  const { data } = await api.get<Benefit>(`/benefits/${id}`)
  return data
}

export async function askBenefits(query: string): Promise<AskResponse> {
  const { data } = await api.post<AskResponse>('/benefits/ask', { query })
  return data
}

export async function importBenefit(
  payload: ImportBenefitRequest,
): Promise<Benefit> {
  const { data } = await api.post<Benefit>('/benefits/import', payload)
  return data
}

export async function extractImage(
  file: File,
  source?: string,
): Promise<CouponPreview> {
  const form = new FormData()
  form.append('file', file)
  if (source) form.append('source', source)

  // Let the browser set multipart boundary — do not force Content-Type.
  const { data } = await api.post<CouponPreview>('/benefits/extract-image', form, {
    headers: { 'Content-Type': undefined },
  })
  return data
}

export async function saveExtracted(
  payload: SaveExtractedPayload,
): Promise<Benefit> {
  const { data } = await api.post<Benefit>('/benefits/save', payload)
  return data
}

/** DELETE /benefits/:id — 204 No Content */
export async function deleteBenefit(id: string): Promise<void> {
  await api.delete(`/benefits/${id}`)
}

/** POST /benefits/:id/mark-used */
export async function markBenefitUsed(id: string): Promise<Benefit> {
  const { data } = await api.post<Benefit>(`/benefits/${id}/mark-used`)
  return data
}

/** POST /benefits/:id/mark-unused */
export async function markBenefitUnused(id: string): Promise<Benefit> {
  const { data } = await api.post<Benefit>(`/benefits/${id}/mark-unused`)
  return data
}
