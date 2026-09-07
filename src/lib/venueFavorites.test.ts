import { afterEach, beforeEach, describe, expect, it } from "vitest"
import {
  FAV_STORAGE_KEY,
  readStoredFavorites,
  writeStoredFavorites,
} from "./venueFavorites"

describe("readStoredFavorites / writeStoredFavorites", () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  it("round-trips favourite ids", () => {
    writeStoredFavorites({ a: true, b: true, c: false })
    expect(readStoredFavorites()).toEqual({ a: true, b: true })
  })

  it("returns empty map for missing key", () => {
    expect(readStoredFavorites()).toEqual({})
  })

  it("returns empty map for invalid JSON", () => {
    localStorage.setItem(FAV_STORAGE_KEY, "not json")
    expect(readStoredFavorites()).toEqual({})
  })

  it("returns empty map when stored value is not an array", () => {
    localStorage.setItem(FAV_STORAGE_KEY, JSON.stringify({ x: 1 }))
    expect(readStoredFavorites()).toEqual({})
  })

  it("ignores non-string entries in the stored array", () => {
    localStorage.setItem(
      FAV_STORAGE_KEY,
      JSON.stringify(["ok", 1, null, "two"]),
    )
    expect(readStoredFavorites()).toEqual({ ok: true, two: true })
  })
})
