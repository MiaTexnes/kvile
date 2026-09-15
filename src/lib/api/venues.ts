import type {
  ApiListResponse,
  ApiResponse,
  HolidazeProfile,
  Venue,
} from "../types"
import { venueMatchesCatalogQuery } from "../filterVenues"
import { holidazeFetch, holidazeProfileSlugCandidates } from "./client"

export async function fetchVenuesPage(
  page = 1,
  limit = 20,
  opts?: { sort?: string; sortOrder?: string },
): Promise<ApiListResponse<Venue>> {
  const params = new URLSearchParams({
    limit: String(limit),
    page: String(page),
  })
  if (opts?.sort) params.set("sort", opts.sort)
  if (opts?.sortOrder) params.set("sortOrder", opts.sortOrder)
  params.set("_owner", "true")
  return holidazeFetch<ApiListResponse<Venue>>(`/holidaze/venues?${params}`)
}

// Page 1 also merges in catalogue hits — Noroff search is often behind /venues
export async function fetchVenuesSearchPage(
  q: string,
  page = 1,
  limit = 24,
  listOpts?: { sort?: string; sortOrder?: string },
): Promise<ApiListResponse<Venue>> {
  const trimmed = q.trim()
  const params = new URLSearchParams({
    q: trimmed,
    limit: String(limit),
    page: String(page),
  })
  if (listOpts?.sort) params.set("sort", listOpts.sort)
  if (listOpts?.sortOrder) params.set("sortOrder", listOpts.sortOrder)
  params.set("_owner", "true")

  if (!trimmed || page !== 1) {
    return holidazeFetch<ApiListResponse<Venue>>(
      `/holidaze/venues/search?${params}`,
    )
  }

  const searchPath = `/holidaze/venues/search?${params}`
  const [search, browse1, browse2] = await Promise.all([
    holidazeFetch<ApiListResponse<Venue>>(searchPath),
    fetchVenuesPage(1, 96, listOpts),
    fetchVenuesPage(2, 96, listOpts),
  ])
  const fromBrowse = [...browse1.data, ...browse2.data]
  const inSearch = new Set(search.data.map((v) => v.id))
  const extras = fromBrowse.filter(
    (v) => !inSearch.has(v.id) && venueMatchesCatalogQuery(v, trimmed),
  )
  return {
    data: [...search.data, ...extras],
    meta: search.meta ?? {},
  }
}

export async function fetchVenue(
  id: string,
  opts?: { bookings?: boolean; owner?: boolean; customer?: boolean },
): Promise<Venue> {
  const params = new URLSearchParams()
  if (opts?.bookings) params.set("_bookings", "true")
  if (opts?.owner) params.set("_owner", "true")
  // `_customer=true` embeds guest name/email on each booking
  if (opts?.customer) params.set("_customer", "true")
  const qs = params.toString()
  const path = qs ? `/holidaze/venues/${id}?${qs}` : `/holidaze/venues/${id}`
  const json = await holidazeFetch<ApiResponse<Venue>>(path)
  return json.data
}

// Create/update responses come back as { data: Venue }
function requireVenuePayload(json: unknown, action: string): Venue {
  if (!json || typeof json !== "object" || !("data" in json)) {
    throw new Error(
      `${action}: response was not wrapped in { data: ... }. Check the Network response.`,
    )
  }
  const data = (json as ApiResponse<Venue>).data
  if (
    data == null ||
    typeof data !== "object" ||
    !("id" in data) ||
    typeof data.id !== "string"
  ) {
    throw new Error(
      `${action}: response had no venue id. Check the Network response.`,
    )
  }
  return data
}

// Host dashboard — create venue
export async function createVenue(
  token: string,
  body: Record<string, unknown>,
): Promise<Venue> {
  const json = await holidazeFetch<ApiResponse<Venue>>("/holidaze/venues", {
    method: "POST",
    token,
    endSessionOn401: false,
    body: JSON.stringify(body),
  })
  return requireVenuePayload(json, "Create venue")
}

// Host dashboard — update venue
export async function updateVenue(
  token: string,
  id: string,
  body: Record<string, unknown>,
): Promise<Venue> {
  const json = await holidazeFetch<ApiResponse<Venue>>(
    `/holidaze/venues/${id}`,
    {
      method: "PUT",
      token,
      endSessionOn401: false,
      body: JSON.stringify(body),
    },
  )
  return requireVenuePayload(json, "Update venue")
}

