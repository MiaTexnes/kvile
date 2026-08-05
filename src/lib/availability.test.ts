import { describe, expect, it } from "vitest"
import {
  isDateBlocked,
  isUnavailableBookedNight,
  rangeOverlapsBooking,
} from "./availability"
import type { Booking } from "./types"

function booking(
  dateFrom: string,
  dateTo: string,
): Pick<Booking, "dateFrom" | "dateTo"> {
  return { dateFrom, dateTo }
}

describe("isDateBlocked", () => {
  const bookings = [booking("2024-07-10", "2024-07-12")]

  it("returns true for a day inside an inclusive booking range", () => {
    expect(isDateBlocked(new Date(Date.UTC(2024, 6, 11)), bookings)).toBe(true)
  })

  it("returns true on the first and last day of the booking (inclusive)", () => {
    expect(isDateBlocked(new Date(Date.UTC(2024, 6, 10)), bookings)).toBe(true)
    expect(isDateBlocked(new Date(Date.UTC(2024, 6, 12)), bookings)).toBe(true)
  })

  it("returns false before and after the range", () => {
    expect(isDateBlocked(new Date(Date.UTC(2024, 6, 9)), bookings)).toBe(false)
    expect(isDateBlocked(new Date(Date.UTC(2024, 6, 13)), bookings)).toBe(false)
  })
})

describe("isUnavailableBookedNight", () => {
  it("returns false for nights before today even if inside a historic booking", () => {
    const bookings = [booking("2020-01-01", "2020-01-05")]
    expect(
      isUnavailableBookedNight(new Date(Date.UTC(2020, 0, 2)), bookings),
    ).toBe(false)
  })

  it("returns true for today or future nights inside a booking", () => {
    const y = new Date().getFullYear() + 3
    const from = `${y}-03-10`
    const to = `${y}-03-14`
    const bookings = [booking(from, to)]
    expect(isUnavailableBookedNight(new Date(y, 2, 12), bookings)).toBe(true)
  })
})

describe("rangeOverlapsBooking", () => {
  const bookings = [booking("2024-08-01", "2024-08-05")]

  it("returns false when the guest range is fully before the booking", () => {
    expect(
      rangeOverlapsBooking(
        new Date(Date.UTC(2024, 6, 20)),
        new Date(Date.UTC(2024, 6, 25)),
        bookings,
      ),
    ).toBe(false)
  })

  it("returns false when the guest range is fully after the booking", () => {
    expect(
      rangeOverlapsBooking(
        new Date(Date.UTC(2024, 8, 1)),
        new Date(Date.UTC(2024, 8, 3)),
        bookings,
      ),
    ).toBe(false)
  })

  it("returns true when ranges overlap at the start edge", () => {
    expect(
      rangeOverlapsBooking(
        new Date(Date.UTC(2024, 7, 4)),
        new Date(Date.UTC(2024, 7, 10)),
        bookings,
      ),
    ).toBe(true)
  })

  it("returns true when inverted (end before start) to avoid booking invalid ranges", () => {
    expect(
      rangeOverlapsBooking(
        new Date(Date.UTC(2024, 7, 10)),
        new Date(Date.UTC(2024, 7, 1)),
        bookings,
      ),
    ).toBe(true)
  })
})
