import { describe, expect, it } from "vitest"
import type { Venue } from "./types"
import {
  catalogSortFromSearchParam,
  catalogSortToSearchParam,
  noroffCatalogSortQuery,
  sortVenuesByCatalogMode,
  sortVenuesByPriceAsc,
  sortVenuesByRatingDesc,
  sortVenuesNewestFirst,
} from "./venueCatalogSort"

function v(partial: Partial<Venue> & Pick<Venue, "id" | "name">): Venue {
  return {
    description: "d",
    media: [],
    price: 1,
    maxGuests: 2,
    ...partial,
  }
}

describe("catalogSortFromSearchParam", () => {
  it("maps URL values", () => {
    expect(catalogSortFromSearchParam(null)).toBe("default")
    expect(catalogSortFromSearchParam("")).toBe("default")
    expect(catalogSortFromSearchParam("newest")).toBe("newest")
    expect(catalogSortFromSearchParam("price-asc")).toBe("price-asc")
    expect(catalogSortFromSearchParam("rating-desc")).toBe("rating-desc")
    expect(catalogSortFromSearchParam("unknown")).toBe("default")
  })
})

describe("catalogSortToSearchParam", () => {
  it("omits default", () => {
    expect(catalogSortToSearchParam("default")).toBeNull()
    expect(catalogSortToSearchParam("price-asc")).toBe("price-asc")
  })
})

describe("noroffCatalogSortQuery", () => {
  it("returns Noroff params for non-default modes", () => {
    expect(noroffCatalogSortQuery("default")).toBeUndefined()
    expect(noroffCatalogSortQuery("newest")).toEqual({
      sort: "created",
      sortOrder: "desc",
    })
    expect(noroffCatalogSortQuery("price-asc")).toEqual({
      sort: "price",
      sortOrder: "asc",
    })
    expect(noroffCatalogSortQuery("rating-desc")).toEqual({
      sort: "rating",
      sortOrder: "desc",
    })
  })
})

describe("sortVenuesNewestFirst", () => {
  it("orders by updated then created", () => {
    const list = [
      v({ id: "a", name: "Old", created: "2020-01-01T00:00:00.000Z" }),
      v({
        id: "b",
        name: "Mid",
        created: "2024-06-01T00:00:00.000Z",
        updated: "2024-06-02T00:00:00.000Z",
      }),
      v({ id: "c", name: "New", created: "2025-01-01T00:00:00.000Z" }),
    ]
    expect(sortVenuesNewestFirst(list).map((x) => x.id)).toEqual([
      "c",
      "b",
      "a",
    ])
  })
})

describe("sortVenuesByPriceAsc", () => {
  it("orders by ascending price", () => {
    const list = [
      v({ id: "a", name: "A", price: 200 }),
      v({ id: "b", name: "B", price: 50 }),
      v({ id: "c", name: "C", price: 100 }),
    ]
    expect(sortVenuesByPriceAsc(list).map((x) => x.id)).toEqual(["b", "c", "a"])
  })
})

describe("sortVenuesByRatingDesc", () => {
  it("orders by descending rating", () => {
    const list = [
      v({ id: "a", name: "A", rating: 3 }),
      v({ id: "b", name: "B", rating: 5 }),
      v({ id: "c", name: "C" }),
    ]
    expect(sortVenuesByRatingDesc(list).map((x) => x.id)).toEqual([
      "b",
      "a",
      "c",
    ])
  })
})

describe("sortVenuesByCatalogMode", () => {
  it("delegates to the matching sorter", () => {
    const list = [
      v({ id: "a", name: "A", price: 200 }),
      v({ id: "b", name: "B", price: 50 }),
    ]
    expect(sortVenuesByCatalogMode(list, "default").map((x) => x.id)).toEqual([
      "a",
      "b",
    ])
    expect(sortVenuesByCatalogMode(list, "price-asc").map((x) => x.id)).toEqual(
      ["b", "a"],
    )
  })
})
