import { describe, expect, it } from "vitest"
import { buildVenueUpsertBody } from "./managerVenueBody"

const base = {
  name: " Cabin ",
  description: " Quiet ",
  price: 199.999,
  maxGuests: 2.9,
  imageUrl: "",
  wifi: true,
  parking: false,
  breakfast: false,
  pets: true,
}

describe("buildVenueUpsertBody", () => {
  it("omits location when address, city, and country are blank", () => {
    const body = buildVenueUpsertBody({
      ...base,
      address: "  ",
      city: "",
      country: undefined,
    })
    expect(body).not.toHaveProperty("location")
  })

  it("includes location when any field is set (blank fields become null)", () => {
    const body = buildVenueUpsertBody({
      ...base,
      city: " Bergen ",
      address: "",
      country: "  ",
    })
    expect(body.location).toEqual({
      address: null,
      city: "Bergen",
      country: null,
    })
  })

  it("rounds price to 2 decimals and floors maxGuests to at least 1", () => {
    const body = buildVenueUpsertBody({ ...base, price: 10.006, maxGuests: 0 })
    expect(body.price).toBe(10.01)
    expect(body.maxGuests).toBe(1)
  })

  it("omits media and rating when image is blank and rating is missing/zero", () => {
    const body = buildVenueUpsertBody({
      ...base,
      imageUrl: "   ",
      rating: 0,
    })
    expect(body).not.toHaveProperty("media")
    expect(body).not.toHaveProperty("rating")
  })

  it("includes media and rating when image URL and positive rating are set", () => {
    const body = buildVenueUpsertBody({
      ...base,
      imageUrl: " https://example.com/a.jpg ",
      rating: 4.5,
    })
    expect(body.media).toEqual([
      { url: "https://example.com/a.jpg", alt: "Cabin" },
    ])
    expect(body.rating).toBe(4.5)
  })
})
