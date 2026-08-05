import clsx from "clsx"
import {
  CATALOG_SORT_OPTIONS,
  isCatalogSortMode,
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

  return (
    <div
      className={clsx(
        "flex min-h-[44px] flex-wrap items-center gap-2",
        className,
      )}
    >
      <label htmlFor={id} className={labelClassName}>
        Sort
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => {
          const next = e.target.value
          if (isCatalogSortMode(next)) onChange(next)
        }}
        className="min-h-[44px] min-w-[10rem] rounded-full border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-mobile-ink outline-none ring-mobile-primary/25 focus:ring-2"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {optionLabels?.[o.value] ?? o.label}
          </option>
        ))}
      </select>
    </div>
  )
}
