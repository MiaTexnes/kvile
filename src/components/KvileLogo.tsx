import clsx from 'clsx'

export const KVILE_LOGO_SRC = '/kvile-logo.png' as const

/** Horizontal brand mark: layout stays 30px tall so header chrome unchanged; scales up visually (more on md+ desktop). */
export function KvileLogo({ className }: { className?: string }) {
  return (
    <img
      src={KVILE_LOGO_SRC}
      alt="Kvile"
      className={clsx(
        'block h-[30px] w-auto shrink-0 origin-left object-contain object-left',
        'scale-[1.75] md:scale-[3.25]',
        className,
      )}
      decoding="async"
    />
  )
}
