import { clampSearchGuests, DEFAULT_SEARCH_GUESTS } from "./filterVenues"

export type ParsedVenueSearchQuery = {
  textQuery: string
  guests: number | null
  requirePets: boolean
}

// e.g. "oslo", "2 guests bergen", "pets, cabin"
export function parseVenueSearchQuery(raw: string): ParsedVenueSearchQuery {
  let s = raw.trim()
  if (!s) {
    return { textQuery: "", guests: null, requirePets: false }
  }

  let requirePets = false
  if (/\b(pets?|dogs?|cats?)\b/i.test(s)) {
    requirePets = true
    s = s.replace(/\b(pets?|dogs?|cats?)\b/gi, " ")
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
      return " "
    })
  }

  const textQuery = s.replace(/[,\s]+/g, " ").trim()
  return { textQuery, guests, requirePets }
}

// Used when filling the search box from ?q=&guests=&pets=
export function formatVenueSearchQueryForDisplay(
  textQuery: string,
  guests: number,
  requirePets: boolean,
): string {
  const parts: string[] = []
  if (textQuery) parts.push(textQuery)
  if (guests !== DEFAULT_SEARCH_GUESTS) parts.push(`${guests} guests`)
  if (requirePets) parts.push("pets")
  return parts.join(", ")
}
