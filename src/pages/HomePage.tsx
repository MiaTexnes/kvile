import { type FormEvent } from "react"
import { Link } from "react-router-dom"
import { Alert } from "../components/Alert"
import { CuratedVenueCard } from "../components/CuratedVenueCard"
import { VenueCatalogFilterPills } from "../components/VenueCatalogFilterPills"
import { VenueCatalogSortSelect } from "../components/VenueCatalogSortSelect"
import { useDocumentTitle } from "../lib/useDocumentTitle"
import { useVenueCatalog } from "../lib/useVenueCatalog"

export function HomePage() {
  useDocumentTitle(undefined)
  const catalog = useVenueCatalog({ recommendedStaysDefaults: true })

  function onHeroSearch(e: FormEvent) {
    e.preventDefault()
    catalog.applySearchFromInput(catalog.searchInput, {
      afterApply: () => {
        document
          .getElementById("venues")
          ?.scrollIntoView({ behavior: "smooth" })
      },
    })
  }

  return (
    <div className="font-manrope text-mobile-ink">
      <section className="border-b border-stone-200 bg-mobile-surface px-4 py-16 md:px-12 md:py-24">
        <div className="mx-auto max-w-screen-2xl">
          <div className="text-center md:text-left">
            <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl">
              Find your place of peace
            </h1>
            <p className="mt-4 max-w-xl text-on-surface-muted md:text-lg">
              Discover venues and book your next stay.
            </p>
          </div>

          <form
            onSubmit={onHeroSearch}
            className="mx-auto mt-10 flex max-w-2xl flex-col gap-3 sm:flex-row sm:items-center md:mx-0"
            role="search"
          >
            <div className="min-w-0 flex-1">
              <label htmlFor="hero-search" className="sr-only">
                Search venues
              </label>
              <input
                id="hero-search"
                type="search"
                value={catalog.searchInput}
                onChange={(e) => catalog.setSearchInput(e.target.value)}
                placeholder="Place, guests, pets..."
                className="min-h-[48px] w-full rounded-full border border-stone-300 bg-white px-5 py-3 text-sm text-mobile-ink outline-none ring-mobile-primary/25 focus:ring-2"
                aria-describedby="hero-search-hint"
              />
              <span id="hero-search-hint" className="sr-only">
                Combine place or keywords with guest count and the word pets for
                pet-friendly stays.
              </span>
            </div>
            <button
              type="submit"
              className="min-h-[48px] shrink-0 rounded-full bg-mobile-primary px-8 py-3 text-sm font-bold text-white transition hover:bg-holidaze-blue-hover"
            >
              Search
            </button>
          </form>

          <a
            href="#venues"
            className="mt-6 inline-flex text-sm font-semibold text-mobile-primary hover:underline"
          >
            Skip to listings
          </a>
        </div>
      </section>

      <section
        id="venues"
        className="scroll-mt-24 bg-surface-sheet py-16 md:py-24"
      >
        <div className="mx-auto max-w-screen-2xl px-4 md:px-12">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
                Recommended stays
              </h2>
              <p className="mt-2 text-sm text-on-surface-muted">
                {catalog.q
                  ? `Results for "${catalog.q}".`
                  : "Rated 4.5+ with WiFi and parking, from our catalogue."}{" "}
                Refine with the tags below.{" "}
                <Link
                  to="/venues"
                  className="font-semibold text-mobile-primary hover:underline"
                >
                  View all venues
                </Link>
                {!catalog.q ? (
                  <>
                    {" "}
                    Showing stays for at least{" "}
                    <strong>{catalog.guestCount}</strong> guest
                    {catalog.guestCount === 1 ? "" : "s"}.
                  </>
                ) : null}
                {catalog.requirePetsFilter ? (
                  <>
                    {" "}
                    Only listings that allow <strong>pets</strong>.
                  </>
                ) : null}
              </p>
            </div>
            <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center">
              <VenueCatalogFilterPills
                variant="compact"
                filterTopRated={catalog.filterTopRated}
                onToggleTopRated={catalog.toggleTopRated}
                amenityFilters={catalog.amenityFilters}
                onToggleAmenity={catalog.toggleAmenityFilter}
              />
              <VenueCatalogSortSelect
                id="home-catalog-sort"
                value={catalog.catalogSort}
                onChange={catalog.setCatalogSort}
              />
              {catalog.hasActiveSearch ? (
                <button
                  type="button"
                  onClick={() => catalog.clearSearch("home")}
                  className="rounded-full px-4 py-2 text-sm font-semibold text-mobile-primary underline-offset-4 hover:underline"
                >
                  Clear search
                </button>
              ) : null}
            </div>
          </div>

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
            <p
              className="mt-12 rounded-3xl border border-stone-200 bg-white py-16 text-center text-stone-500"
              role="status"
              aria-live="polite"
            >
              {catalog.noResultsDueToPetsFilter
                ? 'No pet-friendly venues match these tags and guest count. Try removing "pets" from your search or fewer guests.'
                : catalog.noResultsDueToGuestCap
                  ? `No venues here can host ${catalog.guestCount} guests. Try fewer guests or relax the filters above.`
                  : "No venues match these filters. Try turning off a tag or searching another destination."}
            </p>
          ) : (
            <>
              <div
                className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4"
                aria-live="polite"
                aria-busy={catalog.isFetchingNextPage}
              >
                {catalog.gridVenues.map((v) => (
                  <CuratedVenueCard
                    key={v.id}
                    venue={v}
                    favorited={Boolean(catalog.favorites[v.id])}
                    onToggleFav={catalog.toggleFavorite}
                  />
                ))}
              </div>
              {catalog.canLoadMore ? (
                <div className="mt-10 flex justify-center">
                  <button
                    type="button"
                    disabled={catalog.isFetchingNextPage}
                    onClick={() => catalog.fetchNextPage()}
                    className="rounded-full border border-stone-300 bg-white px-8 py-3 text-sm font-semibold text-holidaze-ink shadow-sm transition hover:bg-stone-50 disabled:opacity-50"
                  >
                    {catalog.isFetchingNextPage ? "Loading..." : "Load more"}
                  </button>
                </div>
              ) : null}
            </>
          )}
        </div>
      </section>
    </div>
  )
}
