import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useState,
  type FormEvent,
} from "react"
import { createPortal } from "react-dom"
import { Link, useLocation } from "react-router-dom"
import { Alert } from "../components/Alert"
import { CuratedVenueCard } from "../components/CuratedVenueCard"
import {
  IconCalendar,
  IconHeart,
  IconLuggage,
  IconPin,
  IconSearch,
} from "../components/Icons"
import { useMobileHomeSearchChrome } from "../components/mobileHomeSearchChrome"
import { VenueCatalogFilterPills } from "../components/VenueCatalogFilterPills"
import { VenueCatalogSortSelect } from "../components/VenueCatalogSortSelect"
import { hostProfileHref } from "../lib/hostProfilePath"
import { useDocumentTitle } from "../lib/useDocumentTitle"
import type { Venue } from "../lib/types"
import { useVenueCatalog } from "../lib/useVenueCatalog"

function MobileHomeSearchFormInHeader({
  heroSearchInput,
  onHeroSearch,
  onHeroSearchInputChange,
}: {
  heroSearchInput: string
  onHeroSearch: (e: FormEvent) => void
  onHeroSearchInputChange: (value: string) => void
}) {
  const searchFieldId = "hero-search-mobile-header"
  const hintId = `${searchFieldId}-hint`

  return (
    <div className="relative isolate w-full min-w-0 group">
      <div className="pointer-events-none absolute inset-0 rounded-full bg-mobile-primary/5 opacity-0 blur-xl transition-opacity group-focus-within:opacity-100" />
      <form
        onSubmit={onHeroSearch}
        className="relative flex w-full min-w-0 min-h-8 items-center gap-1.5 rounded-full border border-white/55 bg-mobile-surface/92 px-2 py-1 shadow-sm shadow-stone-900/8 ring-1 ring-stone-900/6 backdrop-blur-xl transition-colors"
        role="search"
      >
        <IconSearch
          className="size-4 shrink-0 text-mobile-primary"
          aria-hidden
        />
        <label htmlFor={searchFieldId} className="sr-only">
          Search venues
        </label>
        <input
          id={searchFieldId}
          type="search"
          value={heroSearchInput}
          onChange={(e) => onHeroSearchInputChange(e.target.value)}
          placeholder="Place, guests, pets..."
          className="min-w-0 flex-1 border-none bg-transparent py-0.5 text-[13px] font-medium leading-tight text-mobile-ink outline-none ring-0 placeholder:text-on-surface-muted/65 focus:ring-0"
          aria-describedby={hintId}
        />
        <span id={hintId} className="sr-only">
          Add a place or keywords, a guest count, and pets if you need
          pet-friendly stays. Submit to update the list below.
        </span>
        <button
          type="submit"
          className="flex size-7 shrink-0 items-center justify-center rounded-full bg-mobile-primary text-white transition-transform active:scale-95"
          aria-label="Search"
        >
          <IconSearch className="size-[15px] text-white" aria-hidden />
        </button>
      </form>
    </div>
  )
}

