import { Link } from 'react-router-dom'
import { Alert } from '../components/Alert'
import { CuratedVenueCard } from '../components/CuratedVenueCard'
import { useDocumentTitle } from '../lib/useDocumentTitle'
import { useVenueCatalog } from '../lib/useVenueCatalog'

export function HomePage() {
  useDocumentTitle(undefined)
  const catalog = useVenueCatalog()

  return (
    <div className="font-manrope text-mobile-ink">
      <section className="border-b border-stone-200 bg-mobile-surface px-4 py-16 md:px-12 md:py-24">
        <div className="mx-auto max-w-screen-2xl text-center md:text-left">
          <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl">
            Find your place of peace
          </h1>
          <p className="mt-4 max-w-xl text-on-surface-muted md:text-lg">
            Discover venues and book your next stay.
          </p>
          <a
            href="#venues"
            className="mt-8 inline-flex rounded-full bg-mobile-primary px-8 py-3 text-sm font-bold text-white transition hover:bg-holidaze-blue-hover"
          >
            Browse stays
          </a>
        </div>
      </section>

      <section id="venues" className="scroll-mt-24 bg-surface-sheet py-16 md:py-24">
        <div className="mx-auto max-w-screen-2xl px-4 md:px-12">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Recommended stays</h2>
          <p className="mt-2 text-sm text-on-surface-muted">
            Hand-picked from our catalogue.{' '}
            <Link to="/venues" className="font-semibold text-mobile-primary hover:underline">
              View all venues
            </Link>
          </p>

          {catalog.loading ? (
            <p
              className="mt-12 rounded-3xl border border-dashed border-stone-300 bg-white/70 py-16 text-center text-stone-500"
              role="status"
              aria-live="polite"
            >
              Loading stays...
            </p>
          ) : catalog.error ? (
            <Alert tone="error" className="mt-12">
              {(catalog.error as Error).message}
            </Alert>
          ) : catalog.gridVenues.length === 0 ? (
            <p className="mt-12 rounded-3xl border border-stone-200 bg-white py-16 text-center text-stone-500">
              No venues to show right now.
            </p>
          ) : (
            <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
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
      </section>
    </div>
  )
}