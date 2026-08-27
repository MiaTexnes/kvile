import { describe, expect, it } from "vitest"
import type { Booking } from "./types"
import { isManagersOwnBookingBlock } from "./managerVenueBooking"

function booking(
  partial: Partial<Booking> &
    Pick<Booking, "id" | "dateFrom" | "dateTo" | "guests">,
): Booking {
  return {
    ...partial,
  }
}

describe("isManagersOwnBookingBlock", () => {
  it("returns true when customer email matches manager (case-insensitive)", () => {
    expect(
      isManagersOwnBookingBlock(
        booking({
          id: "1",
          dateFrom: "",
          dateTo: "",
          guests: 1,
          customer: { name: "Me", email: "Host@stud.noroff.no" },
        }),
        "host@stud.noroff.no",
      ),
    ).toBe(true)
  })

  it("returns false when customer is another user", () => {
    expect(
      isManagersOwnBookingBlock(
        booking({
          id: "1",
          dateFrom: "",
          dateTo: "",
          guests: 2,
          customer: { name: "Guest", email: "g@stud.noroff.no" },
        }),
        "host@stud.noroff.no",
      ),
    ).toBe(false)
  })
})
