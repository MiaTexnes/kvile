import type { Venue, VenueMeta } from "./types"

export function venueLocationLabel(
  location: Venue["location"] | undefined,
): string {
  return [location?.city, location?.country].filter(Boolean).join(", ")
}

const AMENITY_LABELS: { key: keyof VenueMeta; label: string }[] = [
  { key: "wifi", label: "Wi‑Fi" },
  { key: "parking", label: "Parking" },
  { key: "breakfast", label: "Breakfast" },
  { key: "pets", label: "Pets allowed" },
]

export function venueAmenityLabels(meta: VenueMeta | undefined): string[] {
  if (!meta) return []
  return AMENITY_LABELS.filter(({ key }) => meta[key] === true).map(
    ({ label }) => label,
  )
}

export function venueRatingLabel(
  rating: number | undefined | null,
): string | null {
  if (rating == null || Number.isNaN(rating)) return null
  return rating.toFixed(1)
}

export function truncateText(
  text: string | undefined | null,
  max = 140,
): string | null {
  const t = text?.trim()
  if (!t) return null
  if (t.length <= max) return t
  return `${t.slice(0, max).trimEnd()}…`
}
