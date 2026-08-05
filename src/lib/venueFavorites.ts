import { useCallback, useEffect, useState } from "react"

export const FAV_STORAGE_KEY = "holidaze_favorite_venue_ids"

export type FavoritesMap = Record<string, boolean>

export function readStoredFavorites(): FavoritesMap {
  try {
    const raw = localStorage.getItem(FAV_STORAGE_KEY)
    if (!raw) return {}
    const ids = JSON.parse(raw) as unknown
    if (!Array.isArray(ids)) return {}
    return Object.fromEntries(
      ids
        .filter((x): x is string => typeof x === "string")
        .map((id) => [id, true]),
    )
  } catch {
    return {}
  }
}

export function writeStoredFavorites(favorites: FavoritesMap): void {
  try {
    const ids = Object.entries(favorites)
      .filter(([, on]) => on)
      .map(([id]) => id)
    localStorage.setItem(FAV_STORAGE_KEY, JSON.stringify(ids))
  } catch {
    // localStorage can throw in private mode / quota exceeded.
  }
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<FavoritesMap>(readStoredFavorites)

  useEffect(() => {
    writeStoredFavorites(favorites)
  }, [favorites])

  const toggleFavorite = useCallback((id: string) => {
    setFavorites((prev) => ({ ...prev, [id]: !prev[id] }))
  }, [])

  const isFavorite = useCallback(
    (id: string) => Boolean(favorites[id]),
    [favorites],
  )

  return { favorites, toggleFavorite, isFavorite }
}