// Host dashboard — delete venue
export async function deleteVenue(token: string, id: string): Promise<void> {
  await holidazeFetch<void>(`/holidaze/venues/${id}`, {
    method: "DELETE",
    token,
    endSessionOn401: false,
  })
}

// Walk pages via meta — an empty page alone isn't a stop signal
async function fetchVenueListPaginated(
  token: string | undefined,
  pathForPage: (page: number, limit: number) => string,
): Promise<Venue[]> {
  const collected: Venue[] = []
  let page = 1
  const limit = 100
  const maxPages = 20
  for (let i = 0; i < maxPages; i++) {
    const json = await holidazeFetch<ApiListResponse<Venue>>(
      pathForPage(page, limit),
      {
        token,
        endSessionOn401: false,
      },
    )
    const rows = Array.isArray(json.data) ? json.data : []
    collected.push(...rows)
    const meta = json.meta ?? {}
    if (meta.isLastPage === true || meta.nextPage == null) break
    page = typeof meta.nextPage === "number" ? meta.nextPage : page + 1
  }
  return collected
}

async function tryFetchProfileVenuesEmbedded(
  token: string | undefined,
  slug: string,
): Promise<Venue[] | "next"> {
  try {
    // `_venues=true` alone can 404 on v2; pairing with `_bookings=true` is more reliable
    const nested = await holidazeFetch<ApiResponse<HolidazeProfile>>(
      `/holidaze/profiles/${slug}?_bookings=true&_venues=true`,
      { token, endSessionOn401: false },
    )
    const embedded = nested.data?.venues
    if (Array.isArray(embedded)) return embedded
  } catch {
    return "next"
  }
  return "next"
}

async function tryFetchProfileVenuesViaListEndpoints(
  token: string | undefined,
  slug: string,
): Promise<Venue[] | "next"> {
  try {
    // `_owner=true` first — that's the host's own venues
    const withOwner = await fetchVenueListPaginated(token, (page, lim) => {
      const p = new URLSearchParams({
        limit: String(lim),
        page: String(page),
        _owner: "true",
      })
      return `/holidaze/profiles/${slug}/venues?${p}`
    })
    if (withOwner.length > 0) return withOwner

    const subNoOwner = await fetchVenueListPaginated(token, (page, lim) => {
      const p = new URLSearchParams({
        limit: String(lim),
        page: String(page),
      })
      return `/holidaze/profiles/${slug}/venues?${p}`
    })
    if (subNoOwner.length > 0) return subNoOwner

    const bare = await holidazeFetch<ApiListResponse<Venue>>(
      `/holidaze/profiles/${slug}/venues`,
      {
        token,
        endSessionOn401: false,
      },
    )
    return Array.isArray(bare.data) ? bare.data : []
  } catch {
    return "next"
  }
}

function dedupeVenuesById(rows: Venue[]): Venue[] {
  const byId = new Map<string, Venue>()
  for (const v of rows) byId.set(v.id, v)
  return [...byId.values()]
}

// List endpoint + embedded venues, then dedupe. Skip token for public host pages.
export async function fetchVenuesByProfileName(
  profileName: string,
  token?: string | null,
): Promise<Venue[]> {
  const t = typeof token === "string" && token.trim() ? token.trim() : undefined

  for (const slug of holidazeProfileSlugCandidates(profileName)) {
    const [listed, embedded] = await Promise.all([
      tryFetchProfileVenuesViaListEndpoints(t, slug),
      tryFetchProfileVenuesEmbedded(t, slug),
    ])

    const fromList = listed !== "next" ? listed : []
    const fromEmbed = embedded !== "next" ? embedded : []
    const merged = dedupeVenuesById([...fromList, ...fromEmbed])
    if (merged.length > 0) return merged
    // Slug resolved but empty — don't keep trying casing variants as if it 404'd
    if (listed !== "next" || embedded !== "next") return []
  }
  return []
}

// Public host catalogue (no Bearer)
export function fetchPublicHostVenues(profileName: string): Promise<Venue[]> {
  return fetchVenuesByProfileName(profileName, undefined)
}

// Host dashboard — same path, with the manager token
export async function fetchProfileVenues(
  token: string,
  profileName: string,
): Promise<Venue[]> {
  return fetchVenuesByProfileName(profileName, token)
}
