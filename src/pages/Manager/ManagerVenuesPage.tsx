import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { format, parseISO } from "date-fns"
import { useMemo, useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { Alert } from "../../components/Alert"
import { ConfirmDialog } from "../../components/ConfirmDialog"
import { useAuth } from "../../context/AuthContext"
import * as api from "../../lib/api"
import { guestBookingsForVenueCard } from "../../lib/hostBookingFeed"
import {
  truncateText,
  venueAmenityLabels,
  venueLocationLabel,
  venueRatingLabel,
} from "../../lib/managerVenueCard"
import type { Venue } from "../../lib/types"
import { useDocumentTitle } from "../../lib/useDocumentTitle"
import { sortVenuesNewestFirst } from "../../lib/venueCatalogSort"

function HostVenueCard({
  venue: v,
  managerEmails,
  onRequestDelete,
}: {
  venue: Venue
  managerEmails: string[]
  onRequestDelete: (venue: { id: string; name: string }) => void
}) {
  const cover = v.media?.[0]
  const [imageFailed, setImageFailed] = useState(false)
  const showPhoto = Boolean(cover?.url?.trim()) && !imageFailed
  const locationLabel = venueLocationLabel(v.location)
  const amenities = venueAmenityLabels(v.meta)
  const ratingLabel = venueRatingLabel(v.rating)
  const blurb = truncateText(v.description, 140)
  const recentGuestBookings = guestBookingsForVenueCard(v, managerEmails, 6)
  const priceLine = [
    `${v.price}/night`,
    `up to ${v.maxGuests} guests`,
    ratingLabel ? `★ ${ratingLabel}` : null,
  ]
    .filter(Boolean)
    .join(" · ")

  return (
    <li className="shadow-elevate rounded-2xl border border-stone-200/90 bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 gap-4">
          <div className="size-20 shrink-0 overflow-hidden rounded-lg bg-brand-100">
            {showPhoto ? (
              <img
                src={cover!.url}
                alt={cover?.alt?.trim() || v.name}
                className="size-full object-cover"
                onError={() => setImageFailed(true)}
              />
            ) : (
              <div className="flex size-full items-center justify-center text-center text-xs font-medium text-brand-700/70">
                No photo
              </div>
            )}
          </div>
          <div className="min-w-0">
            <h2 className="font-semibold text-brand-950">{v.name}</h2>
            {locationLabel ? (
              <p className="text-sm text-brand-800/80">{locationLabel}</p>
            ) : null}
            <p className="text-sm text-brand-800/80">{priceLine}</p>
            {amenities.length > 0 ? (
              <ul className="mt-2 flex flex-wrap gap-1.5">
                {amenities.map((label) => (
                  <li
                    key={label}
                    className="rounded-full bg-brand-100 px-2.5 py-0.5 text-xs font-medium text-brand-900"
                  >
                    {label}
                  </li>
                ))}
              </ul>
            ) : null}
            {blurb ? (
              <p className="mt-2 text-sm text-brand-800/75">{blurb}</p>
            ) : null}
            <Link
              to={`/venues/${v.id}`}
              className="mt-2 inline-block text-sm font-medium text-brand-600 underline"
            >
              View stay
            </Link>
          </div>
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
          <button
            type="button"
            className="rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-medium text-red-800 outline-none ring-red-500/25 hover:bg-red-50 focus-visible:ring-2"
            aria-label={`Delete venue ${v.name}`}
            onClick={() => onRequestDelete({ id: v.id, name: v.name })}
          >
            Delete
          </button>
        </div>
      </div>
      {recentGuestBookings.length > 0 ? (
        <ul className="mt-4 space-y-1 border-t border-stone-100 pt-3 text-sm text-brand-800/85">
          {recentGuestBookings.map((b) => (
            <li key={b.id}>
              {b.customer?.name ?? "Guest"} ·{" "}
              {format(parseISO(b.dateFrom), "PP")} –{" "}
              {format(parseISO(b.dateTo), "PP")}
            </li>
          ))}
        </ul>
      ) : null}
    </li>
  )
}

export function ManagerVenuesPage() {
  const { user } = useAuth()
  const location = useLocation()
  const queryClient = useQueryClient()
  const createdVenueId =
    (location.state as { createdVenueId?: string } | null)?.createdVenueId ??
    undefined

  // Which venue the confirm dialog targets
  const [pendingDelete, setPendingDelete] = useState<{
    id: string
    name: string
  } | null>(null)

  // Emails used to hide the host's own hold rows on dashboard cards
  const managerEmails = useMemo(
    () =>
      [user?.profileEmail, user?.email]
        .map((s) => s?.trim())
        .filter((e): e is string => Boolean(e)),
    [user?.profileEmail, user?.email],
  )

  const q = useQuery({
    queryKey: ["manager-venues", user?.name],
    queryFn: () => api.fetchProfileVenues(user!.accessToken, user!.name),
    enabled: Boolean(user?.venueManager),
  })
  const venues = useMemo(() => sortVenuesNewestFirst(q.data ?? []), [q.data])
  const isRefreshingAfterCreate =
    Boolean(createdVenueId) && q.isFetching && venues.length === 0

  // DELETE venue after ConfirmDialog confirm
  const deleteMutation = useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      if (!user) throw new Error("Not signed in")
      await api.deleteVenue(user.accessToken, id)
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["manager-venues"] })
      await queryClient.invalidateQueries({ queryKey: ["venues"] })
      await queryClient.invalidateQueries({ queryKey: ["venue"] })
      setPendingDelete(null)
    },
  })

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
        <div className="space-y-1">
          <h1 className="font-display text-3xl font-semibold text-brand-950">
            Your venues
          </h1>
          <p className="max-w-2xl text-sm text-brand-800/85">
            Photos, details, and recent guest bookings for each listing.
          </p>
        </div>
        <Link
          to="/manager/venues/new"
          className="rounded-full bg-brand-800 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-900/20 transition hover:bg-brand-950"
        >
          New venue
        </Link>
      </div>

      <p className="max-w-2xl text-sm text-brand-800/85">
        Each card groups your listing with recent guest reservations (your date
        blocks are omitted here). Use{" "}
        <span className="font-medium text-brand-950">Bookings</span> or the link
        below for the full calendar and blocking.
      </p>

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
            <HostVenueCard
              key={v.id}
              venue={v}
              managerEmails={managerEmails}
              onRequestDelete={(target) => {
                deleteMutation.reset()
                setPendingDelete(target)
              }}
            />
          ))}
        </ul>
      ) : null}

      {/* Accessible delete confirmation */}
      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(next) => {
          if (!next) setPendingDelete(null)
        }}
        title="Delete this venue?"
        description={
          <>
            This permanently removes{" "}
            <strong>{pendingDelete?.name ?? "this listing"}</strong> from Kvile.
            Bookings for this venue may be removed as well. This cannot be
            undone.
          </>
        }
        confirmLabel="Delete permanently"
        confirmVariant="danger"
        onConfirm={() => {
          if (!pendingDelete) return
          deleteMutation.mutate({ id: pendingDelete.id })
        }}
        isConfirming={deleteMutation.isPending}
        errorMessage={
          deleteMutation.error ? (deleteMutation.error as Error).message : null
        }
      />
    </div>
  )
}
