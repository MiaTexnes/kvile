import { useQuery } from "@tanstack/react-query"
import { compareDesc, format, parseISO } from "date-fns"
import { useMemo } from "react"
import { Link, useParams } from "react-router-dom"
import { Alert } from "../../components/Alert"
import { useAuth } from "../../context/AuthContext"
import * as api from "../../lib/api"
import { useDocumentTitle } from "../../lib/useDocumentTitle"
import type { Booking } from "../../lib/types"

// Initials when the guest has no avatar URL
function guestInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length >= 2) return (parts[0]![0]! + parts[1]![0]!).toUpperCase()
  if (parts[0]?.length) return parts[0]!.slice(0, 2).toUpperCase()
  return "?"
}

export function ManagerVenueBookingsPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const q = useQuery({
    queryKey: ["venue", id, "manager-bookings"],
    queryFn: () => api.fetchVenueBookingsForManager(user!.accessToken, id!),
    enabled: Boolean(user && id),
  })
  const venue = q.data
  const bookings: Booking[] = useMemo(
    () => venue?.bookings ?? [],
    [venue?.bookings],
  )

  // Newest check-in first; unparseable ISO stays in place
  const sortedBookings = useMemo(
    () =>
      [...bookings].sort((a, b) => {
        try {
          return compareDesc(parseISO(a.dateFrom), parseISO(b.dateFrom))
        } catch {
          return 0
        }
      }),
    [bookings],
  )

  useDocumentTitle(venue?.name ? `Bookings · ${venue.name}` : "Venue bookings")

  if (!id) {
    return <Alert tone="error">Missing venue.</Alert>
  }
  if (q.isPending) {
    return (
      <p role="status" aria-live="polite" className="text-brand-800">
        Loading bookings...
      </p>
    )
  }
  if (q.error || !venue) {
    return (
      <Alert tone="error">
        {(q.error as Error)?.message ?? "Venue not found."}
      </Alert>
    )
  }

  const cover = venue.media?.[0]

  return (
    <div className="space-y-10">
      <div className="shadow-elevate overflow-hidden rounded-2xl border border-stone-200/90 bg-white">
        <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center">
          <div className="aspect-video w-full shrink-0 overflow-hidden rounded-xl bg-brand-100 sm:aspect-square sm:h-28 sm:w-28 sm:max-w-[7rem]">
            {cover ? (
              <img src={cover.url} alt="" className="size-full object-cover" />
            ) : (
              <div className="flex size-full items-center justify-center text-sm font-medium text-brand-700/70">
                No photo
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="font-display text-3xl font-semibold text-brand-950">
              Bookings · {venue.name}
            </h1>
            <p className="mt-1 text-sm text-brand-800/80">
              {bookings.length} booking(s)
            </p>
            <Link
              to={`/manager/venues/${id}/edit`}
              className="mt-3 inline-block text-sm font-medium text-brand-600 underline"
            >
              Edit venue
            </Link>
          </div>
        </div>
      </div>

      {sortedBookings.length === 0 ? (
        <p className="text-brand-800/80">No bookings yet for this venue.</p>
      ) : (
        <ul className="space-y-4">
          {sortedBookings.map((b) => {
            const avatarUrl = b.customer?.avatar?.url
            const custName = b.customer?.name ?? "Guest"
            return (
              <li
                key={b.id}
                className="shadow-elevate flex flex-wrap gap-4 rounded-2xl border border-stone-200/90 bg-white p-4 sm:flex-nowrap sm:items-start"
              >
                <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-xl bg-brand-50">
                  {cover ? (
                    <img
                      src={cover.url}
                      alt=""
                      className="size-full object-cover"
                    />
                  ) : (
                    <div className="flex size-full items-center justify-center text-xs text-brand-700/70">
                      Venue
                    </div>
                  )}
                </div>
                <div className="flex shrink-0 items-start gap-1">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={`${custName} profile photo`}
                      className="size-14 shrink-0 rounded-full object-cover"
                    />
                  ) : (
                    <div
                      className="flex size-14 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-900"
                      aria-hidden
                    >
                      {guestInitials(custName)}
                    </div>
                  )}
                  {!avatarUrl ? (
                    <span className="sr-only">
                      {custName} (no avatar image)
                    </span>
                  ) : null}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-brand-950">
                    <time dateTime={b.dateFrom}>
                      {format(parseISO(b.dateFrom), "PP")}
                    </time>
                    {" · "}
                    <time dateTime={b.dateTo}>
                      {format(parseISO(b.dateTo), "PP")}
                    </time>
                  </p>
                  <p className="text-sm text-brand-800/80">
                    Stay · {b.guests} guest{b.guests === 1 ? "" : "s"}
                  </p>
                  {b.created ? (
                    <p className="mt-1 text-xs text-brand-700/90">
                      <span className="sr-only">Reservation placed </span>
                      Reserved on{" "}
                      <time dateTime={b.created}>
                        {format(parseISO(b.created), "PPp")}
                      </time>
                    </p>
                  ) : null}
                  {b.customer ? (
                    <p className="mt-2 text-sm text-brand-800">
                      Guest: <strong>{b.customer.name}</strong>
                      {b.customer.email ? ` (${b.customer.email})` : null}
                    </p>
                  ) : null}
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
