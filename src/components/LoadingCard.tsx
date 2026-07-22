/**
 * Skeleton placeholders shown while GET /benefits is in flight.
 */
export function LoadingCard() {
  return (
    <div className="animate-pulse rounded-3xl border border-gray-100 bg-white p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="h-12 w-12 rounded-2xl bg-violet-50" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-1/3 rounded bg-gray-100" />
          <div className="h-3 w-2/3 rounded bg-gray-100" />
          <div className="mt-3 flex gap-2">
            <div className="h-3 w-20 rounded bg-gray-100" />
            <div className="h-3 w-16 rounded bg-gray-100" />
          </div>
        </div>
        <div className="space-y-2">
          <div className="ml-auto h-4 w-14 rounded bg-gray-100" />
          <div className="ml-auto h-4 w-20 rounded-full bg-gray-100" />
        </div>
      </div>
    </div>
  )
}

export function LoadingCardList({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }, (_, index) => (
        <LoadingCard key={index} />
      ))}
    </div>
  )
}
