import { describe, expect, it } from "vitest"
import { isCurrentUserVenueOwner } from "./managerOwnership"

describe("isCurrentUserVenueOwner", () => {
  it("matches ignoring case and surrounding spaces", () => {
    expect(isCurrentUserVenueOwner(" MissMia ", "missmia")).toBe(true)
  })

  it("rejects a different profile", () => {
    expect(isCurrentUserVenueOwner("alice", "bob")).toBe(false)
  })

  it("rejects missing owner or profile", () => {
    expect(isCurrentUserVenueOwner(undefined, "alice")).toBe(false)
    expect(isCurrentUserVenueOwner("alice", "")).toBe(false)
  })
})
