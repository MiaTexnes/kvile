import clsx from "clsx"

export const KVILE_LOGO_SRC = "/kvile-logo.png" as const

// Layout height stays 30px; scale-* only makes the art look bigger
export function KvileLogo({ className }: { className?: string }) {
  return (
    <img
      src={KVILE_LOGO_SRC}
      alt="Kvile"
      className={clsx(
        "block h-[30px] w-auto shrink-0 origin-left object-contain object-left",
        "scale-[1.75] md:scale-[3.25]",
        className,
      )}
      decoding="async"
    />
  )
}
