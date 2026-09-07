import { parseISO, startOfToday } from "date-fns"
import type { Booking } from "./types"

// Same rule as Task 29: check-in today or later, local calendar day
export function isUpcomingBooking(
  b: Pick<Booking, "dateFrom">,
  today = startOfToday(),
): boolean {
  return parseISO(b.dateFrom) >= today
}

export function isPastBooking(
  b: Pick<Booking, "dateFrom">,
  today = startOfToday(),
): boolean {
  return !isUpcomingBooking(b, today)
}

export function splitProfileBookings(
  bookings: Booking[],
  today = startOfToday(),
): { upcoming: Booking[]; past: Booking[] } {
  const upcoming = bookings
    .filter((b) => isUpcomingBooking(b, today))
    .sort((a, b) => a.dateFrom.localeCompare(b.dateFrom))
  // Newest check-in first so old stays read as history, not a queue
  const past = bookings
    .filter((b) => isPastBooking(b, today))
    .sort((a, b) => b.dateFrom.localeCompare(a.dateFrom))
  return { upcoming, past }
}
