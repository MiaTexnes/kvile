import { describe, expect, it } from "vitest"
import {
  truncateText,
  venueAmenityLabels,
  venueLocationLabel,
  venueRatingLabel,
} from "./managerVenueCard"

describe("venueLocationLabel", () => {
  it("joins city and country", () => {
    expect(venueLocationLabel({ city: "Bergen", country: "Norway" })).toBe(
      "Bergen, Norway",
    )
  })

  it("skips empty parts", () => {
    expect(venueLocationLabel({ city: "Bergen" })).toBe("Bergen")
    expect(venueLocationLabel({})).toBe("")
    expect(venueLocationLabel(undefined)).toBe("")
  })
})

describe("venueAmenityLabels", () => {
  it("returns only true amenities", () => {
    expect(
      venueAmenityLabels({ wifi: true, parking: false, pets: true }),
    ).toEqual(["Wi‑Fi", "Pets allowed"])
  })

  it("returns empty when meta is missing", () => {
    expect(venueAmenityLabels(undefined)).toEqual([])
  })
})

describe("venueRatingLabel", () => {
  it("formats one decimal when rating is set", () => {
    expect(venueRatingLabel(4.5)).toBe("4.5")
    expect(venueRatingLabel(0)).toBe("0.0")
  })

  it("hides missing rating", () => {
    expect(venueRatingLabel(undefined)).toBeNull()
    expect(venueRatingLabel(null)).toBeNull()
  })
})

describe("truncateText", () => {
  it("returns null for blank text", () => {
    expect(truncateText("  ")).toBeNull()
  })

  it("keeps short text and truncates long text", () => {
    expect(truncateText("Cabin by the fjord", 20)).toBe("Cabin by the fjord")
    expect(truncateText("A".repeat(20), 10)).toBe("AAAAAAAAAA…")
  })
})
