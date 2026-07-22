/**
 * Empty vault state — shown when GET /benefits returns an empty list.
 */
type EmptyStateProps = {
  title?: string
  description?: string
}

export function EmptyState({
  title = 'No benefits yet',
  description = 'Share a coupon from Google Pay into BenefitAI and it will appear here in your Financial Memory.',
}: EmptyStateProps) {
  return (
    <div className="rounded-3xl border border-dashed border-violet-200 bg-violet-50/40 px-6 py-12 text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-100 text-2xl">
        💼
      </div>
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-gray-500">{description}</p>
    </div>
  )
}
