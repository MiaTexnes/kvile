import { describe, expect, it } from "vitest"
import type { Booking, Venue } from "./types"
import { guestBookingsForVenueCard } from "./hostBookingFeed"

function booking(
  partial: Partial<Booking> & Pick<Booking, "id" | "dateFrom" | "dateTo">,
): Booking {
  return {
    guests: 1,
    ...partial,
  }
}

describe("guestBookingsForVenueCard", () => {
  it("guestBookingsForVenueCard omits manager hold blocks and limits", () => {
    const venue: Venue = {
      id: "v",
      name: "V",
      description: "d",
      media: [],
      price: 1,
      maxGuests: 2,
      bookings: [
        booking({
          id: "hold",
          dateFrom: "2026-08-01",
          dateTo: "2026-08-03",
          created: "2026-05-20T12:00:00.000Z",
          customer: {
            name: "Me",
            email: "host@example.com",
            bio: null,
            avatar: null,
            banner: null,
          },
        }),
        booking({
          id: "g2",
          dateFrom: "2026-06-01",
          dateTo: "2026-06-04",
          created: "2026-05-01T12:00:00.000Z",
          customer: {
            name: "Ann",
            email: "ann@example.com",
            bio: null,
            avatar: null,
            banner: null,
          },
        }),
        booking({
          id: "g1",
          dateFrom: "2026-07-01",
          dateTo: "2026-07-02",
          created: "2026-05-10T12:00:00.000Z",
          customer: {
            name: "Ben",
            email: "ben@example.com",
            bio: null,
            avatar: null,
            banner: null,
          },
        }),
      ],
    }
    const out = guestBookingsForVenueCard(venue, ["host@example.com"], 1)
    expect(out.map((b) => b.id)).toEqual(["g1"])
  })
})
