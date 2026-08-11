import clsx from "clsx"
import type { ReactNode } from "react"

type Tone = "error" | "success" | "info" | "warning"

const toneStyles: Record<Tone, string> = {
  error: "border-red-300 bg-red-50 text-red-900",
  success: "border-emerald-300 bg-emerald-50 text-emerald-900",
  info: "border-brand-200 bg-brand-50 text-brand-950",
  warning: "border-amber-300 bg-amber-50 text-amber-900",
}

// errors: role=alert; everything else: role=status
export function Alert({
  tone = "info",
  children,
  className,
}: {
  tone?: Tone
  children: ReactNode
  className?: string
}) {
  const isError = tone === "error"
  return (
    <div
      role={isError ? "alert" : "status"}
      aria-live={isError ? "assertive" : "polite"}
      className={clsx(
        "rounded-xl border px-4 py-3 text-sm leading-relaxed",
        toneStyles[tone],
        className,
      )}
    >
      {children}
    </div>
  )
}
