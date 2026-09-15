import type {
  ApiListResponse,
  ApiResponse,
  Booking,
  HolidazeProfile,
} from "../types"
import { holidazeFetch, holidazeProfileSlugCandidates } from "./client"
import { fetchVenue } from "./venues"

async function fetchHolidazeProfileResponse(
  token: string,
  profileName: string,
  opts?: { endSessionOn401?: boolean },
): Promise<ApiResponse<HolidazeProfile>> {
  const endSessionOn401 = opts?.endSessionOn401 ?? true
  let last: Error | undefined
  for (const slug of holidazeProfileSlugCandidates(profileName)) {
    try {
      return await holidazeFetch<ApiResponse<HolidazeProfile>>(
        `/holidaze/profiles/${slug}?_bookings=true`,
        { token, endSessionOn401 },
      )
    } catch (e) {
      last = e instanceof Error ? e : new Error(String(e))
    }
  }
  throw last ?? new Error("Profile request failed")
}

export async function fetchProfile(
  token: string,
  profileName: string,
): Promise<HolidazeProfile> {
  const json = await fetchHolidazeProfileResponse(token, profileName, {
    endSessionOn401: false,
  })
  return json.data
}

export async function fetchProfileBookings(
  token: string,
  profileName: string,
): Promise<ApiListResponse<Booking>> {
  const json = await fetchHolidazeProfileResponse(token, profileName, {
    endSessionOn401: false,
  })
  const bookings = json.data.bookings ?? []
  const venueIds = [
    ...new Set(
      bookings
        .map((b) => b.venue?.id)
        .filter((id): id is string => Boolean(id)),
    ),
  ]
  const ownerEntries = await Promise.all(
    venueIds.map(async (id) => {
      try {
        const venue = await fetchVenue(id, { owner: true })
        return [id, venue.owner] as const
      } catch {
        return [id, undefined] as const
      }
    }),
  )
  const ownerByVenueId = new Map(ownerEntries)

  return {
    data: bookings.map((b) => {
      const owner = b.venue?.id ? ownerByVenueId.get(b.venue.id) : undefined
      if (!b.venue || !owner) return b
      return { ...b, venue: { ...b.venue, owner } }
    }),
    meta: (json.meta ?? {}) as ApiListResponse<Booking>["meta"],
  }
}

export async function updateProfile(
  token: string,
  profileName: string,
  body: {
    bio?: string
    avatar?: { url: string; alt?: string }
    banner?: { url: string; alt?: string }
    venueManager?: boolean
  },
): Promise<HolidazeProfile> {
  let last: Error | undefined
  for (const slug of holidazeProfileSlugCandidates(profileName)) {
    try {
      const json = await holidazeFetch<ApiResponse<HolidazeProfile>>(
        `/holidaze/profiles/${slug}`,
        {
          method: "PUT",
          token,
          endSessionOn401: false,
          body: JSON.stringify(body),
        },
      )
      return json.data
    } catch (e) {
      last = e instanceof Error ? e : new Error(String(e))
    }
  }
  throw last ?? new Error("Profile update failed")
}
