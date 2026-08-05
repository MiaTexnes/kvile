import { clampSearchGuests, DEFAULT_SEARCH_GUESTS } from './filterVenues'

export type ParsedVenueSearchQuery = {
  /** Text passed to the Holidaze search endpoint (place, mood, etc.) */
  textQuery: string
  /** Capacity filter; `null` means keep the default guest count. */
  guests: number | null
  /** When true, only venues with `meta.pets` are shown after the fetch. */
  requirePets: boolean
}

/**
 * Pulls guest count, pets intent, and free-text query from one search box.
 * Examples: "oslo", "2 guests bergen", "pets, cabin", "for 4 people, oslo".
 */
export function parseVenueSearchQuery(raw: string): ParsedVenueSearchQuery {
  let s = raw.trim()
  if (!s) {
    return { textQuery: '', guests: null, requirePets: false }
  }

  let requirePets = false
  if (/\b(pets?|dogs?|cats?)\b/i.test(s)) {
    requirePets = true
    s = s.replace(/\b(pets?|dogs?|cats?)\b/gi, ' ')
  }

  let guests: number | null = null
  const guestPatterns: RegExp[] = [
    /\bfor\s+(\d{1,2})\s*(?:guests?|people|persons?|pers)\b/gi,
    /\b(\d{1,2})\s*(?:guests?|people|persons?|pers|pax)\b/gi,
    /\b(\d{1,2})\s*(?:person|people)\b/gi,
  ]
  for (const re of guestPatterns) {
    s = s.replace(re, (_, n: string) => {
      if (guests == null) guests = clampSearchGuests(Number.parseInt(n, 10))
      return ' '
    })
  }

  const textQuery = s.replace(/[,\s]+/g, ' ').trim()
  return { textQuery, guests, requirePets }
}

/** Rebuilds a display string from URL params (deep links / back button). */
export function formatVenueSearchQueryForDisplay(
  textQuery: string,
  guests: number,
  requirePets: boolean,
): string {
  const parts: string[] = []
  if (textQuery) parts.push(textQuery)
  if (guests !== DEFAULT_SEARCH_GUESTS) parts.push(`${guests} guests`)
  if (requirePets) parts.push('pets')
  return parts.join(', ')
}
