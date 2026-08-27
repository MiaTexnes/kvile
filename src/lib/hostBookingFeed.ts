import { compareDesc, parseISO } from "date-fns"
import { isManagersOwnBookingBlock } from "./managerVenueBooking"
import type { Booking, Venue } from "./types"

// Guest-only bookings for one venue on the host dashboard card (latest first)
// Drops the manager's own block / hold rows
export function guestBookingsForVenueCard(
  venueWithBookings: Venue | undefined,
  managerEmails: string[],
  limit = 6,
): Booking[] {
  const list = venueWithBookings?.bookings ?? []
  if (!list.length) return []
  const rows = list.filter(
    (b) => !managerEmails.some((em) => isManagersOwnBookingBlock(b, em)),
  )
  rows.sort((a, b) => {
    const ta = a.created ?? a.dateFrom
    const tb = b.created ?? b.dateFrom
    try {
      return compareDesc(parseISO(ta), parseISO(tb))
    } catch {
      return 0
    }
  })
  return rows.slice(0, limit)
}
