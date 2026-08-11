import { useQuery } from "@tanstack/react-query"
import { useMemo } from "react"
import { Link, useLocation } from "react-router-dom"
import { Alert } from "../../components/Alert"
import { useAuth } from "../../context/AuthContext"
import * as api from "../../lib/api"
import { sortVenuesNewestFirst } from "../../lib/venueCatalogSort"
import { useDocumentTitle } from "../../lib/useDocumentTitle"

export function ManagerVenuesPage() {
  const { user } = useAuth()
  const location = useLocation()
  const createdVenueId =
    (location.state as { createdVenueId?: string } | null)?.createdVenueId ??
    undefined

  const q = useQuery({
    queryKey: ["manager-venues", user?.name],
    queryFn: () => api.fetchProfileVenues(user!.accessToken, user!.name),
    enabled: Boolean(user?.venueManager),
  })
  const venues = useMemo(() => sortVenuesNewestFirst(q.data ?? []), [q.data])
  const isRefreshingAfterCreate =
    Boolean(createdVenueId) && q.isFetching && venues.length === 0

  useDocumentTitle("Host dashboard")
  if (!user?.venueManager) return null

  // Allow success banner through while the list refetches after create
  if (q.isPending && !createdVenueId) {
    return (
      <p role="status" aria-live="polite" className="text-brand-800">
        Loading your venues...
      </p>
    )
  }
  if (q.error) {
    return <Alert tone="error">{(q.error as Error).message}</Alert>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl font-semibold text-brand-950">
          Host dashboard
        </h1>
        <Link
          to="/manager/venues/new"
          className="rounded-full bg-brand-800 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-900/20 transition hover:bg-brand-950"
        >
          New venue
        </Link>
      </div>

      {createdVenueId ? (
        <Alert tone="success">
          <strong>Venue created.</strong> It should appear in the list below.{" "}
          <Link
            to={`/manager/venues/${createdVenueId}/edit`}
            className="font-semibold underline"
          >
            Edit this venue
          </Link>
          .
        </Alert>
      ) : null}

      {isRefreshingAfterCreate ? (
        <p role="status" aria-live="polite">
          Refreshing your venues...
        </p>
      ) : null}

      {!isRefreshingAfterCreate && venues.length === 0 ? (
        <p className="text-brand-800/80">
          You have no venues yet.{" "}
          <Link
            to="/manager/venues/new"
            className="font-medium text-brand-600 underline"
          >
            Create one
          </Link>
        </p>
      ) : venues.length > 0 ? (
        <ul className="space-y-4">
          {venues.map((v) => (
            <li
              key={v.id}
              className="shadow-elevate rounded-2xl border border-stone-200/90 bg-white p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="font-semibold text-brand-950">{v.name}</h2>
                  <p className="text-sm text-brand-800/80">
                    {v.price}/night · up to {v.maxGuests} guests
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link
                    to={`/manager/venues/${v.id}/bookings`}
                    className="rounded-lg border border-brand-200 px-3 py-2 text-sm font-medium text-brand-800 hover:bg-brand-50"
                  >
                    Bookings
                  </Link>
                  <Link
                    to={`/manager/venues/${v.id}/edit`}
                    className="rounded-lg bg-brand-100 px-3 py-2 text-sm font-medium text-brand-900 hover:bg-brand-100/80"
                  >
                    Edit
                  </Link>
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
