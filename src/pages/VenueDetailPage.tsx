import { format } from "date-fns"
import { useEffect, useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { DayPicker, type DateRange } from "react-day-picker"
import { Link, useParams } from "react-router-dom"
import { Alert } from "../components/Alert"
import { CalendarBookedLegend } from "../components/CalendarBookedLegend"
import { fetchVenue } from "../lib/api"
import {
  isDateBlocked,
  isUnavailableBookedNight,
  rangeOverlapsBooking,
} from "../lib/availability"
import { hostProfileHref } from "../lib/hostProfilePath"
import type { Booking, Venue } from "../lib/types"
import { useDocumentTitle } from "../lib/useDocumentTitle"
import { startOfToday } from "date-fns"

function VenuePhotoFallback({ label }: { label: string }) {
  return (
    <div
      className="flex h-full min-h-[12rem] items-center justify-center bg-gradient-to-br from-brand-100 to-brand-200 px-6 text-center font-medium text-brand-800/80"
      role="img"
      aria-label={label}
    >
      No image available
    </div>
  )
}

function VenueDetailBody({ venue }: { venue: Venue }) {
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [brokenImageUrl, setBrokenImageUrl] = useState<string | null>(null)
  const [range, setRange] = useState<DateRange | undefined>(undefined)
  const [dateWarning, setDateWarning] = useState<string | null>(null)
  const [showTwoMonths, setShowTwoMonths] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(min-width: 900px)").matches,
  )

  useEffect(() => {
    const mql = window.matchMedia("(min-width: 900px)")
    const handleChange = (event: MediaQueryListEvent) =>
      setShowTwoMonths(event.matches)
    mql.addEventListener("change", handleChange)
    return () => mql.removeEventListener("change", handleChange)
  }, [])

  const bookings: Booking[] = useMemo(
    () => venue.bookings ?? [],
    [venue.bookings],
  )

  const disabledDays = useMemo(
    () => (day: Date) => isDateBlocked(day, bookings),
    [bookings],
  )

  const bookedNightModifiers = useMemo(
    () => ({
      bookedUnavailable: (day: Date) => isUnavailableBookedNight(day, bookings),
    }),
    [bookings],
  )

  function handleRangeSelect(next: DateRange | undefined) {
    setRange(next)
    if (
      next?.from &&
      next?.to &&
      rangeOverlapsBooking(next.from, next.to, bookings)
    ) {
      setDateWarning("Those dates overlap an existing booking.")
    } else {
      setDateWarning(null)
    }
  }

  const images = venue.media ?? []
  const safeImageIndex = images.length
    ? Math.min(activeImageIndex, images.length - 1)
    : 0
  const activeImg = images[safeImageIndex]
  const showMainImage = activeImg && activeImg.url !== brokenImageUrl

  const description = venue.description?.trim()
  const locParts = [
    venue.location?.address,
    venue.location?.city,
    venue.location?.country,
  ].filter(Boolean)
  const locationLine = locParts.join(", ")

  const hasCompleteRange = Boolean(range?.from && range?.to)

  return (
    <div className="font-manrope mx-auto max-w-5xl space-y-10 px-4 pb-16 text-stone-700 md:px-0">
      <div className="overflow-hidden rounded-[2rem] border border-stone-200/90 bg-white shadow-sm">
        <div className="grid gap-0 lg:grid-cols-2">
          <div className="flex flex-col bg-brand-100 lg:min-h-[380px]">
            <div className="aspect-[4/3] w-full lg:aspect-auto lg:min-h-[280px] lg:flex-1">
              {showMainImage ? (
                <img
                  src={activeImg.url}
                  alt={activeImg.alt?.trim() || venue.name}
                  className="h-full w-full object-cover"
                  onError={() => setBrokenImageUrl(activeImg.url)}
                />
              ) : (
                <VenuePhotoFallback
                  label={
                    activeImg && activeImg.url === brokenImageUrl
                      ? `Photo for ${venue.name} could not be loaded`
                      : `No photo for ${venue.name}`
                  }
                />
              )}
            </div>
            {images.length > 1 ? (
              <ul
                className="flex gap-2 overflow-x-auto bg-white/85 p-3"
                aria-label={`Venue photos, ${images.length} images`}
              >
                {images.map((media, index) => {
                  const isActive = index === safeImageIndex
                  return (
                    <li key={`${media.url}-${index}`} className="shrink-0">
                      <button
                        type="button"
                        onClick={() => setActiveImageIndex(index)}
                        aria-label={`Show photo ${index + 1} of ${images.length}`}
                        aria-current={isActive ? "true" : undefined}
                        className={`h-16 w-20 overflow-hidden rounded-lg border-2 transition ${
                          isActive
                            ? "border-mobile-primary ring-2 ring-mobile-primary/30"
                            : "border-transparent opacity-80 hover:opacity-100"
                        }`}
                      >
                        <img
                          src={media.url}
                          alt=""
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      </button>
                    </li>
                  )
                })}
              </ul>
            ) : null}
          </div>

          <div className="flex flex-col gap-5 p-6 lg:p-10">
            <div>
              <p className="text-sm font-semibold text-mobile-primary">
                <Link to="/venues" className="hover:underline">
                  ← Back to all stays
                </Link>
              </p>
              <h1 className="font-display mt-3 text-3xl font-semibold tracking-tight text-brand-950 md:text-4xl">
                {venue.name}
              </h1>
              <p className="mt-4 text-base leading-relaxed text-on-surface-muted">
                {description || "No description provided for this stay."}
              </p>
            </div>

            <dl className="grid grid-cols-2 gap-3 text-sm md:max-w-md">
              <div className="rounded-2xl border border-stone-200 bg-white px-4 py-3">
                <dt className="text-xs font-semibold uppercase tracking-wide text-on-surface-muted">
                  Price
                </dt>
                <dd className="mt-1 text-lg font-semibold tabular-nums text-mobile-ink">
                  {venue.price}
                  <span className="text-sm font-medium text-on-surface-muted">
                    {" "}
                    / night
                  </span>
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
              {venue.rating != null ? (
                <div className="rounded-2xl border border-stone-200 bg-white px-4 py-3">
                  <dt className="text-xs font-semibold uppercase tracking-wide text-on-surface-muted">
                    Rating
                  </dt>
                  <dd className="mt-1 text-lg font-semibold tabular-nums text-mobile-ink">
                    {venue.rating}
                  </dd>
                </div>
              ) : null}
            </dl>

            {venue.meta ? (
              <ul className="flex flex-wrap gap-2 text-xs font-semibold text-mobile-ink">
                {venue.meta.wifi ? (
                  <li className="rounded-full bg-brand-100 px-3 py-1.5">
                    Wi‑Fi
                  </li>
                ) : null}
                {venue.meta.parking ? (
                  <li className="rounded-full bg-brand-100 px-3 py-1.5">
                    Parking
                  </li>
                ) : null}
                {venue.meta.breakfast ? (
                  <li className="rounded-full bg-brand-100 px-3 py-1.5">
                    Breakfast
                  </li>
                ) : null}
                {venue.meta.pets ? (
                  <li className="rounded-full bg-brand-100 px-3 py-1.5">
                    Pets allowed
                  </li>
                ) : null}
              </ul>
            ) : null}

            {locationLine ? (
              <p className="text-sm font-medium text-on-surface-muted">
                <span className="font-semibold text-mobile-ink">
                  Location ·{" "}
                </span>
                {locationLine}
              </p>
            ) : null}

            {venue.owner ? (
              <div className="space-y-3 rounded-2xl border border-stone-200 bg-stone-50/80 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-on-surface-muted">
                  Host
                </p>
                <dl className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <dt className="text-xs font-medium text-on-surface-muted">
                      Name
                    </dt>
                    <dd className="mt-1 font-medium text-mobile-ink">
                      <Link
                        to={hostProfileHref(venue.owner.name)}
                        className="text-mobile-primary underline-offset-4 hover:underline"
                      >
                        {venue.owner.name}
                      </Link>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-on-surface-muted">
                      Email
                    </dt>
                    <dd className="mt-1 break-all">
                      <a
                        href={`mailto:${venue.owner.email}`}
                        className="font-medium text-mobile-primary underline-offset-4 hover:underline"
                      >
                        {venue.owner.email}
                      </a>
                    </dd>
                  </div>
                </dl>
              </div>
            ) : (
              <p className="rounded-2xl border border-dashed border-stone-200 bg-stone-50/50 px-4 py-3 text-sm text-on-surface-muted">
                Host contact details aren&apos;t available for this listing.
              </p>
            )}
          </div>
        </div>
      </div>

      <section
        aria-labelledby="venue-booking"
        className="rounded-[2rem] border border-stone-200/90 bg-white p-6 shadow-sm lg:p-10"
      >
        <h2
          id="venue-booking"
          className="font-display text-2xl font-semibold text-brand-950"
        >
          Pick your dates
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-on-surface-muted">
          Nights that clash with existing bookings cannot be chosen. Use the{" "}
          <span className="font-medium text-mobile-ink">Explanation</span> below
          the calendar. Dates shaded{" "}
          <strong className="font-medium text-red-900">
            a light red highlight
          </strong>{" "}
          are unavailable because someone already reserved that stay from
          check-in through check-out (<strong>inclusive</strong>). All dates use
          your browser&apos;s local timezone.
        </p>

        <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-start">
          <div className="flex flex-col gap-4">
            <DayPicker
              mode="range"
              numberOfMonths={showTwoMonths ? 2 : 1}
              selected={range}
              onSelect={handleRangeSelect}
              disabled={[{ before: startOfToday() }, disabledDays]}
              modifiers={bookedNightModifiers}
              modifiersClassNames={{
                bookedUnavailable: "holidaze-day-booked",
              }}
              aria-label="Choose check-in and check-out dates"
            />
            <CalendarBookedLegend audience="guest" className="max-w-xl" />
          </div>

          <div
            className="flex-1 space-y-4 rounded-2xl border border-dashed border-stone-200 bg-stone-50/50 p-5 md:p-6"
            aria-live="polite"
          >
            <h3 className="text-xs font-semibold uppercase tracking-wide text-on-surface-muted">
              Selected stay
            </h3>
            {range?.from ? (
              <p className="text-sm text-mobile-ink">
                <span className="font-semibold">Check-in:</span>{" "}
                {format(range.from, "PPP")}
              </p>
            ) : (
              <p className="text-sm text-on-surface-muted">
                Choose a check-in date on the calendar.
              </p>
            )}
            {range?.to ? (
              <p className="text-sm text-mobile-ink">
                <span className="font-semibold">Check-out:</span>{" "}
                {format(range.to, "PPP")}
              </p>
            ) : range?.from ? (
              <p className="text-sm text-on-surface-muted">
                Choose a check-out date to complete your range.
              </p>
            ) : null}
            {hasCompleteRange && !dateWarning ? (
              <p className="text-sm text-mobile-primary" role="status">
                Your selected range does not overlap existing bookings.
              </p>
            ) : null}
            {dateWarning ? <Alert tone="warning">{dateWarning}</Alert> : null}
          </div>
        </div>
      </section>
    </div>
  )
}

export function VenueDetailPage() {
  const { id } = useParams<{ id: string }>()

  const venueQuery = useQuery({
    queryKey: ["venue", id, "bookings"],
    queryFn: () => fetchVenue(id!, { bookings: true, owner: true }),
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

  return <VenueDetailBody key={venueQuery.data.id} venue={venueQuery.data} />
}
