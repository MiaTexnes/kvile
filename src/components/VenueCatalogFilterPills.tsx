import clsx from "clsx"
import {
  VENUE_AMENITY_FILTER_OPTIONS,
  type VenueAmenityKey,
} from "../lib/filterVenues"

type Props = {
  filterTopRated: boolean
  onToggleTopRated: () => void
  amenityFilters: readonly VenueAmenityKey[]
  onToggleAmenity: (key: VenueAmenityKey) => void
  // compact = flat chips on mobile (no shadow)
  variant?: "default" | "compact"
  className?: string
}

export function VenueCatalogFilterPills({
  filterTopRated,
  onToggleTopRated,
  amenityFilters,
  onToggleAmenity,
  variant = "default",
  className,
}: Props) {
  const isCompact = variant === "compact"

  return (
    <div
      className={clsx(
        "flex flex-wrap",
        isCompact ? "gap-2" : "gap-3 sm:gap-4",
        className,
      )}
      role="group"
      aria-label="Filter stays"
    >
      <button
        type="button"
        onClick={onToggleTopRated}
        aria-pressed={filterTopRated}
        className={clsx(
          "inline-flex cursor-pointer items-center rounded-full text-sm font-semibold transition",
          isCompact ? "gap-0 px-4 py-2" : "gap-2 px-4 py-2 shadow-sm",
          filterTopRated
            ? "bg-badge-star-bg text-badge-star-text ring-2 ring-badge-star-text/25 hover:bg-amber-200/90 hover:ring-badge-star-text/35"
            : "border border-stone-200 bg-white text-mobile-ink hover:border-stone-300 hover:bg-stone-50",
        )}
      >
        <span aria-hidden>★</span> Top Rated
      </button>
      {VENUE_AMENITY_FILTER_OPTIONS.map(({ key, label }) => {
        const active = amenityFilters.includes(key)
        return (
          <button
            key={key}
            type="button"
            onClick={() => onToggleAmenity(key)}
            aria-pressed={active}
            className={clsx(
              "inline-flex cursor-pointer items-center rounded-full text-sm font-semibold transition",
              isCompact ? "px-4 py-2" : "px-4 py-2 shadow-sm",
              active
                ? "bg-brand-50 text-brand-950 ring-2 ring-brand-700/20 hover:bg-brand-100 hover:ring-brand-700/30"
                : "border border-stone-200 bg-white text-mobile-ink hover:border-stone-300 hover:bg-stone-50",
            )}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}
