import { useQuery } from "@tanstack/react-query"
import { Link, useParams } from "react-router-dom"
import { Alert } from "../components/Alert"
import { fetchVenue } from "../lib/api"
import { useDocumentTitle } from "../lib/useDocumentTitle"

export function VenueDetailPage() {
  const { id } = useParams<{ id: string }>()

  const venueQuery = useQuery({
    queryKey: ["venue", id],
    queryFn: () => fetchVenue(id!, { owner: true }),
    enabled: Boolean(id),
  })

  useDocumentTitle(id ? (venueQuery.data?.name ?? "Venue") : "Venue")

  if (!id) {
    return <Alert tone="error">Missing venue.</Alert>
  }

  if (venueQuery.isPending) {
    return (
      <p role="status" aria-live="polite" className="text-brand-800">
        Loading venue...
      </p>
    )
  }

  if (venueQuery.error || !venueQuery.data) {
    return (
      <Alert tone="error">
        {(venueQuery.error as Error)?.message ?? "Venue not found."}{" "}
        <Link to="/venues" className="ml-1 font-semibold underline">
          Back to venues
        </Link>
      </Alert>
    )
  }

  const venue = venueQuery.data

  return (
    <article className="font-manrope mx-auto max-w-3xl space-y-8 px-4 pb-16 text-stone-700 md:px-0">
      <p className="text-sm font-semibold text-mobile-primary">
        <Link to="/venues" className="hover:underline">
          ← Back to all stays
        </Link>
      </p>

      <header>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-brand-950 md:text-4xl">
          {venue.name}
        </h1>
      </header>

      <section aria-labelledby="venue-about">
        <h2 id="venue-about" className="text-xl font-bold text-mobile-ink">
          About this stay
        </h2>
        <p className="mt-3 leading-relaxed text-on-surface-muted">
          {venue.description?.trim()
            ? venue.description
            : "Description will appear here."}
        </p>
      </section>

      <section aria-labelledby="venue-details">
        <h2 id="venue-details" className="text-xl font-bold text-mobile-ink">
          Details
        </h2>
        <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
          <div className="rounded-2xl border border-stone-200 bg-white px-4 py-3">
            <dt className="text-xs font-semibold uppercase tracking-wide text-on-surface-muted">
              Price per night
            </dt>
            <dd className="mt-1 text-lg font-semibold tabular-nums text-mobile-ink">
              {venue.price}
            </dd>
          </div>
          <div className="rounded-2xl border border-stone-200 bg-white px-4 py-3">
            <dt className="text-xs font-semibold uppercase tracking-wide text-on-surface-muted">
              Max guests
            </dt>
            <dd className="mt-1 text-lg font-semibold text-mobile-ink">
              {venue.maxGuests}
            </dd>
          </div>
        </dl>
      </section>

      <section aria-labelledby="venue-photos">
        <h2 id="venue-photos" className="text-xl font-bold text-mobile-ink">
          Photos
        </h2>
        <p className="mt-3 text-sm text-on-surface-muted" role="status">
          Photo gallery comes in the next venue page task.
        </p>
      </section>

      <section aria-labelledby="venue-booking">
        <h2 id="venue-booking" className="text-xl font-bold text-mobile-ink">
          Dates &amp; booking
        </h2>
        <p className="mt-3 text-sm text-on-surface-muted">
          Calendar and booking will be added in a later task.
        </p>
      </section>
    </article>
  )
}
