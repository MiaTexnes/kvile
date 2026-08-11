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
      {/* Desktop hero */}
      <div className="hidden md:block">
        <section className="relative flex h-[min(921px,100svh)] w-full flex-col items-center justify-center pt-24">
          <div className="absolute inset-0 z-0 overflow-hidden">
            <img
              src="/hero-image.png"
              alt=""
              className="h-full w-full object-cover"
            />
            <div
              className="hero-gradient-surface absolute inset-0"
              aria-hidden
            />
          </div>

          <div className="relative z-10 mx-auto max-w-5xl -translate-y-8 px-6 text-center md:-translate-y-10">
            <h1 className="mb-16 text-balance font-marketing-display text-5xl font-semibold tracking-tight text-mobile-ink sm:text-6xl md:text-7xl lg:text-8xl">
              Find Your Place
              <br />
              of Peace
            </h1>

            <form
              onSubmit={onHeroSearch}
              className="mx-auto flex max-w-2xl flex-col gap-3 sm:flex-row sm:items-center"
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
                  Combine place or keywords with guest count and the word pets
                  for pet-friendly stays.
                </span>
              </div>
              <button
                type="submit"
                className="min-h-[48px] shrink-0 rounded-full bg-mobile-primary px-8 py-3 text-sm font-bold text-white transition hover:bg-holidaze-blue-hover"
              >
                Search
              </button>
            </form>
          </div>
        </section>
      </div>

      {/* Mobile hero — search lives in MobileHomeChrome, not here */}
      <div className="md:hidden">
        <section className="relative isolate flex min-h-[min(520px,78svh)] w-full flex-col justify-end overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <img
              src="/hero-image.png"
              alt=""
              className="h-full w-full object-cover object-bottom"
            />
            <div
              className="hero-gradient-surface-mobile absolute inset-0"
              aria-hidden
            />
          </div>

          <div className="relative z-10 w-full px-6 pb-8 pt-[max(1rem,calc(env(safe-area-inset-top)+3.5rem))]">
            <h1 className="text-balance font-marketing-display text-5xl font-semibold tracking-tight text-mobile-ink sm:text-6xl">
              Find Your Place
              <br />
              of Peace
            </h1>
          </div>
        </section>
      </div>

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
