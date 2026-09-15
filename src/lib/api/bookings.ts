import type { ApiResponse, Booking, Venue } from "../types"
import { holidazeFetch } from "./client"
import { fetchVenue } from "./venues"

// Host dashboard — venue bookings with guest names. GET is public; token kept for a consistent manager API surface.
export async function fetchVenueBookingsForManager(
  _token: string,
  venueId: string,
): Promise<Venue> {
  return fetchVenue(venueId, { bookings: true, customer: true, owner: true })
}

export async function createBooking(
  token: string,
  body: { dateFrom: string; dateTo: string; guests: number; venueId: string },
): Promise<Booking> {
  const json = await holidazeFetch<ApiResponse<Booking>>("/holidaze/bookings", {
    method: "POST",
    token,
    endSessionOn401: false,
    body: JSON.stringify(body),
  })
  return json.data
}

// Manager or customer: remove a booking when the API allows it
export async function deleteBooking(
  token: string,
  bookingId: string,
): Promise<void> {
  await holidazeFetch<void>(
    `/holidaze/bookings/${encodeURIComponent(bookingId)}`,
    {
      method: "DELETE",
      token,
      endSessionOn401: false,
    },
  )
}
