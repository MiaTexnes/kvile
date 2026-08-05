import { useInfiniteQuery } from "@tanstack/react-query"
import { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "react-router-dom"
import * as api from "./api"
import {
  clampSearchGuests,
  DEFAULT_SEARCH_GUESTS,
  filterVenues,
  parseGuestsFromSearchParam,
  RECOMMENDED_STAYS_CATALOG_FILTERS,
  type VenueAmenityKey,
  type VenueCatalogFilters,
} from "./filterVenues"
import {
  formatVenueSearchQueryForDisplay,
  parseVenueSearchQuery,
} from "./parseVenueSearchQuery"
import type { Venue } from "./types"
import {
  catalogSortFromSearchParam,
  noroffCatalogSortQuery,
  catalogSortToSearchParam,
  sortVenuesByCatalogMode,
  type CatalogSortMode,
} from "./venueCatalogSort"
import { useFavorites } from "./venueFavorites"

type ApplySearchOptions = {
  /** Keep `view=saved` when submitting (venues page). Home search leaves `view` unchanged. */
  keepSavedView?: boolean
  afterApply?: () => void
}

export type UseVenueCatalogOptions = {
  /** Pre-select Top Rated (4.5+) + WiFi + Parking for the home Recommended stays grid. */
  recommendedStaysDefaults?: boolean
}

/**
 * Shared infinite catalogue: URL search params, filters, favourites, and TanStack queries
 * for Home and Venues list pages.
 */
export function useVenueCatalog(options?: UseVenueCatalogOptions) {
  const useRecommendedDefaults = options?.recommendedStaysDefaults === true
  const [searchParams, setSearchParams] = useSearchParams()
  const q = (searchParams.get("q") ?? "").trim()
  const navViewSaved = searchParams.get("view") === "saved"
  const guestsKey = searchParams.get("guests") ?? ""
  const requirePetsFilter = searchParams.get("pets") === "1"
  const catalogSort = catalogSortFromSearchParam(searchParams.get("sort"))
  const listSortOpts = noroffCatalogSortQuery(catalogSort)
  const [searchInput, setSearchInput] = useState("")
  const [filterTopRated, setFilterTopRated] = useState(() => {
    const topRatedParam = searchParams.get("topRated")
    if (topRatedParam === "1") return true
    if (topRatedParam === "0") return false
    return useRecommendedDefaults && RECOMMENDED_STAYS_CATALOG_FILTERS.topRated
  })
  const [amenityFilters, setAmenityFilters] = useState<VenueAmenityKey[]>(() =>
    useRecommendedDefaults
      ? [...RECOMMENDED_STAYS_CATALOG_FILTERS.amenities]
      : [],
  )
  const guestCount =
    parseGuestsFromSearchParam(guestsKey || null) ?? DEFAULT_SEARCH_GUESTS
  const { favorites, toggleFavorite } = useFavorites()

  useEffect(() => {
    const g =
      parseGuestsFromSearchParam(guestsKey || null) ?? DEFAULT_SEARCH_GUESTS
    // eslint-disable-next-line react-hooks/set-state-in-effect -- mirror URL to the field on back/forward or shared links
    setSearchInput(formatVenueSearchQueryForDisplay(q, g, requirePetsFilter))
  }, [q, guestsKey, requirePetsFilter])

  useEffect(() => {
    if (!requirePetsFilter) return
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reflect pets in search URL on the Pets pill
    setAmenityFilters((prev) =>
      prev.includes("pets") ? prev : [...prev, "pets"],
    )
  }, [requirePetsFilter])

  const catalogFilters: VenueCatalogFilters = useMemo(
    () => ({ topRated: filterTopRated, amenities: amenityFilters }),
    [filterTopRated, amenityFilters],
  )

  useEffect(() => {
    const topRatedParam = searchParams.get("topRated")
    if (topRatedParam === null) return
    // eslint-disable-next-line react-hooks/set-state-in-effect -- mirror topRated URL on back/forward
    setFilterTopRated(topRatedParam === "1")
  }, [searchParams])

  function toggleTopRated() {
    const next = !filterTopRated
    setFilterTopRated(next)
    const nextParams = new URLSearchParams(searchParams)
    nextParams.set("topRated", next ? "1" : "0")
    setSearchParams(nextParams, { replace: true })
  }

  function toggleAmenityFilter(key: VenueAmenityKey) {
    setAmenityFilters((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    )
  }

  const savedToggleHref = useMemo(() => {
    const p = new URLSearchParams(searchParams)
    if (navViewSaved) p.delete("view")
    else p.set("view", "saved")
    const qs = p.toString()
    return qs ? `/venues?${qs}` : "/venues"
  }, [searchParams, navViewSaved])

  const searchQuery = useInfiniteQuery({
    queryKey: ["venues", "search", q, catalogSort],
    queryFn: ({ pageParam }) =>
      api.fetchVenuesSearchPage(q, pageParam, 24, listSortOpts),
    initialPageParam: 1,
    getNextPageParam: (last) => {
      const next = last.meta.nextPage
      if (next == null) return undefined
      return typeof next === "number" ? next : undefined
    },
    enabled: q.length > 0,
  })

  const listQuery = useInfiniteQuery({
    queryKey: ["venues", "list", catalogSort],
    queryFn: ({ pageParam }) =>
      api.fetchVenuesPage(pageParam, 24, listSortOpts),
    initialPageParam: 1,
    getNextPageParam: (last) => {
      const next = last.meta.nextPage
      if (next == null) return undefined
      return typeof next === "number" ? next : undefined
    },
    enabled: q.length === 0,
  })

  const flatCatalogVenues: Venue[] = useMemo(() => {
    if (q.length > 0)
      return searchQuery.data?.pages.flatMap((p) => p.data) ?? []
    return listQuery.data?.pages.flatMap((p) => p.data) ?? []
  }, [q, searchQuery.data, listQuery.data])

  const rawVenues: Venue[] = useMemo(
    () => sortVenuesByCatalogMode(flatCatalogVenues, catalogSort),
    [flatCatalogVenues, catalogSort],
  )

  const venuesMatchingExceptGuests = useMemo(
    () => filterVenues(rawVenues, catalogFilters, undefined),
    [rawVenues, catalogFilters],
  )

  const displayVenues = useMemo(
    () => filterVenues(rawVenues, catalogFilters, guestCount),
    [rawVenues, catalogFilters, guestCount],
  )

  const gridVenues = useMemo(() => {
    if (navViewSaved) return displayVenues.filter((v) => favorites[v.id])
    return displayVenues
  }, [displayVenues, navViewSaved, favorites])

  const loading = q.length > 0 ? searchQuery.isLoading : listQuery.isLoading
  const error = q.length > 0 ? searchQuery.error : listQuery.error
  const searchHasMore = Boolean(q.length > 0 && searchQuery.hasNextPage)
  const listHasMore = q.length === 0 && listQuery.hasNextPage
  const canLoadMore = (searchHasMore || listHasMore) && !navViewSaved
  const isFetchingNextPage =
    q.length > 0 ? searchQuery.isFetchingNextPage : listQuery.isFetchingNextPage

  const noResultsDueToGuestCap =
    !navViewSaved &&
    !loading &&
    !error &&
    displayVenues.length === 0 &&
    venuesMatchingExceptGuests.length > 0

  const noResultsDueToPetsFilter =
    !navViewSaved &&
    !loading &&
    !error &&
    catalogFilters.amenities.includes("pets") &&
    displayVenues.length === 0 &&
    filterVenues(
      rawVenues,
      {
        ...catalogFilters,
        amenities: catalogFilters.amenities.filter((k) => k !== "pets"),
      },
      guestCount,
    ).length > 0

  function applySearchFromInput(input: string, options?: ApplySearchOptions) {
    const parsed = parseVenueSearchQuery(input)
    const textQ = parsed.textQuery
    const guests = parsed.guests ?? DEFAULT_SEARCH_GUESTS
    const requirePets = parsed.requirePets
    const next = new URLSearchParams(searchParams)
    if (textQ) next.set("q", textQ)
    else next.delete("q")
    if (options?.keepSavedView && navViewSaved) next.set("view", "saved")
    next.set("guests", String(clampSearchGuests(guests)))
    if (requirePets) next.set("pets", "1")
    else next.delete("pets")
    next.delete("from")
    next.delete("to")
    setSearchParams(next)
    options?.afterApply?.()
  }

  function clearSearch(variant: "home" | "venues") {
    setSearchInput("")
    if (variant === "home") {
      const next = new URLSearchParams()
      const sortParam = catalogSortToSearchParam(catalogSort)
      if (sortParam) next.set("sort", sortParam)
      if (searchParams.get("view") === "saved") next.set("view", "saved")
      setSearchParams(next)
      return
    }
    const next = new URLSearchParams(searchParams)
    next.delete("q")
    next.delete("from")
    next.delete("to")
    next.delete("guests")
    next.delete("pets")
    if (navViewSaved) next.set("view", "saved")
    else next.delete("view")
    setSearchParams(next)
  }

  function fetchNextPage() {
    if (q.length > 0) void searchQuery.fetchNextPage()
    else void listQuery.fetchNextPage()
  }

  function setCatalogSort(mode: CatalogSortMode) {
    const next = new URLSearchParams(searchParams)
    const sortParam = catalogSortToSearchParam(mode)
    if (sortParam) next.set("sort", sortParam)
    else next.delete("sort")
    setSearchParams(next)
  }

  const hasActiveCatalogFilters = filterTopRated || amenityFilters.length > 0

  const hasActiveSearch =
    Boolean(q) || requirePetsFilter || guestCount !== DEFAULT_SEARCH_GUESTS

  return {
    searchParams,
    setSearchParams,
    q,
    navViewSaved,
    requirePetsFilter,
    catalogSort,
    searchInput,
    setSearchInput,
    filterTopRated,
    setFilterTopRated,
    toggleTopRated,
    amenityFilters,
    toggleAmenityFilter,
    hasActiveCatalogFilters,
    guestCount,
    favorites,
    toggleFavorite,
    savedToggleHref,
    rawVenues,
    gridVenues,
    loading,
    error,
    canLoadMore,
    isFetchingNextPage,
    noResultsDueToGuestCap,
    noResultsDueToPetsFilter,
    applySearchFromInput,
    clearSearch,
    fetchNextPage,
    setCatalogSort,
    hasActiveSearch,
  }
}
