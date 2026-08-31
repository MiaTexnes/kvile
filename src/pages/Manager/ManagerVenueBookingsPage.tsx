import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  compareDesc,
  endOfDay,
  format,
  formatISO,
  parseISO,
  startOfDay,
  startOfToday,
} from "date-fns"
import { useMemo, useState } from "react"
import { DayPicker, type DateRange } from "react-day-picker"
import { useForm } from "react-hook-form"
import { Link, useParams } from "react-router-dom"
import { z } from "zod"
import { Alert } from "../../components/Alert"
import { CalendarBookedLegend } from "../../components/CalendarBookedLegend"
import { IconCalendar } from "../../components/Icons"
import { useAuth } from "../../context/AuthContext"
import * as api from "../../lib/api"
import {
  isDateBlocked,
  isUnavailableBookedNight,
  rangeOverlapsBooking,
} from "../../lib/availability"
import { isManagersOwnBookingBlock } from "../../lib/managerVenueBooking"
import { useDocumentTitle } from "../../lib/useDocumentTitle"
import type { Booking } from "../../lib/types"

const blockFormSchema = z.object({
  acknowledge: z.boolean().refine((v) => v === true, {
    message: "Confirm to block the selected dates.",
  }),
})

type BlockForm = z.infer<typeof blockFormSchema>

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
  const queryClient = useQueryClient()
  const [blockRange, setBlockRange] = useState<DateRange | undefined>(undefined)

  const blockForm = useForm<BlockForm>({
    resolver: zodResolver(blockFormSchema),
    defaultValues: { acknowledge: false },
  })
  const blockErrors = blockForm.formState.errors

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

  // Same red nights as the guest calendar
  const blockDisabledDays = useMemo(
    () => (day: Date) => isDateBlocked(day, bookings),
    [bookings],
  )
  const bookedNightModifiers = useMemo(
    () => ({
      bookedUnavailable: (day: Date) => isUnavailableBookedNight(day, bookings),
    }),
    [bookings],
  )

  const hasBlockRange = Boolean(blockRange?.from && blockRange?.to)
  const blockRangeOverlaps =
    hasBlockRange &&
    rangeOverlapsBooking(blockRange!.from!, blockRange!.to!, bookings)

  const blockMutation = useMutation({
    mutationFn: async () => {
      if (!user?.accessToken || !id) throw new Error("Not signed in.")
      if (!blockRange?.from || !blockRange.to) {
        throw new Error("Select a start and end date.")
      }
      if (rangeOverlapsBooking(blockRange.from, blockRange.to, bookings)) {
        throw new Error("Those dates overlap an existing booking or block.")
      }
      return api.createBooking(user.accessToken, {
        venueId: id,
        dateFrom: formatISO(startOfDay(blockRange.from)),
        dateTo: formatISO(endOfDay(blockRange.to)),
        guests: 1,
      })
    },
    onSuccess: () => {
      setBlockRange(undefined)
      blockForm.reset({ acknowledge: false })
      void queryClient.invalidateQueries({ queryKey: ["venue", id] })
    },
    onError: (e: Error) => {
      blockForm.setError("root", { message: e.message })
    },
  })

  const deleteBookingMutation = useMutation({
    mutationFn: async (bookingId: string) => {
      if (!user?.accessToken) throw new Error("Not signed in.")
      await api.deleteBooking(user.accessToken, bookingId)
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["venue", id] })
    },
  })

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
  const managerEmailsForHolds = [user?.profileEmail, user?.email]
    .map((e) => e?.trim())
    .filter((e): e is string => Boolean(e))

  return (
    <div className="space-y-10">
      {/* venue header — Task 38 */}
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

      {/* Block dates section — Task 39 */}
      <section
        aria-labelledby="block-dates-heading"
        className="shadow-elevate space-y-5 rounded-2xl border border-stone-200/90 bg-white p-5 sm:p-6"
      >
        <div>
          <h2
            id="block-dates-heading"
            className="flex items-center gap-2 font-display text-2xl font-semibold text-brand-950"
          >
            <IconCalendar className="size-6 shrink-0 text-brand-700" />
            Block dates
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-brand-800/85">
            Hold nights for maintenance or personal use. This creates a booking
            on your own venue with 1 guest — there is no separate Holidaze block
            API. Those nights then show as unavailable on the public calendar.
          </p>
        </div>

        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
          <div className="flex flex-col gap-4">
            <DayPicker
              mode="range"
              selected={blockRange}
              onSelect={setBlockRange}
              disabled={[{ before: startOfToday() }, blockDisabledDays]}
              modifiers={bookedNightModifiers}
              modifiersClassNames={{
                bookedUnavailable: "holidaze-day-booked",
              }}
              aria-label="Choose dates to block"
            />
            <CalendarBookedLegend audience="manager" className="max-w-xl" />
          </div>

          <form
            onSubmit={blockForm.handleSubmit(() => {
              blockForm.clearErrors("root")
              blockMutation.mutate()
            })}
            className="flex-1 space-y-4 rounded-2xl border border-dashed border-stone-200 bg-stone-50/50 p-5"
            noValidate
          >
            <h3 className="text-xs font-semibold uppercase tracking-wide text-brand-700">
              Selected block
            </h3>
            {blockRange?.from ? (
              <p className="text-sm text-brand-800">
                <span className="font-semibold">From:</span>{" "}
                {format(blockRange.from, "PPP")}
              </p>
            ) : (
              <p className="text-sm text-brand-800/70">
                Choose a start date on the calendar.
              </p>
            )}
            {blockRange?.to ? (
              <p className="text-sm text-brand-800">
                <span className="font-semibold">To:</span>{" "}
                {format(blockRange.to, "PPP")}
              </p>
            ) : blockRange?.from ? (
              <p className="text-sm text-brand-800/70">
                Choose an end date to complete the range.
              </p>
            ) : null}

            {blockRangeOverlaps ? (
              <Alert tone="warning">
                Those dates overlap an existing booking or block.
              </Alert>
            ) : null}

            <div className="flex items-start gap-3">
              <input
                id="block-acknowledge"
                type="checkbox"
                className="mt-0.5 size-4 rounded border-brand-300"
                {...blockForm.register("acknowledge")}
                aria-invalid={Boolean(blockErrors.acknowledge) || undefined}
                aria-describedby={
                  blockErrors.acknowledge
                    ? "block-acknowledge-error"
                    : "block-acknowledge-hint"
                }
              />
              <div>
                <label
                  htmlFor="block-acknowledge"
                  className="text-sm font-medium text-brand-900"
                >
                  Block these dates for guest bookings
                </label>
                <p
                  id="block-acknowledge-hint"
                  className="mt-1 text-xs text-brand-700/70"
                >
                  I understand this will book these nights as a host hold (1
                  guest) so customers cannot reserve them.
                </p>
                {blockErrors.acknowledge ? (
                  <p
                    id="block-acknowledge-error"
                    className="mt-2 text-sm text-red-700"
                    role="alert"
                  >
                    {blockErrors.acknowledge.message}
                  </p>
                ) : null}
              </div>
            </div>

            <button
              type="submit"
              disabled={
                !hasBlockRange || blockRangeOverlaps || blockMutation.isPending
              }
              aria-disabled={
                !hasBlockRange || blockRangeOverlaps || blockMutation.isPending
              }
              className="w-full rounded-full bg-brand-800 py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand-900/15 transition hover:bg-brand-950 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {blockMutation.isPending ? "Saving block..." : "Save block"}
            </button>

            {blockErrors.root ? (
              <Alert tone="error">{blockErrors.root.message}</Alert>
            ) : null}
          </form>
        </div>
      </section>

      {/* booking list with isOwnHold / Remove block — Task 39 */}
      {deleteBookingMutation.error ? (
        <Alert tone="error">
          {(deleteBookingMutation.error as Error).message}
        </Alert>
      ) : null}

      {sortedBookings.length === 0 ? (
        <p className="text-brand-800/80">No bookings yet for this venue.</p>
      ) : (
        <ul className="space-y-4">
          {sortedBookings.map((b) => {
            const avatarUrl = b.customer?.avatar?.url
            const custName = b.customer?.name ?? "Guest"
            // Hold = this manager's own booking, not a paying guest
            const isOwnHold = managerEmailsForHolds.some((em) =>
              isManagersOwnBookingBlock(b, em),
            )
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
                  {isOwnHold ? (
                    <p className="text-sm font-medium text-brand-800">
                      Blocked dates (hold)
                    </p>
                  ) : (
                    <p className="text-sm text-brand-800/80">
                      Stay · {b.guests} guest{b.guests === 1 ? "" : "s"}
                    </p>
                  )}
                  {b.created ? (
                    <p className="mt-1 text-xs text-brand-700/90">
                      <span className="sr-only">Reservation placed </span>
                      Reserved on{" "}
                      <time dateTime={b.created}>
                        {format(parseISO(b.created), "PPp")}
                      </time>
                    </p>
                  ) : null}
                  {!isOwnHold && b.customer ? (
                    <p className="mt-2 text-sm text-brand-800">
                      Guest: <strong>{b.customer.name}</strong>
                      {b.customer.email ? ` (${b.customer.email})` : null}
                    </p>
                  ) : null}
                  {isOwnHold ? (
                    <button
                      type="button"
                      className="mt-3 rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-medium text-red-800 outline-none ring-red-500/25 hover:bg-red-50 focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={deleteBookingMutation.isPending}
                      onClick={() => deleteBookingMutation.mutate(b.id)}
                    >
                      {deleteBookingMutation.isPending &&
                      deleteBookingMutation.variables === b.id
                        ? "Removing..."
                        : "Remove block"}
                    </button>
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
