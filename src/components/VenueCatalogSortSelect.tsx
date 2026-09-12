import clsx from "clsx"
import { useEffect, useId, useRef, useState } from "react"
import {
  CATALOG_SORT_OPTIONS,
  type CatalogSortMode,
} from "../lib/venueCatalogSort"

type Props = {
  id: string
  value: CatalogSortMode
  onChange: (mode: CatalogSortMode) => void
  className?: string
  labelClassName?: string
  modes?: readonly CatalogSortMode[]
  optionLabels?: Partial<Record<CatalogSortMode, string>>
}

export function VenueCatalogSortSelect({
  id,
  value,
  onChange,
  className,
  labelClassName = "text-sm font-semibold text-mobile-ink",
  modes,
  optionLabels,
}: Props) {
  const allowed = modes ?? CATALOG_SORT_OPTIONS.map((o) => o.value)
  const options = CATALOG_SORT_OPTIONS.filter((o) => allowed.includes(o.value))
  const listId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [open, setOpen] = useState(false)
  const selectedIndex = Math.max(
    0,
    options.findIndex((o) => o.value === value),
  )
  const [highlighted, setHighlighted] = useState(selectedIndex)

  const currentLabel =
    optionLabels?.[value] ??
    options.find((o) => o.value === value)?.label ??
    "Default"

  useEffect(() => {
    if (!open) return

    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault()
        setOpen(false)
        buttonRef.current?.focus()
      }
    }

    document.addEventListener("pointerdown", onPointerDown)
    document.addEventListener("keydown", onKeyDown)
    return () => {
      document.removeEventListener("pointerdown", onPointerDown)
      document.removeEventListener("keydown", onKeyDown)
    }
  }, [open])

  function openMenu() {
    setHighlighted(selectedIndex)
    setOpen(true)
  }

  function selectMode(mode: CatalogSortMode) {
    onChange(mode)
    setOpen(false)
    buttonRef.current?.focus()
  }

  function moveHighlight(delta: number) {
    setHighlighted((current) => {
      const next = (current + delta + options.length) % options.length
      return next
    })
  }

  return (
    <div
      className={clsx("flex min-h-11 flex-wrap items-center gap-2", className)}
    >
      <label htmlFor={id} className={labelClassName}>
        Sort
      </label>
      <div ref={rootRef} className="relative min-w-40 flex-1 sm:flex-initial">
        <button
          ref={buttonRef}
          id={id}
          type="button"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={listId}
          aria-activedescendant={
            open ? `${listId}-${options[highlighted]?.value}` : undefined
          }
          onClick={() => {
            if (open) setOpen(false)
            else openMenu()
          }}
          onKeyDown={(event) => {
            if (event.key === "ArrowDown") {
              event.preventDefault()
              if (!open) openMenu()
              else moveHighlight(1)
            }
            if (event.key === "ArrowUp") {
              event.preventDefault()
              if (!open) openMenu()
              else moveHighlight(-1)
            }
            if (open && event.key === "Home") {
              event.preventDefault()
              setHighlighted(0)
            }
            if (open && event.key === "End") {
              event.preventDefault()
              setHighlighted(options.length - 1)
            }
            if (open && (event.key === "Enter" || event.key === " ")) {
              event.preventDefault()
              const next = options[highlighted]
              if (next) selectMode(next.value)
            }
          }}
          className="flex min-h-11 w-full min-w-40 items-center justify-between gap-3 rounded-full border border-stone-300 bg-white px-4 py-2 text-left text-sm font-medium text-mobile-ink outline-none ring-mobile-primary/25 focus:ring-2"
        >
          <span>{currentLabel}</span>
          <svg
            viewBox="0 0 20 20"
            fill="none"
            aria-hidden
            className={clsx(
              "size-4 shrink-0 text-on-surface-muted transition-transform",
              open && "rotate-180",
            )}
          >
            <path
              d="M5 7.5 10 12.5 15 7.5"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {open ? (
          <ul
            id={listId}
            role="listbox"
            aria-label="Sort"
            className="absolute left-0 right-0 z-30 mt-2 rounded-2xl border border-stone-300 bg-white p-1.5 shadow-lg"
          >
            {options.map((option, index) => {
              const selected = option.value === value
              const active = index === highlighted
              const label = optionLabels?.[option.value] ?? option.label
              return (
                <li
                  key={option.value}
                  id={`${listId}-${option.value}`}
                  role="option"
                  aria-selected={selected}
                  onMouseEnter={() => setHighlighted(index)}
                  onClick={() => selectMode(option.value)}
                  className={clsx(
                    "cursor-pointer rounded-full px-4 py-2 text-sm font-medium",
                    selected && "bg-brand-50 text-brand-950",
                    !selected && active && "bg-stone-100",
                    !selected && !active && "text-mobile-ink",
                  )}
                >
                  {label}
                </li>
              )
            })}
          </ul>
        ) : null}
      </div>
    </div>
  )
}
