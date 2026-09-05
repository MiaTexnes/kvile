import { describe, expect, it } from "vitest"
import type { Booking } from "./types"
import {
  isPastBooking,
  isUpcomingBooking,
  splitProfileBookings,
} from "./profileBookings"

const today = new Date(2026, 8, 5)

function booking(id: string, dateFrom: string, dateTo = dateFrom): Booking {
  return { id, dateFrom, dateTo, guests: 1 }
}

describe("isUpcomingBooking / isPastBooking", () => {
  it("treats check-in today or later as upcoming", () => {
    expect(isUpcomingBooking(booking("a", "2026-09-05"), today)).toBe(true)
    expect(isUpcomingBooking(booking("b", "2026-09-06"), today)).toBe(true)
    expect(isPastBooking(booking("c", "2026-09-04"), today)).toBe(true)
  })

  it("treats check-in before today as past", () => {
    expect(isUpcomingBooking(booking("d", "2026-09-04"), today)).toBe(false)
    expect(isPastBooking(booking("e", "2026-09-05"), today)).toBe(false)
  })
})

describe("splitProfileBookings", () => {
  it("sorts upcoming ascending and past descending by check-in", () => {
    const { upcoming, past } = splitProfileBookings(
      [
        booking("old", "2026-07-01"),
        booking("soon", "2026-10-01"),
        booking("today", "2026-09-05"),
        booking("older", "2025-12-01"),
      ],
      today,
    )
    expect(upcoming.map((b) => b.id)).toEqual(["today", "soon"])
    expect(past.map((b) => b.id)).toEqual(["old", "older"])
  })
})
