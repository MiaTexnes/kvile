import { Link } from "react-router-dom"
import { Alert } from "../components/Alert"
import { CuratedVenueCard } from "../components/CuratedVenueCard"
import { useDocumentTitle } from "../lib/useDocumentTitle"
import { useVenueCatalog } from "../lib/useVenueCatalog"

export function VenuesPage() {
  useDocumentTitle("Venues")
  const catalog = useVenueCatalog()

  return (
    <div className="min-h-screen pb-16 font-manrope">
      <div className="mx-auto max-w-screen-2xl px-4 pt-8 md:px-12 md:pt-10">
        <div className="mb-10">
          <Link
            to="/"
            className="text-sm font-semibold text-mobile-primary hover:underline"
          >
            ← Home
          </Link>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-mobile-ink md:text-4xl">
            All venues
          </h1>
          <p className="mt-2 max-w-xl text-sm text-on-surface-muted md:text-base">
            Browse stays from the Noroff catalogue.
          </p>
        </div>

        {catalog.loading ? (
          <p
            className="rounded-3xl border border-dashed border-stone-300 bg-white/70 py-16 text-center text-stone-500"
            role="status"
            aria-live="polite"
          >
            Loading stays...
          </p>
        ) : catalog.error ? (
          <Alert tone="error">{(catalog.error as Error).message}</Alert>
        ) : catalog.gridVenues.length === 0 ? (
          <p className="rounded-3xl border border-stone-200 bg-white py-16 text-center text-stone-500">
            No venues to show right now.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {catalog.gridVenues.map((v) => (
              <CuratedVenueCard
                key={v.id}
                venue={v}
                favorited={Boolean(catalog.favorites[v.id])}
                onToggleFav={catalog.toggleFavorite}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
