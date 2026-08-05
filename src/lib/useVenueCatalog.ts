import { useInfiniteQuery } from "@tanstack/react-query"
import { useMemo } from "react"
import { fetchVenuesPage } from "./api"
import type { Venue } from "./types"
import { useFavorites } from "./venueFavorites"

/**
 * Shared catalogue for Home and /venues (Issue 13).
 * Search, filters, URL params: Issue 15. Load more UI: Issue 14.
 */
export function useVenueCatalog() {
  const { favorites, toggleFavorite } = useFavorites()

  const listQuery = useInfiniteQuery({
    queryKey: ["venues", "list"],
    queryFn: ({ pageParam }) => fetchVenuesPage(pageParam, 24),
    initialPageParam: 1,
    getNextPageParam: (last) => {
      const next = last.meta.nextPage
      if (next == null) return undefined
      return typeof next === "number" ? next : undefined
    },
  })

  const gridVenues: Venue[] = useMemo(
    () => listQuery.data?.pages.flatMap((p) => p.data) ?? [],
    [listQuery.data],
  )

  return {
    gridVenues,
    loading: listQuery.isLoading,
    error: listQuery.error,
    favorites,
    toggleFavorite,
    canLoadMore: listQuery.hasNextPage,
    isFetchingNextPage: listQuery.isFetchingNextPage,
    fetchNextPage: () => void listQuery.fetchNextPage(),
  }
}
