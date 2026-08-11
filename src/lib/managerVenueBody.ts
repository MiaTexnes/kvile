// POST/PUT /holidaze/venues body. Skip location when address/city/country are all blank —
// sending nulls alone tends to fail validation.
export type ManagerVenueFormValues = {
  name: string
  description: string
  price: number
  maxGuests: number
  rating?: number
  imageUrl: string
  wifi: boolean
  parking: boolean
  breakfast: boolean
  pets: boolean
  address?: string
  city?: string
  country?: string
}

export function buildVenueUpsertBody(
  values: ManagerVenueFormValues,
): Record<string, unknown> {
  const price = Math.round(values.price * 100) / 100
  const maxGuests = Math.max(1, Math.floor(Number(values.maxGuests)))
  const media =
    values.imageUrl.trim().length > 0
      ? [{ url: values.imageUrl.trim(), alt: values.name.trim() }]
      : []
  const body: Record<string, unknown> = {
    name: values.name.trim(),
    description: values.description.trim(),
    price,
    maxGuests,
    meta: {
      wifi: values.wifi,
      parking: values.parking,
      breakfast: values.breakfast,
      pets: values.pets,
    },
  }
  if (media.length > 0) {
    body.media = media
  }
  if (
    typeof values.rating === "number" &&
    Number.isFinite(values.rating) &&
    values.rating > 0
  ) {
    body.rating = values.rating
  }
  const address = values.address?.trim() ?? ""
  const city = values.city?.trim() ?? ""
  const country = values.country?.trim() ?? ""
  if (address || city || country) {
    body.location = {
      address: address || null,
      city: city || null,
      country: country || null,
    }
  }
  return body
}
