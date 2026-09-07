import type { Venue, VenueMeta } from "./types"

export const DEFAULT_SEARCH_GUESTS = 2

export const MAX_SEARCH_GUESTS = 50 // hard cap so the URL doesn't get silly values

export type VenueAmenityKey = keyof Pick<
  VenueMeta,
  "wifi" | "parking" | "breakfast" | "pets"
>

export const VENUE_AMENITY_FILTER_OPTIONS: ReadonlyArray<{
  key: VenueAmenityKey
  label: string
}> = [
  { key: "breakfast", label: "Breakfast" },
  { key: "pets", label: "Pets" },
  { key: "wifi", label: "WiFi" },
  { key: "parking", label: "Parking" },
] as const

export type VenueCatalogFilters = {
  topRated: boolean
  amenities: readonly VenueAmenityKey[]
}

// Default client filters for the home "Recommended stays" section.
export const RECOMMENDED_STAYS_CATALOG_FILTERS: VenueCatalogFilters = {
  topRated: true,
  amenities: ["wifi", "parking"],
}

export function clampSearchGuests(n: number): number {
  if (!Number.isFinite(n)) return DEFAULT_SEARCH_GUESTS
  return Math.min(MAX_SEARCH_GUESTS, Math.max(1, Math.floor(n)))
}

// null = URL had no/invalid guests; caller keeps its own default
export function parseGuestsFromSearchParam(s: string | null): number | null {
  if (s == null || s === "") return null
  const n = Number.parseInt(s, 10)
  if (!Number.isFinite(n)) return null
  return clampSearchGuests(n)
}

function venueHasAmenity(venue: Venue, key: VenueAmenityKey): boolean {
  return venue.meta?.[key] === true
}

// Optional minGuests: skip when you don't care about capacity
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

// Matches name, description, city/country (case-insensitive)
export function venueMatchesCatalogQuery(
  venue: Venue,
  rawQuery: string,
): boolean {
  const needle = rawQuery.trim().toLowerCase()
  if (!needle) return false
  const haystack = [
    venue.name,
    venue.description ?? "",
    venue.location?.city ?? "",
    venue.location?.country ?? "",
    venue.location?.address ?? "",
    venue.location?.continent ?? "",
  ]
    .join("\n")
    .toLowerCase()
  return haystack.includes(needle)
}
