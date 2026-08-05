import { useDocumentTitle } from "../lib/useDocumentTitle"

export function MyBookingsPage() {
  useDocumentTitle("Upcoming trips")

  return (
    <div className="space-y-4">
      <h1 className="font-display text-3xl font-semibold text-brand-950">
        Upcoming trips
      </h1>
      <p className="text-brand-800/80">
        Your bookings will appear here in a later task.
      </p>
    </div>
  )
}
