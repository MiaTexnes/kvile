import { describe, expect, it } from "vitest"
import { DEFAULT_SEARCH_GUESTS } from "./filterVenues"
import {
  formatVenueSearchQueryForDisplay,
  parseVenueSearchQuery,
} from "./parseVenueSearchQuery"

describe("parseVenueSearchQuery", () => {
  it("returns empty query for blank input", () => {
    expect(parseVenueSearchQuery("   ")).toEqual({
      textQuery: "",
      guests: null,
      requirePets: false,
    })
  })

  it("keeps plain place text", () => {
    expect(parseVenueSearchQuery("Oslo")).toEqual({
      textQuery: "Oslo",
      guests: null,
      requirePets: false,
    })
  })

  it("detects pets keywords and strips them from q", () => {
    expect(parseVenueSearchQuery("pet friendly cabin")).toEqual({
      textQuery: "friendly cabin",
      guests: null,
      requirePets: true,
    })
    expect(parseVenueSearchQuery("bergen, pets")).toEqual({
      textQuery: "bergen",
      guests: null,
      requirePets: true,
    })
  })

  it("parses guest counts in common phrases", () => {
    expect(parseVenueSearchQuery("2 person, oslo")).toEqual({
      textQuery: "oslo",
      guests: 2,
      requirePets: false,
    })
    expect(parseVenueSearchQuery("for 4 people, cabin")).toEqual({
      textQuery: "cabin",
      guests: 4,
      requirePets: false,
    })
    expect(parseVenueSearchQuery("6 guests trondheim")).toEqual({
      textQuery: "trondheim",
      guests: 6,
      requirePets: false,
    })
  })

  it("combines guests, pets, and place", () => {
    expect(parseVenueSearchQuery("2 person, pets, oslo")).toEqual({
      textQuery: "oslo",
      guests: 2,
      requirePets: true,
    })
  })
})

describe("formatVenueSearchQueryForDisplay", () => {
  it("joins non-default parts with commas", () => {
    expect(
      formatVenueSearchQueryForDisplay("", DEFAULT_SEARCH_GUESTS, false),
    ).toBe("")
    expect(
      formatVenueSearchQueryForDisplay("oslo", DEFAULT_SEARCH_GUESTS, false),
    ).toBe("oslo")
    expect(formatVenueSearchQueryForDisplay("oslo", 5, true)).toBe(
      "oslo, 5 guests, pets",
    )
  })
})
