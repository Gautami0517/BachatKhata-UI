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
  status?: BenefitStatus
  categories?: string[]
  merchants?: string[]
  brands?: string[]
}

function appendListParams(
  search: URLSearchParams,
  key: string,
  values: string[] | undefined,
) {
  if (!values?.length) return
  for (const value of values) {
    const trimmed = value.trim()
    if (trimmed) search.append(key, trimmed)
  }
}

export async function fetchBenefits(
  params: ListBenefitsParams = {},
): Promise<Benefit[]> {
  const search = new URLSearchParams()
  search.set('sort', params.sort ?? 'expiring_soon')
  search.set('status', params.status ?? 'unused')
  appendListParams(search, 'category', params.categories)
  appendListParams(search, 'merchant', params.merchants)
  appendListParams(search, 'brand', params.brands)

  const { data } = await api.get<Benefit[]>(`/benefits?${search.toString()}`)
  return data
}

/** GET /benefits/categories → { categories: string[] } */
export async function fetchBenefitCategories(q?: string): Promise<string[]> {
  const { data } = await api.get<{ categories: string[] }>('/benefits/categories', {
    params: q?.trim() ? { q: q.trim() } : undefined,
  })
  return data.categories ?? []
}

/** GET /benefits/merchants → { merchants: string[] } */
export async function fetchBenefitMerchants(q?: string): Promise<string[]> {
  const { data } = await api.get<{ merchants: string[] }>('/benefits/merchants', {
    params: q?.trim() ? { q: q.trim() } : undefined,
  })
  return data.merchants ?? []
}

/** GET /benefits/brands → { brands: string[] } */
export async function fetchBenefitBrands(q?: string): Promise<string[]> {
  const { data } = await api.get<{ brands: string[] }>('/benefits/brands', {
    params: q?.trim() ? { q: q.trim() } : undefined,
  })
  return data.brands ?? []
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
