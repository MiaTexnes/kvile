import clsx from "clsx"
import { useEffect, useId, useRef, type ReactNode } from "react"

type Props = {
  open: boolean
  onOpenChange: (nextOpen: boolean) => void
  title: string
  description: ReactNode
  cancelLabel?: string
  confirmLabel: string
  confirmVariant?: "danger" | "primary"
  onConfirm: () => void
  isConfirming?: boolean
  errorMessage?: string | null
}

/**
 * Accessible confirmation modal using the native `<dialog>` element (`showModal` focus trap).
 */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  cancelLabel = "Cancel",
  confirmLabel,
  confirmVariant = "primary",
  onConfirm,
  isConfirming = false,
  errorMessage,
}: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  const descId = useId()

  useEffect(() => {
    const d = dialogRef.current
    if (!d) return
    const onCloseEvent = () => onOpenChange(false)
    d.addEventListener("close", onCloseEvent)
    return () => d.removeEventListener("close", onCloseEvent)
  }, [onOpenChange])

  useEffect(() => {
    const d = dialogRef.current
    if (!d) return
    if (open && !d.open) {
      d.showModal()
    } else if (!open && d.open) {
      d.close()
    }
  }, [open])

  return (
    <dialog
      ref={dialogRef}
      className={clsx(
        "fixed left-1/2 top-1/2 z-100 max-h-[min(90vh,32rem)] w-[min(26rem,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2",
        "rounded-2xl border border-stone-200 bg-white p-6 text-brand-950 shadow-2xl",
        "backdrop:bg-black/40 backdrop:backdrop-blur-[1px]",
      )}
      aria-labelledby={titleId}
      aria-describedby={descId}
    >
      <h2
        id={titleId}
        className="font-display text-lg font-semibold text-brand-950"
      >
        {title}
      </h2>
      <div id={descId} className="mt-2 text-sm text-brand-800/90">
        {description}
      </div>
      {errorMessage ? (
        <p className="mt-3 text-sm text-red-700" role="alert">
          {errorMessage}
        </p>
      ) : null}
      <div className="mt-6 flex flex-wrap justify-end gap-2">
        <button
          type="button"
          className="min-h-[44px] rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm font-semibold text-brand-900 outline-none ring-mobile-primary/25 hover:bg-stone-50 focus-visible:ring-2"
          onClick={() => dialogRef.current?.close()}
          disabled={isConfirming}
          autoFocus
        >
          {cancelLabel}
        </button>
        <button
          type="button"
          className={clsx(
            "min-h-[44px] rounded-lg px-4 py-2 text-sm font-semibold text-white outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-70",
            confirmVariant === "danger"
              ? "bg-red-700 ring-red-500/40 hover:bg-red-800"
              : "bg-brand-800 ring-mobile-primary/25 hover:bg-brand-950",
          )}
          onClick={onConfirm}
          disabled={isConfirming}
          aria-disabled={isConfirming || undefined}
        >
          {isConfirming ? "Working..." : confirmLabel}
        </button>
      </div>
    </dialog>
  )
}
