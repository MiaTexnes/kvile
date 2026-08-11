import type {
  ApiListResponse,
  ApiResponse,
  Booking,
  HolidazeProfile,
  LoginResponseData,
  RegisterRequestBody,
  Venue,
} from "./types"
import { venueMatchesCatalogQuery } from "./filterVenues"

const envBase = import.meta.env.VITE_API_BASE_URL as string | undefined
const noroffApiKey = (
  import.meta.env.VITE_NOROFF_API_KEY as string | undefined
)?.trim()

export const API_BASE_URL = (envBase ?? "https://v2.api.noroff.dev").replace(
  /\/$/,
  "",
)

function holidazeProfileSlugCandidates(profileName: string): string[] {
  const t = profileName.trim()
  const lower = encodeURIComponent(t.toLowerCase())
  const raw = encodeURIComponent(t)
  return lower === raw ? [lower] : [raw, lower]
}

let unauthorizedHandler: (() => void) | null = null

export function setUnauthorizedHandler(fn: (() => void) | null) {
  unauthorizedHandler = fn
}

async function parseErrorMessage(res: Response): Promise<string> {
  try {
    const body = (await res.json()) as {
      errors?: Array<{ message?: string } | string> | { message?: string }
      message?: string
    }
    if (body.errors) {
      if (Array.isArray(body.errors) && body.errors.length) {
        const msgs = body.errors
          .map((e) => (typeof e === "string" ? e : e?.message))
          .filter((m): m is string => Boolean(m && m.trim()))
        if (msgs.length) return msgs.join("; ")
      }
      if (!Array.isArray(body.errors) && typeof body.errors === "object") {
        const m = (body.errors as { message?: string }).message
        if (m) return m
      }
    }
    if (body.message) return body.message
  } catch {
    /* ignore */
  }
  return res.statusText || `Request failed (${res.status})`
}

export async function holidazeFetch<T>(
  path: string,
  options: RequestInit & {
    token?: string | null
    endSessionOn401?: boolean
  } = {},
): Promise<T> {
  const {
    token,
    headers: optHeaders,
    endSessionOn401 = true,
    ...rest
  } = options
  const headers = new Headers(optHeaders)
  if (
    !headers.has("Content-Type") &&
    rest.body &&
    !(rest.body instanceof FormData)
  ) {
    headers.set("Content-Type", "application/json")
  }
  const bearer = token?.trim()
  if (bearer && !noroffApiKey) {
    throw new Error(
      "Missing VITE_NOROFF_API_KEY. Noroff requires X-Noroff-API-Key on requests that send a Bearer token. Add your app key to .env (copy from .env.example), then restart the dev server. On Netlify, add the same variable under Site settings > Environment.",
    )
  }
  if (bearer) headers.set("Authorization", `Bearer ${bearer}`)
  if (noroffApiKey) headers.set("X-Noroff-API-Key", noroffApiKey)

  const res = await fetch(`${API_BASE_URL}${path}`, { ...rest, headers })

  if (res.status === 401 && bearer && endSessionOn401) {
    unauthorizedHandler?.()
  }

  if (res.status === 204) {
    return undefined as T
  }

  if (!res.ok) {
    throw new Error(await parseErrorMessage(res))
  }

  try {
    return (await res.json()) as T
  } catch {
    throw new Error(`Response was not valid JSON (${res.status}).`)
  }
}

export async function registerUser(
  body: RegisterRequestBody,
): Promise<HolidazeProfile> {
  const json = await holidazeFetch<ApiResponse<HolidazeProfile>>(
    "/auth/register",
    {
      method: "POST",
      body: JSON.stringify(body),
    },
  )
  return json.data
}

export async function loginUser(
  email: string,
  password: string,
): Promise<LoginResponseData> {
  const json = await holidazeFetch<ApiResponse<LoginResponseData>>(
    "/auth/login?_holidaze=true",
    {
      method: "POST",
      body: JSON.stringify({ email, password }),
    },
  )
  return json.data
}

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
  return {
    data: json.data.bookings ?? [],
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
  if (opts?.customer) params.set("_customer", "true")
  const qs = params.toString()
  const path = qs ? `/holidaze/venues/${id}?${qs}` : `/holidaze/venues/${id}`
  const json = await holidazeFetch<ApiResponse<Venue>>(path)
  return json.data
}

export async function createBooking(
  token: string,
  body: { dateFrom: string; dateTo: string; guests: number; venueId: string },
): Promise<Booking> {
  const json = await holidazeFetch<ApiResponse<Booking>>("/holidaze/bookings", {
    method: "POST",
    token,
    endSessionOn401: false,
    body: JSON.stringify(body),
  })
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