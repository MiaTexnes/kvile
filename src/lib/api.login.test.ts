import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { API_BASE_URL, loginUser } from "./api"

describe("loginUser", () => {
  const originalFetch = globalThis.fetch

  beforeEach(() => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        data: {
          name: "Test",
          email: "t@stud.noroff.no",
          venueManager: false,
          accessToken: "mock.jwt.token",
        },
        meta: {},
      }),
    }) as unknown as typeof fetch
  })

  afterEach(() => {
    globalThis.fetch = originalFetch
  })

  it("POSTs JSON credentials to the Noroff Holidaze login route", async () => {
    const data = await loginUser("t@stud.noroff.no", "secret")
    expect(data.accessToken).toBe("mock.jwt.token")
    expect(globalThis.fetch).toHaveBeenCalledTimes(1)
    const [url, init] = (globalThis.fetch as ReturnType<typeof vi.fn>).mock
      .calls[0] as [string, RequestInit]
    expect(url).toBe(`${API_BASE_URL}/auth/login?_holidaze=true`)
    expect(init.method).toBe("POST")
    expect(init.body).toBe(
      JSON.stringify({ email: "t@stud.noroff.no", password: "secret" }),
    )
  })
})
