import { type FormEvent } from "react"
import { Link } from "react-router-dom"
import { Alert } from "../components/Alert"
import { CuratedVenueCard } from "../components/CuratedVenueCard"
import { VenueCatalogFilterPills } from "../components/VenueCatalogFilterPills"
import { VenueCatalogSortSelect } from "../components/VenueCatalogSortSelect"
import { useDocumentTitle } from "../lib/useDocumentTitle"
import { useVenueCatalog } from "../lib/useVenueCatalog"

export function VenuesPage() {
  useDocumentTitle("Venues")
  const catalog = useVenueCatalog()

  function onSearch(e: FormEvent) {
    e.preventDefault()
    catalog.applySearchFromInput(catalog.searchInput, { keepSavedView: true })
  }

  return (
    <div className="min-h-screen pb-16 font-manrope">
      <div className="mx-auto max-w-screen-2xl px-4 pt-8 md:px-12 md:pt-10">
        <div className="shadow-card mb-10 rounded-3xl border border-white/70 bg-white/75 p-6 backdrop-blur-sm md:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <Link
                to="/"
                className="text-sm font-semibold text-mobile-primary hover:underline"
              >
                ← Home
              </Link>
              <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-mobile-ink md:text-4xl">
                {catalog.navViewSaved ? "Saved stays" : "All venues"}
              </h1>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-on-surface-muted md:text-base">
                {catalog.navViewSaved
                  ? "Venues you have saved with the heart icon."
                  : catalog.q
                    ? `Results for "${catalog.q}".`
                    : "Browse the catalogue, search, and refine with filters."}{" "}
                {!catalog.navViewSaved ? (
                  <>
                    Showing stays that can host at least{" "}
                    <strong>{catalog.guestCount}</strong> guest
                    {catalog.guestCount === 1 ? "" : "s"}.
                    {catalog.requirePetsFilter ? (
                      <>
                        {" "}
                        Only listings that allow <strong>pets</strong>.
                      </>
                    ) : null}
                  </>
                ) : null}
              </p>
            </div>
            <form
              onSubmit={onSearch}
              className="flex w-full flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end md:max-w-2xl"
            >
              <div className="flex min-h-[44px] min-w-0 flex-1 flex-col gap-1">
                <label htmlFor="venues-search" className="sr-only">
                  Search venues
                </label>
                <input
                  id="venues-search"
                  type="search"
                  value={catalog.searchInput}
                  onChange={(e) => catalog.setSearchInput(e.target.value)}
                  placeholder="Place, guests, pets..."
                  className="min-h-[44px] w-full rounded-full border border-stone-300 bg-white px-5 py-2.5 text-sm text-mobile-ink outline-none ring-mobile-primary/25 focus:ring-2 sm:min-w-[12rem]"
                  aria-describedby="venues-search-hint"
                />
                <span id="venues-search-hint" className="sr-only">
                  Combine place or keywords with guest count and the word pets
                  for pet-friendly stays.
                </span>
              </div>
              <button
                type="submit"
                className="min-h-[44px] shrink-0 rounded-full bg-mobile-primary px-8 py-2.5 text-sm font-bold text-white transition hover:bg-holidaze-blue-hover"
              >
                Search
              </button>
            </form>
          </div>
        </div>

        <div className="mb-10 flex flex-col items-stretch justify-between gap-4 sm:flex-row sm:flex-wrap sm:items-center">
          <div className="flex flex-wrap items-center gap-3">
            <VenueCatalogSortSelect
              id="venues-catalog-sort"
              value={catalog.catalogSort}
              onChange={catalog.setCatalogSort}
            />
            <VenueCatalogFilterPills
              filterTopRated={catalog.filterTopRated}
              onToggleTopRated={catalog.toggleTopRated}
              amenityFilters={catalog.amenityFilters}
              onToggleAmenity={catalog.toggleAmenityFilter}
            />
            <Link
              to={catalog.savedToggleHref}
              className={`inline-flex items-center rounded-full border px-4 py-2 text-sm font-semibold shadow-sm ${
                catalog.navViewSaved
                  ? "border-mobile-primary bg-brand-50 text-brand-950"
                  : "border-stone-200 bg-white text-mobile-ink hover:bg-stone-50"
              }`}
            >
              {catalog.navViewSaved ? "Show all" : "Saved only"}
            </Link>
            {catalog.hasActiveSearch ? (
              <button
                type="button"
                onClick={() => catalog.clearSearch("venues")}
                className="rounded-full px-4 py-2 text-sm font-semibold text-mobile-primary underline-offset-4 hover:underline"
              >
                Clear search
              </button>
            ) : null}
          </div>
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
          <p
            className="rounded-3xl border border-stone-200 bg-white py-16 text-center text-stone-500"
            role="status"
            aria-live="polite"
          >
            {catalog.navViewSaved
              ? "No saved stays yet. Use the heart on a listing here or on the home page."
              : catalog.noResultsDueToPetsFilter
                ? 'No pet-friendly venues match these filters. Try removing "pets" from your search or fewer guests.'
                : catalog.noResultsDueToGuestCap
                  ? `No venues here can host ${catalog.guestCount} guests. Try fewer guests or relax the filters above.`
                  : "No venues match these filters. Try turning off a tag or searching something else."}
          </p>
        ) : (
          <>
            <div
              className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4"
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
              <div className="mt-12 flex justify-center">
                <button
                  type="button"
                  disabled={catalog.isFetchingNextPage}
                  onClick={() => catalog.fetchNextPage()}
                  className="rounded-full border border-stone-300 bg-white px-8 py-3 text-sm font-semibold text-mobile-ink shadow-sm transition hover:bg-stone-50 disabled:opacity-50"
                >
                  {catalog.isFetchingNextPage ? "Loading..." : "Load more"}
                </button>
              </div>
            ) : null}
          </>
        )}
      </div>
    </div>
  )
}
