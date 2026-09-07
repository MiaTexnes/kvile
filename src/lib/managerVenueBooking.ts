import type { Booking } from "./types"

// True when the booking customer is the signed-in host (blocked / maintenance dates)
export function isManagersOwnBookingBlock(
  booking: Booking,
  managerEmail: string,
): boolean {
  const host = managerEmail.trim().toLowerCase()
  const cust = booking.customer?.email?.trim().toLowerCase()
  return Boolean(cust && cust === host)
}
