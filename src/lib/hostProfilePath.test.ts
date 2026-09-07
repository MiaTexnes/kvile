import { describe, expect, it } from "vitest"
import { hostProfileHref } from "./hostProfilePath"

describe("hostProfileHref", () => {
  it("URL-encodes the profile segment and trims spaces", () => {
    expect(hostProfileHref("  MissMia  ")).toBe("/hosts/MissMia")
    expect(hostProfileHref("a b")).toBe(`/hosts/${encodeURIComponent("a b")}`)
  })
})
