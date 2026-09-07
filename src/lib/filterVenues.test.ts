import { describe, expect, it } from "vitest"
import type { Venue } from "./types"
import {
  clampSearchGuests,
  DEFAULT_SEARCH_GUESTS,
  filterVenues,
  MAX_SEARCH_GUESTS,
  parseGuestsFromSearchParam,
  RECOMMENDED_STAYS_CATALOG_FILTERS,
  venueMatchesCatalogQuery,
} from "./filterVenues"

function venue(partial: Partial<Venue> & Pick<Venue, "id" | "name">): Venue {
  return {
    description: "d",
    media: [],
    price: 99,
    maxGuests: 4,
    ...partial,
  }
}

const noFilters = { topRated: false, amenities: [] as const }

describe("clampSearchGuests", () => {
  it("clamps to defaults and max", () => {
    expect(clampSearchGuests(NaN)).toBe(DEFAULT_SEARCH_GUESTS)
    expect(clampSearchGuests(0)).toBe(1)
    expect(clampSearchGuests(200)).toBe(MAX_SEARCH_GUESTS)
  })
})

describe("parseGuestsFromSearchParam", () => {
  it("returns null for empty or invalid values", () => {
    expect(parseGuestsFromSearchParam(null)).toBeNull()
    expect(parseGuestsFromSearchParam("")).toBeNull()
    expect(parseGuestsFromSearchParam("x")).toBeNull()
  })

  it("parses and clamps integers", () => {
    expect(parseGuestsFromSearchParam("3")).toBe(3)
    expect(parseGuestsFromSearchParam("99")).toBe(MAX_SEARCH_GUESTS)
  })
})

describe("filterVenues", () => {
  const list: Venue[] = [
    venue({
      id: "1",
      name: "Premium",
      maxGuests: 4,
      rating: 5,
      meta: { wifi: true, breakfast: true, parking: false, pets: false },
    }),
    venue({
      id: "2",
      name: "Cheap",
      maxGuests: 6,
      rating: 3,
      meta: { wifi: false, breakfast: false, parking: true, pets: true },
    }),
  ]

  it("returns all when no filters", () => {
    expect(filterVenues(list, noFilters)).toHaveLength(2)
  })

  it("filters top rated", () => {
    expect(
      filterVenues(list, { topRated: true, amenities: [] }).map((v) => v.id),
    ).toEqual(["1"])
  })

  it("filters a single amenity", () => {
    expect(
      filterVenues(list, { topRated: false, amenities: ["wifi"] }).map(
        (v) => v.id,
      ),
    ).toEqual(["1"])
  })

  it("combines multiple amenity filters (AND)", () => {
    const both: Venue[] = [
      venue({
        id: "a",
        name: "A",
        meta: { wifi: true, breakfast: true, parking: false, pets: false },
      }),
      venue({
        id: "b",
        name: "B",
        meta: { wifi: true, breakfast: false, parking: false, pets: false },
      }),
    ]
    expect(
      filterVenues(both, {
        topRated: false,
        amenities: ["wifi", "breakfast"],
      }).map((v) => v.id),
    ).toEqual(["a"])
  })

  it("filters min guests", () => {
    expect(filterVenues(list, noFilters, 5).map((v) => v.id)).toEqual(["2"])
  })

  it("combines top rated with amenities", () => {
    const mixed: Venue[] = [
      venue({ id: "a", name: "A", rating: 5, meta: { wifi: true } }),
      venue({ id: "b", name: "B", rating: 5, meta: { wifi: false } }),
      venue({ id: "c", name: "C", rating: 3, meta: { wifi: true } }),
    ]
    expect(
      filterVenues(mixed, { topRated: true, amenities: ["wifi"] }).map(
        (v) => v.id,
      ),
    ).toEqual(["a"])
  })

  it("applies recommended stays defaults (4.5+, wifi, parking)", () => {
    const mixed: Venue[] = [
      venue({
        id: "match",
        name: "Match",
        rating: 4.6,
        meta: { wifi: true, parking: true },
      }),
      venue({
        id: "low-rating",
        name: "Low",
        rating: 4.4,
        meta: { wifi: true, parking: true },
      }),
      venue({
        id: "no-parking",
        name: "No parking",
        rating: 5,
        meta: { wifi: true, parking: false },
      }),
    ]
    expect(
      filterVenues(mixed, RECOMMENDED_STAYS_CATALOG_FILTERS).map((v) => v.id),
    ).toEqual(["match"])
  })
})

describe("venueMatchesCatalogQuery", () => {
  it("matches substring in name", () => {
    expect(
      venueMatchesCatalogQuery(venue({ id: "1", name: "Cabin Oslo" }), "oslo"),
    ).toBe(true)
    expect(
      venueMatchesCatalogQuery(
        venue({ id: "1", name: "Cabin Oslo" }),
        "Bergen",
      ),
    ).toBe(false)
  })

  it("matches location fields", () => {
    const v = venue({
      id: "1",
      name: "Lake house",
      description: "Quiet",
      location: { city: "Bergen", country: "Norway" },
    })
    expect(venueMatchesCatalogQuery(v, "norway")).toBe(true)
    expect(venueMatchesCatalogQuery(v, "bergen")).toBe(true)
  })
})
