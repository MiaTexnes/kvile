import { useQuery } from "@tanstack/react-query"
import { format, parseISO, startOfToday } from "date-fns"
import { Link } from "react-router-dom"
import { Alert } from "../components/Alert"
import { useAuth } from "../context/AuthContext"
import * as api from "../lib/api"
import type { Booking } from "../lib/types"
import { useDocumentTitle } from "../lib/useDocumentTitle"

function isUpcoming(b: Booking) {
  const from = parseISO(b.dateFrom)
  return from >= startOfToday()
}

export function MyBookingsPage() {
  useDocumentTitle("Upcoming trips")
  const { user } = useAuth()
  const q = useQuery({
    queryKey: ["profile-bookings", user?.name],
    queryFn: () => api.fetchProfileBookings(user!.accessToken, user!.name),
    enabled: Boolean(user?.accessToken?.trim()),
  })

  if (!user) return null
  if (q.isPending) {
    return (
      <p role="status" aria-live="polite" className="text-brand-800">
        Loading your bookings...
      </p>
    )
  }
  if (q.error) {
    return <Alert tone="error">{(q.error as Error).message}</Alert>
  }

  const upcoming = (q.data?.data ?? [])
    .filter(isUpcoming)
    .sort((a, b) => a.dateFrom.localeCompare(b.dateFrom))

  return (
    <div className="space-y-8">
      <h1 className="font-display text-3xl font-semibold text-brand-950">
        Upcoming trips
      </h1>
      <p className="text-sm text-brand-800/80">
        Showing bookings where check-in is today or later (local time).
      </p>
      {upcoming.length === 0 ? (
        <p className="text-brand-800/80">
          No upcoming trips.{" "}
          <Link to="/" className="font-medium text-brand-600 underline">
            Browse venues
          </Link>
        </p>
      ) : (
        <ul className="space-y-4">
          {upcoming.map((b) => {
            const venueId = b.venue?.id
            const venueName = b.venue?.name ?? "Venue"
            const fromLabel = format(parseISO(b.dateFrom), "PP")
            const toLabel = format(parseISO(b.dateTo), "PP")

            const cardInner = (
              <>
                <div>
                  <h2 className="font-display text-lg font-semibold text-brand-950">
                    {venueName}
                  </h2>
                  <p className="text-sm text-brand-800/80">
                    {fromLabel} to {toLabel}
                  </p>
                  <p className="text-sm text-brand-800/80">
                    {b.guests} guest(s)
                  </p>
                </div>
                {b.venue?.media?.[0] ? (
                  <img
                    src={b.venue.media[0].url}
                    alt=""
                    className="size-20 shrink-0 rounded-lg object-cover"
                  />
                ) : null}
              </>
            )

            const shellClass =
              "shadow-elevate flex flex-wrap items-start justify-between gap-2 rounded-2xl border border-stone-200/90 bg-white p-5"

            return (
              <li key={b.id}>
                {venueId ? (
                  <Link
                    to={`/venues/${venueId}`}
                    aria-label={`View venue ${venueName}. Check-in ${fromLabel}, check-out ${toLabel}, ${b.guests} guest(s).`}
                    className={`${shellClass} outline-none transition hover:border-brand-400/70 hover:bg-brand-50/40 focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2`}
                  >
                    {cardInner}
                  </Link>
                ) : (
                  <div className={shellClass}>{cardInner}</div>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
