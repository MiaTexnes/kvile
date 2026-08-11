import {
  endOfDay,
  isBefore,
  isWithinInterval,
  max,
  min,
  parseISO,
  startOfDay,
  startOfToday,
} from "date-fns"
import type { Booking } from "./types"

// Inclusive end date (local TZ) — same rule as README
export function isDateBlocked(
  day: Date,
  bookings: Pick<Booking, "dateFrom" | "dateTo">[],
): boolean {
  const d = startOfDay(day)
  return bookings.some((b) => {
    const from = startOfDay(parseISO(b.dateFrom))
    const to = endOfDay(parseISO(b.dateTo))
    return isWithinInterval(d, { start: min([from, to]), end: max([from, to]) })
  })
}

// Red "booked" days from today; past nights stay grey via disabled
export function isUnavailableBookedNight(
  day: Date,
  bookings: Pick<Booking, "dateFrom" | "dateTo">[],
): boolean {
  if (isBefore(startOfDay(day), startOfToday())) return false
  return isDateBlocked(day, bookings)
}

export function rangeOverlapsBooking(
  from: Date,
  to: Date,
  bookings: Pick<Booking, "dateFrom" | "dateTo">[],
): boolean {
  const rangeStart = startOfDay(from)
  const rangeEnd = endOfDay(to)
  if (isBefore(rangeEnd, rangeStart)) return true
  return bookings.some((b) => {
    const bf = startOfDay(parseISO(b.dateFrom))
    const bt = endOfDay(parseISO(b.dateTo))
    const blockStart = min([bf, bt])
    const blockEnd = max([bf, bt])
    return rangeStart <= blockEnd && rangeEnd >= blockStart
  })
}
