const envBase = import.meta.env.VITE_API_BASE_URL as string | undefined
const noroffApiKey = (
  import.meta.env.VITE_NOROFF_API_KEY as string | undefined
)?.trim()

export const API_BASE_URL = (envBase ?? "https://v2.api.noroff.dev").replace(
  /\/$/,
  "",
)

export function holidazeProfileSlugCandidates(profileName: string): string[] {
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

function isLikelyNetworkFailure(error: unknown): boolean {
  if (!(error instanceof Error)) return false
  if (error.name === "AbortError") return false
  const msg = error.message.toLowerCase()
  return (
    error.name === "TypeError" ||
    error.name === "NetworkError" ||
    /failed to fetch|networkerror|load failed|network request failed/.test(msg)
  )
}

function userFacingNetworkError(error: unknown): Error {
  if (!isLikelyNetworkFailure(error)) {
    return error instanceof Error
      ? error
      : new Error("Something went wrong. Please try again.")
  }

  const offline = typeof navigator !== "undefined" && navigator.onLine === false
  const message = offline
    ? "You’re offline. Check your connection and try again."
    : "We couldn’t reach the server. Please try again in a moment."

  return new Error(message, { cause: error })
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
      "We couldn’t complete that request. Please try again in a moment.",
    )
  }
  if (bearer) headers.set("Authorization", `Bearer ${bearer}`)
  if (noroffApiKey) headers.set("X-Noroff-API-Key", noroffApiKey)

  let res: Response
  try {
    res = await fetch(`${API_BASE_URL}${path}`, { ...rest, headers })
  } catch (error) {
    throw userFacingNetworkError(error)
  }

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
