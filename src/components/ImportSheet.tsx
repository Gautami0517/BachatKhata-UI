/**
 * Compact import menu (~35% screen width), anchored bottom-right near the FAB.
 */
type ImportSheetProps = {
  open: boolean
  onClose: () => void
  onImage: () => void
  onText: () => void
}

export function ImportSheet({ open, onClose, onImage, onText }: ImportSheetProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        className="absolute inset-0 cursor-default bg-black/25"
        aria-label="Close"
        onClick={onClose}
      />

      <div className="pointer-events-none absolute inset-x-0 bottom-0 mx-auto flex max-w-lg justify-end px-4 pb-[calc(5.75rem+env(safe-area-inset-bottom))]">
        <div className="pointer-events-auto w-[38%] min-w-[9.5rem] max-w-[11.5rem] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl">
          <button
            type="button"
            onClick={onImage}
            className="block w-full px-3.5 py-3 text-left text-[13px] font-semibold text-gray-900 hover:bg-[#f3eefc]"
          >
            From image
          </button>
          <div className="h-px bg-gray-100" />
          <button
            type="button"
            onClick={onText}
            className="block w-full px-3.5 py-3 text-left text-[13px] font-semibold text-gray-900 hover:bg-[#f3eefc]"
          >
            From text
          </button>
          <div className="h-px bg-gray-100" />
          <button
            type="button"
            onClick={onClose}
            className="block w-full px-3.5 py-2.5 text-left text-[12px] font-medium text-gray-500 hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
