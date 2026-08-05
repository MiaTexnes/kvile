import { useQuery } from "@tanstack/react-query"
import { Link } from "react-router-dom"
import { Alert } from "../components/Alert"
import { fetchVenuesPage } from "../lib/api"
import { useDocumentTitle } from "../lib/useDocumentTitle" // optional if you have it

export function VenuesPage() {
  useDocumentTitle?.("Venues") // or document.title = 'Venues'

  const { data, isPending, error } = useQuery({
    queryKey: ["venues", "list"],
    queryFn: () => fetchVenuesPage(1, 24),
  })

  const venues = data?.data ?? []

  return (
    <div className="mx-auto max-w-screen-2xl px-4 py-8">
      <Link
        to="/"
        className="text-sm font-semibold text-mobile-primary hover:underline"
      >
        ← Home
      </Link>
      <h1 className="mt-4 text-3xl font-bold text-mobile-ink">All venues</h1>

      {isPending ? (
        <p className="mt-8 text-stone-500" role="status" aria-live="polite">
          Loading stays…
        </p>
      ) : error ? (
        <Alert tone="error" className="mt-8">
          {(error as Error).message}
        </Alert>
      ) : venues.length === 0 ? (
        <p className="mt-8 text-stone-500">No venues found.</p>
      ) : (
        <ul className="mt-8 list-disc space-y-2 pl-6">
          {venues.map((venue) => (
            <li key={venue.id}>
              <Link
                to={`/venues/${venue.id}`}
                className="font-medium text-mobile-primary hover:underline"
              >
                {venue.name}
              </Link>
              {venue.location?.city ? ` — ${venue.location.city}` : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
