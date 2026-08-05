import type { Venue, VenueMeta } from './types'

/** Default guest count for search when the URL has no `guests` param. */
export const DEFAULT_SEARCH_GUESTS = 2

/** Upper bound for the search guest input (reasonable cap for UI + URL). */
export const MAX_SEARCH_GUESTS = 50

/** Amenity keys exposed as catalogue filter pills (maps to `Venue.meta`). */
export type VenueAmenityKey = keyof Pick<VenueMeta, 'wifi' | 'parking' | 'breakfast' | 'pets'>

export const VENUE_AMENITY_FILTER_OPTIONS: ReadonlyArray<{
  key: VenueAmenityKey
  label: string
}> = [
  { key: 'breakfast', label: 'Breakfast' },
  { key: 'pets', label: 'Pets' },
  { key: 'wifi', label: 'WiFi' },
  { key: 'parking', label: 'Parking' },
] as const

export type VenueCatalogFilters = {
  topRated: boolean
  amenities: readonly VenueAmenityKey[]
}

// Default client filters for the home "Recommended stays" section.
export const RECOMMENDED_STAYS_CATALOG_FILTERS: VenueCatalogFilters = {
  topRated: true,
  amenities: ['wifi', 'parking'],
}

export function clampSearchGuests(n: number): number {
  if (!Number.isFinite(n)) return DEFAULT_SEARCH_GUESTS
  return Math.min(MAX_SEARCH_GUESTS, Math.max(1, Math.floor(n)))
}

/** Parse `guests` query param; returns `null` if missing or invalid (caller keeps local default). */
export function parseGuestsFromSearchParam(s: string | null): number | null {
  if (s == null || s === '') return null
  const n = Number.parseInt(s, 10)
  if (!Number.isFinite(n)) return null
  return clampSearchGuests(n)
}

function venueHasAmenity(venue: Venue, key: VenueAmenityKey): boolean {
  return venue.meta?.[key] === true
}

/**
 * Client-side filters for venue lists.
 * @param minGuests When set, only venues with `maxGuests >= minGuests` are kept. Omit to skip this filter (e.g. for diagnostics).
 */
export function filterVenues(
  venues: Venue[],
  filters: VenueCatalogFilters,
  minGuests?: number,
): Venue[] {
  let list = venues
  if (filters.topRated) {
    list = list.filter((v) => (v.rating ?? 0) >= 4.5)
  }
  for (const key of filters.amenities) {
    list = list.filter((v) => venueHasAmenity(v, key))
  }
  if (minGuests !== undefined) {
    const min = clampSearchGuests(minGuests)
    list = list.filter((v) => v.maxGuests >= min)
  }
  return list
}

/** Case-insensitive match of `rawQuery` against name, description, and location strings (browse/search UX). */
export function venueMatchesCatalogQuery(venue: Venue, rawQuery: string): boolean {
  const needle = rawQuery.trim().toLowerCase()
  if (!needle) return false
  const haystack = [
    venue.name,
    venue.description ?? '',
    venue.location?.city ?? '',
    venue.location?.country ?? '',
    venue.location?.address ?? '',
    venue.location?.continent ?? '',
  ]
    .join('\n')
    .toLowerCase()
  return haystack.includes(needle)
}
