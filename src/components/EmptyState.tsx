/**
 * Empty vault state — shown when GET /benefits returns an empty list.
 */
import { LightningIcon } from './icons'

type EmptyStateProps = {
  title?: string
  description?: string
}

export function EmptyState({
  title = 'No offers yet',
  description = 'Share a coupon from Google Pay into C-Vault and it will appear here in your vault.',
}: EmptyStateProps) {
  return (
    <div className="rounded-3xl border border-dashed border-[#d9d4ef] bg-[#f3f1fa] px-6 py-12 text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-gray-900 bg-[#e9e5f6]">
        <LightningIcon className="h-6 w-6 text-gray-900" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-gray-500">{description}</p>
    </div>
  )
}