function MobileFeaturedVenue({
  venue,
  favorited,
  onToggleFav,
}: {
  venue: Venue
  favorited: boolean
  onToggleFav: (id: string) => void
}) {
  const img = venue.media?.[0]
  const loc = [venue.location?.city, venue.location?.country]
    .filter(Boolean)
    .join(", ")
  const rating = venue.rating ?? null

  return (
    <div className="relative space-y-4">
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[24px] shadow-sm">
        <Link
          to={`/venues/${venue.id}`}
          className="block h-full w-full bg-stone-100"
        >
          {img ? (
            <img
              src={img.url}
              alt={img.alt ?? venue.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-on-surface-muted">
              No photo
            </div>
          )}
        </Link>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault()
            onToggleFav(venue.id)
          }}
          className="absolute right-6 top-6 rounded-full bg-white/20 p-3 text-white backdrop-blur-xl transition-transform active:scale-75"
          aria-label={favorited ? "Remove from favorites" : "Save to favorites"}
        >
          <IconHeart
            filled={favorited}
            className={favorited ? "size-6 text-red-400" : "size-6 text-white"}
          />
        </button>
      </div>
      <div className="flex items-start justify-between gap-3 px-2">
        <div>
          <Link
            to={`/venues/${venue.id}`}
            className="text-2xl font-extrabold tracking-tight text-mobile-ink"
          >
            {venue.name}
          </Link>
          {loc ? (
            <p className="mt-1 flex items-center gap-1 font-medium text-on-surface-muted">
              <IconPin className="size-4 shrink-0" />
              {loc}
            </p>
          ) : null}
          {venue.owner?.name?.trim() ? (
            <p className="mt-1 text-sm font-medium text-on-surface-muted">
              Hosted by{" "}
              <Link
                to={hostProfileHref(venue.owner.name)}
                className="font-semibold text-mobile-primary underline-offset-4 hover:text-mobile-ink hover:underline"
              >
                {venue.owner.name.trim()}
              </Link>
            </p>
          ) : null}
        </div>
        <div className="text-right">
          <p className="text-xl font-black text-mobile-primary">
            {venue.price}
            <span className="text-xs font-medium text-on-surface-muted">
              /night
            </span>
          </p>
          {rating != null ? (
            <div className="mt-1 flex items-center justify-end gap-1">
              <span className="text-badge-star-text">★</span>
              <span className="text-xs font-bold text-mobile-ink">
                {rating.toFixed(1)}
              </span>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}

export function HomePage() {
  useDocumentTitle(undefined)
  const location = useLocation()
  const {
    searchInput: heroSearchInput,
    setSearchInput: setHeroSearchInput,
    q,
    navViewSaved,
    requirePetsFilter,
    catalogSort,
    filterTopRated,
    toggleTopRated,
    amenityFilters,
    toggleAmenityFilter,
    guestCount: heroGuests,
    favorites,
    toggleFavorite,
    gridVenues,
    loading,
    error,
    canLoadMore,
    isFetchingNextPage,
    fetchNextPage,
    noResultsDueToGuestCap,
    noResultsDueToPetsFilter,
    hasActiveSearch,
    setCatalogSort,
    applySearchFromInput,
    clearSearch,
  } = useVenueCatalog({ recommendedStaysDefaults: true })
  const HOME_PAGE_SIZE = 8
  const [visibleCount, setVisibleCount] = useState(HOME_PAGE_SIZE)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reset the 8-card window when search or filters change
    setVisibleCount(HOME_PAGE_SIZE)
  }, [q, catalogSort, filterTopRated, amenityFilters, heroGuests, navViewSaved])

  useEffect(() => {
    if (loading || isFetchingNextPage) return
    if (gridVenues.length >= visibleCount) return
    if (!canLoadMore) return
    fetchNextPage()
    // fetchNextPage is recreated each render; refill until we have 8 matches
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    loading,
    isFetchingNextPage,
    gridVenues.length,
    visibleCount,
    canLoadMore,
  ])

  const visibleVenues = gridVenues.slice(0, visibleCount)
  const hasMoreLocal = visibleCount < gridVenues.length
  const showLoadMore = (hasMoreLocal || canLoadMore) && !navViewSaved

  function onLoadMore() {
    const next = visibleCount + HOME_PAGE_SIZE
    setVisibleCount(next)
    if (next > gridVenues.length && canLoadMore) {
      fetchNextPage()
    }
  }

  const mobileSearchChrome = useMobileHomeSearchChrome()
  const searchExpanded = mobileSearchChrome?.searchExpanded ?? false
  const [mobileSearchMountEl, setMobileSearchMountEl] =
    useState<HTMLElement | null>(null)

  const scrollToVenues = useCallback(() => {
    const run = () => {
      const mobile = document.querySelector("[data-mobile-venues]")
      if (window.matchMedia("(max-width: 767px)").matches && mobile) {
        mobile.scrollIntoView({ behavior: "smooth" })
        return
      }
      document.getElementById("venues")?.scrollIntoView({ behavior: "smooth" })
    }
    window.requestAnimationFrame(run)
  }, [])

  useLayoutEffect(() => {
    if (!searchExpanded) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- clear portal host when search collapses
      setMobileSearchMountEl(null)
      return
    }
    const syncMount = () => {
      setMobileSearchMountEl(
        document.getElementById("kvile-mobile-home-search-mount"),
      )
    }
    // Mobile search portals into `#kvile-mobile-home-search-mount` when the header panel opens.
    syncMount()
    const frame = window.requestAnimationFrame(syncMount)
    return () => window.cancelAnimationFrame(frame)
  }, [searchExpanded])

  useEffect(() => {
    if (location.pathname !== "/" || location.hash !== "#about") return
    const t = window.setTimeout(() => {
      document
        .getElementById("about")
        ?.scrollIntoView({ behavior: "smooth", block: "start" })
    }, 50)
    return () => window.clearTimeout(t)
  }, [location.pathname, location.hash])

  useEffect(() => {
    if (!navViewSaved) return
    const t = window.setTimeout(() => scrollToVenues(), 150)
    return () => window.clearTimeout(t)
  }, [navViewSaved, scrollToVenues])

  function onHeroSearch(e: FormEvent) {
    e.preventDefault()
    applySearchFromInput(heroSearchInput, {
      afterApply: () => {
        scrollToVenues()
        mobileSearchChrome?.setSearchExpanded(false)
      },
    })
  }

  return (
    <>
      {mobileSearchMountEl
        ? createPortal(
            <MobileHomeSearchFormInHeader
              heroSearchInput={heroSearchInput}
              onHeroSearch={onHeroSearch}
              onHeroSearchInputChange={setHeroSearchInput}
            />,
            mobileSearchMountEl,
          )
        : null}
      <div className="hidden bg-mobile-surface font-manrope text-mobile-ink md:block">
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
            <h1 className="mb-16 text-balance font-marketing-display text-5xl font-semibold leading-[1.12] tracking-normal antialiased text-mobile-ink sm:text-6xl md:mb-20 md:text-7xl md:leading-[1.1] md:tracking-tight lg:text-8xl">
              Find Your Place
              <br />
              of Peace
            </h1>

            <form
              onSubmit={onHeroSearch}
              className="mx-auto flex max-w-3xl flex-col gap-3 rounded-full border border-white/50 bg-mobile-surface/85 p-3 shadow-2xl shadow-stone-900/10 ring-1 ring-stone-900/5 backdrop-blur-xl sm:flex-row sm:items-stretch"
              role="search"
            >
              <div className="flex min-h-[52px] flex-1 items-center gap-3 px-4 py-3 sm:px-6">
                <IconSearch
                  className="size-6 shrink-0 text-mobile-primary"
                  aria-hidden
                />
                <div className="min-w-0 flex-1 text-left">
                  <label
                    htmlFor="hero-search"
                    className="text-[10px] font-bold uppercase tracking-wider text-on-surface-muted"
                  >
                    Search
                  </label>
                  <input
                    id="hero-search"
                    type="search"
                    value={heroSearchInput}
                    onChange={(e) => setHeroSearchInput(e.target.value)}
                    placeholder="Place, vibe, guests (e.g. 4 guests), pets..."
                    className="mt-0.5 w-full border-0 bg-transparent p-0 text-sm font-medium text-mobile-ink outline-none ring-0 placeholder:text-on-surface-muted/70 focus:ring-0"
                    aria-describedby="hero-search-hint"
                  />
                  <span id="hero-search-hint" className="sr-only">
                    Combine place or keywords with guest count and the word pets
                    to filter pet-friendly stays. Dates are chosen when you open
                    a venue.
                  </span>
                </div>
              </div>
              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-full bg-mobile-primary px-8 py-4 text-sm font-bold text-white shadow-lg shadow-mobile-primary/25 transition hover:bg-holidaze-blue-hover sm:w-auto sm:shrink-0 sm:self-center sm:px-10"
              >
                <IconSearch className="size-5 text-white" aria-hidden />
                Search
              </button>
            </form>
          </div>
        </section>

        <section
          id="venues"
          className="scroll-mt-36 bg-surface-sheet py-16 md:py-24"
        >
          <div className="mx-auto max-w-screen-2xl px-4 md:px-12">
            <div className="mb-16 flex flex-col items-end justify-between gap-6 md:flex-row">
              <div>
                <span className="mb-2 block text-sm font-bold uppercase tracking-[0.3em] text-accent-warm">
                  Recommendations
                </span>
                <h2 className="text-4xl font-bold tracking-tight text-mobile-ink md:text-5xl">
                  Recommended stays
                </h2>
                <p className="mt-2 max-w-lg text-sm text-on-surface-muted">
                  {q
                    ? `Results for "${q}".`
                    : "Rated 4.5 and above with WiFi and parking, hand-picked from our catalogue."}{" "}
                  Refine with the tags below.
                  {heroGuests > 0 ? (
                    <>
                      {" "}
                      Showing stays that can host at least{" "}
                      <strong>{heroGuests}</strong> guest
                      {heroGuests === 1 ? "" : "s"}.
                    </>
                  ) : null}
                  {requirePetsFilter ? (
                    <>
                      {" "}
                      Only listings that allow <strong>pets</strong>.
                    </>
                  ) : null}
                </p>
              </div>
              <div className="flex flex-col items-end gap-4 sm:flex-row sm:flex-wrap sm:items-center">
                <VenueCatalogFilterPills
                  filterTopRated={filterTopRated}
                  onToggleTopRated={toggleTopRated}
                  amenityFilters={amenityFilters}
                  onToggleAmenity={toggleAmenityFilter}
                />
                <VenueCatalogSortSelect
                  id="home-catalog-sort-desktop"
                  value={catalogSort}
                  onChange={setCatalogSort}
                />
                {hasActiveSearch ? (
                  <button
                    type="button"
                    onClick={() => clearSearch("home")}
                    className="rounded-full px-4 py-2 text-sm font-semibold text-mobile-primary underline-offset-4 hover:underline"
                  >
                    Clear search
                  </button>
                ) : null}
              </div>
            </div>

            {loading ? (
              <p
                className="mt-12 rounded-3xl border border-dashed border-stone-300 bg-white/70 py-16 text-center text-holidaze-muted"
                role="status"
                aria-live="polite"
              >
                Loading stays...
              </p>
            ) : error ? (
              <Alert tone="error" className="mt-12">
                {(error as Error).message}
              </Alert>
            ) : gridVenues.length === 0 ? (
              <p className="mt-12 rounded-3xl border border-stone-200 bg-white py-16 text-center text-holidaze-muted">
                {navViewSaved
                  ? "No saved stays yet. Tap the heart on a venue to collect it here."
                  : noResultsDueToPetsFilter
                    ? 'No pet-friendly venues match these tags and guest count. Try removing "pets" from your search or fewer guests.'
                    : noResultsDueToGuestCap
                      ? `No venues here can host ${heroGuests} guests. Try fewer guests or relax the filters above.`
                      : "No venues match these filters. Try turning off a tag or searching another destination."}
              </p>
            ) : (
              <>
                <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
                  {visibleVenues.map((v) => (
                    <CuratedVenueCard
                      key={v.id}
                      venue={v}
                      favorited={Boolean(favorites[v.id])}
                      onToggleFav={toggleFavorite}
                    />
                  ))}
                </div>
                {showLoadMore ? (
                  <div className="mt-10 flex justify-center">
                    <button
                      type="button"
                      disabled={isFetchingNextPage}
                      onClick={onLoadMore}
                      className="rounded-full border border-stone-300 bg-white px-8 py-3 text-sm font-semibold text-holidaze-ink shadow-sm transition hover:bg-stone-50 disabled:opacity-50"
                    >
                      {isFetchingNextPage ? "Loading..." : "Load more"}
                    </button>
                  </div>
                ) : null}
              </>
            )}
          </div>
        </section>
      </div>

      {/* Mobile home: full-width hero. object-bottom trims the photo from the top (desktop focal point unchanged). */}
      <div className="bg-mobile-surface font-manrope text-mobile-ink md:hidden">
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
            <div className="text-center">
              <h1 className="text-balance font-marketing-display text-5xl font-semibold leading-[1.12] tracking-normal antialiased text-mobile-ink sm:text-6xl">
                Find Your Place
                <br />
                of Peace
              </h1>
            </div>
          </div>
        </section>

        <section
          data-mobile-venues
          className="mt-12 scroll-mt-32 space-y-6 px-6 pb-8"
        >
          <h3 className="text-xl font-bold tracking-tight text-mobile-ink">
            {navViewSaved ? "Saved stays" : "Recommended stays"}
          </h3>
          {!navViewSaved ? (
            <div className="space-y-3">
              <VenueCatalogFilterPills
                variant="compact"
                filterTopRated={filterTopRated}
                onToggleTopRated={toggleTopRated}
                amenityFilters={amenityFilters}
                onToggleAmenity={toggleAmenityFilter}
              />
              <VenueCatalogSortSelect
                id="home-catalog-sort-mobile"
                value={catalogSort}
                className="w-full"
                onChange={setCatalogSort}
              />
            </div>
          ) : null}
          {loading ? (
            <p
              className="rounded-2xl border border-dashed border-stone-300 py-16 text-center text-on-surface-muted"
              role="status"
              aria-live="polite"
            >
              Loading stays...
            </p>
          ) : error ? (
            <Alert tone="error">{(error as Error).message}</Alert>
          ) : gridVenues.length === 0 ? (
            <p className="rounded-2xl border border-stone-200 bg-white/80 py-16 text-center text-on-surface-muted">
              {navViewSaved
                ? "No saved stays yet. Tap the heart on a listing."
                : noResultsDueToPetsFilter
                  ? 'No pet-friendly venues match these tags and guest count. Try removing "pets" from your search or fewer guests.'
                  : noResultsDueToGuestCap
                    ? `No venues here can host ${heroGuests} guests. Try fewer guests or relax the filters above.`
                    : "No venues match these filters."}
            </p>
          ) : (
            <>
              <div className="space-y-12">
                {visibleVenues.map((v) => (
                  <MobileFeaturedVenue
                    key={v.id}
                    venue={v}
                    favorited={Boolean(favorites[v.id])}
                    onToggleFav={toggleFavorite}
                  />
                ))}
              </div>
              {showLoadMore ? (
                <div className="mt-8 flex justify-center">
                  <button
                    type="button"
                    disabled={isFetchingNextPage}
                    onClick={onLoadMore}
                    className="rounded-full border border-stone-300 bg-white px-8 py-3 text-sm font-semibold shadow-sm disabled:opacity-50"
                  >
                    {isFetchingNextPage ? "Loading..." : "Load more"}
                  </button>
                </div>
              ) : null}
            </>
          )}
        </section>
      </div>

      {/* One #about target for all viewports (hash links must not point inside display:none parents) */}
      <section
        id="about"
        className="scroll-mt-28 border-t border-stone-200/80 bg-gradient-to-b from-stone-50/90 to-cream px-6 py-12 md:scroll-mt-36 md:py-20"
      >
        <div className="mx-auto max-w-3xl text-center md:px-6">
          <h2 className="font-manrope text-xl font-extrabold text-mobile-ink md:text-3xl">
            About Kvile
          </h2>
          <p className="mt-4 text-pretty font-manrope text-sm leading-relaxed text-on-surface-muted md:text-base">
            <strong>Kvile</strong> is a Norwegian word for <strong>rest</strong>
            , <strong>quiet</strong>, or <strong>repose</strong> (pronounced
            roughly &ldquo;<span lang="nb">KVee-leh</span>&rdquo;), the pause
            you earn after the journey. Search unique stays, check real
            availability, then sign in to book a trip or list a venue of your
            own.
          </p>
          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-6">
            <div className="rounded-2xl border border-stone-200/80 bg-white/80 px-5 py-4 shadow-sm">
              <div className="mx-auto flex size-11 items-center justify-center rounded-full bg-brand-100 text-mobile-primary">
                <IconSearch className="size-5" />
              </div>
              <h3 className="mt-3 font-manrope text-sm font-bold text-mobile-ink">
                Find your stay
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-on-surface-muted">
                Search by place, mood, or filters and see real prices per night
                up front.
              </p>
            </div>
            <div className="rounded-2xl border border-stone-200/80 bg-white/80 px-5 py-4 shadow-sm">
              <div className="mx-auto flex size-11 items-center justify-center rounded-full bg-brand-100 text-mobile-primary">
                <IconCalendar className="size-5" />
              </div>
              <h3 className="mt-3 font-manrope text-sm font-bold text-mobile-ink">
                Pick your dates
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-on-surface-muted">
                Check availability on the calendar. Booked nights stay visible
                so you can plan with confidence.
              </p>
            </div>
            <div className="rounded-2xl border border-stone-200/80 bg-white/80 px-5 py-4 shadow-sm">
              <div className="mx-auto flex size-11 items-center justify-center rounded-full bg-brand-100 text-mobile-primary">
                <IconLuggage className="size-5" />
              </div>
              <h3 className="mt-3 font-manrope text-sm font-bold text-mobile-ink">
                Manage trips
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-on-surface-muted">
                Log in to view Trips, update your profile, or host venues from
                one account.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
