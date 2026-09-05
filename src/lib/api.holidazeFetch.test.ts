import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

describe("holidazeFetch", () => {
  const originalFetch = globalThis.fetch

  beforeEach(() => {
    vi.stubEnv("VITE_NOROFF_API_KEY", "test-app-key")
    globalThis.fetch = vi.fn()
  })

  afterEach(() => {
    globalThis.fetch = originalFetch
    vi.unstubAllEnvs()
    vi.resetModules()
  })

  async function loadApi() {
    vi.resetModules()
    return import("./api")
  }

  async function loadApiWithoutKey() {
    vi.stubEnv("VITE_NOROFF_API_KEY", "")
    vi.resetModules()
    return import("./api")
  }

  it("returns undefined on 204 No Content", async () => {
    const { holidazeFetch } = await loadApi()
    vi.mocked(globalThis.fetch).mockResolvedValue({
      ok: true,
      status: 204,
      json: async () => {
        throw new Error("no body")
      },
    } as unknown as Response)

    const result = await holidazeFetch<void>("/holidaze/venues/abc", {
      method: "DELETE",
      token: "jwt",
    })
    expect(result).toBeUndefined()
  })

  it("throws when Bearer is sent without VITE_NOROFF_API_KEY", async () => {
    const { holidazeFetch } = await loadApiWithoutKey()
    await expect(
      holidazeFetch("/holidaze/profiles/me", { token: "jwt" }),
    ).rejects.toThrow(/try again/i)
    expect(globalThis.fetch).not.toHaveBeenCalled()
  })

  it("invokes the unauthorized handler on 401 when a token was sent", async () => {
    const { holidazeFetch, setUnauthorizedHandler, API_BASE_URL } =
      await loadApi()
    const on401 = vi.fn()
    setUnauthorizedHandler(on401)
    vi.mocked(globalThis.fetch).mockResolvedValue({
      ok: false,
      status: 401,
      statusText: "Unauthorized",
      json: async () => ({ message: "Token expired" }),
    } as unknown as Response)

    await expect(
      holidazeFetch("/holidaze/bookings", { token: "jwt" }),
    ).rejects.toThrow(/Token expired|Unauthorized/)

    expect(on401).toHaveBeenCalledTimes(1)
    const [url, init] = vi.mocked(globalThis.fetch).mock.calls[0]!
    expect(url).toBe(`${API_BASE_URL}/holidaze/bookings`)
    expect(new Headers(init?.headers).get("Authorization")).toBe("Bearer jwt")
    expect(new Headers(init?.headers).get("X-Noroff-API-Key")).toBe(
      "test-app-key",
    )
  })

  it("parses array error messages from the API body", async () => {
    const { holidazeFetch } = await loadApi()
    vi.mocked(globalThis.fetch).mockResolvedValue({
      ok: false,
      status: 400,
      statusText: "Bad Request",
      json: async () => ({
        errors: [
          { message: "Invalid dateFrom" },
          { message: "Guests required" },
        ],
      }),
    } as unknown as Response)

    await expect(
      holidazeFetch("/holidaze/bookings", { method: "POST" }),
    ).rejects.toThrow("Invalid dateFrom; Guests required")
  })
})
