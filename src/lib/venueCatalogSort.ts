import { compareDesc, parseISO } from 'date-fns'
import type { Venue } from './types'

export type CatalogSortMode =
  | 'default'
  | 'newest'
  | 'price-asc'
  | 'rating-desc'

const CATALOG_SORT_MODES: CatalogSortMode[] = [
  'default',
  'newest',
  'price-asc',
  'rating-desc',
]

export const CATALOG_SORT_OPTIONS: ReadonlyArray<{
  value: CatalogSortMode
  label: string
}> = [
  { value: 'default', label: 'Default' },
  { value: 'newest', label: 'Newest first' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'rating-desc', label: 'Rating: high to low' },
] as const

export function isCatalogSortMode(value: string): value is CatalogSortMode {
  return (CATALOG_SORT_MODES as string[]).includes(value)
}

export function catalogSortFromSearchParam(raw: string | null): CatalogSortMode {
  if (raw && isCatalogSortMode(raw)) return raw
  return 'default'
}

/** URL `sort` query value; omit for default API order. */
export function catalogSortToSearchParam(mode: CatalogSortMode): string | null {
  return mode === 'default' ? null : mode
}

/** Noroff list/search `sort` / `sortOrder` when the API should pre-order pages. */
export function noroffCatalogSortQuery(
  mode: CatalogSortMode,
): { sort: string; sortOrder: string } | undefined {
  switch (mode) {
    case 'newest':
      return { sort: 'created', sortOrder: 'desc' }
    case 'price-asc':
      return { sort: 'price', sortOrder: 'asc' }
    case 'rating-desc':
      return { sort: 'rating', sortOrder: 'desc' }
    default:
      return undefined
  }
}

/** Stable client order by `updated` then `created` (matches host dashboard behaviour). */
export function sortVenuesNewestFirst(venues: Venue[]): Venue[] {
  return [...venues].sort((a, b) => {
    const ta = a.updated ?? a.created
    const tb = b.updated ?? b.created
    if (!ta && !tb) return 0
    if (!ta) return 1
    if (!tb) return -1
    try {
      return compareDesc(parseISO(ta), parseISO(tb))
    } catch {
      return 0
    }
  })
}

export function sortVenuesByPriceAsc(venues: Venue[]): Venue[] {
  return [...venues].sort((a, b) => a.price - b.price)
}

export function sortVenuesByRatingDesc(venues: Venue[]): Venue[] {
  return [...venues].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
}

/** Re-order loaded catalogue pages (infinite scroll merges before filters). */
export function sortVenuesByCatalogMode(venues: Venue[], mode: CatalogSortMode): Venue[] {
  switch (mode) {
    case 'newest':
      return sortVenuesNewestFirst(venues)
    case 'price-asc':
      return sortVenuesByPriceAsc(venues)
    case 'rating-desc':
      return sortVenuesByRatingDesc(venues)
    default:
      return venues
  }
}
