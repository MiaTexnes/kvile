import { useQuery } from "@tanstack/react-query"
import { useMemo } from "react"
import { Link, useLocation, useParams } from "react-router-dom"
import { Alert } from "../components/Alert"
import { CuratedVenueCard } from "../components/CuratedVenueCard"
import { useAuth } from "../context/AuthContext"
import * as api from "../lib/api"
import { useDocumentTitle } from "../lib/useDocumentTitle"
import { sortVenuesNewestFirst } from "../lib/venueCatalogSort"
import { useFavorites } from "../lib/venueFavorites"

function looksLikeUnauthorizedGuest(
  error: unknown,
  isLoggedIn: boolean,
): boolean {
  if (isLoggedIn || !error || !(error instanceof Error)) return false
  return /\b401\b|unauthori[sz]ed|forbidden/i.test(error.message)
}

export function HostVenuesPage() {
  const { hostName = "" } = useParams<{ hostName: string }>()
  const location = useLocation()
  const { user } = useAuth()
  const profileLabel = useMemo(
    () => decodeURIComponent(hostName).trim(),
    [hostName],
  )
  const { favorites, toggleFavorite } = useFavorites()
  const authMode = user?.accessToken ? "session" : "anon"

  const q = useQuery({
    queryKey: ["host-venues", profileLabel, authMode],
    queryFn: () =>
      api.fetchVenuesByProfileName(profileLabel, user?.accessToken ?? null),
    enabled: Boolean(profileLabel),
  })

  const venues = useMemo(() => sortVenuesNewestFirst(q.data ?? []), [q.data])

  useDocumentTitle(profileLabel ? `Stays by ${profileLabel}` : "Host")

  if (!profileLabel) {
    return <Alert tone="info">No host was specified in the link.</Alert>
  }

  const showLoginHint = looksLikeUnauthorizedGuest(q.error, Boolean(user))

  return (
    <div className="min-h-screen bg-surface-sheet pb-16 font-manrope">
      <div className="mx-auto max-w-screen-2xl px-4 pt-8 md:px-12 md:pt-10">
        <Link
          to="/venues"
          className="text-sm font-semibold text-mobile-primary hover:underline"
        >
          ← All venues
        </Link>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-mobile-ink md:text-4xl">
          Venues created by {profileLabel}
        </h1>
        <p className="mt-2 max-w-xl text-sm text-stone-600 md:text-base">
          Stays listed by this host. Open a card for details and booking.
        </p>

        {!user ? (
          <p className="mt-3 max-w-xl text-xs text-stone-500">
            Some host lists are only visible after you{" "}
            <Link
              to="/login"
              state={{ from: location }}
              className="font-semibold text-mobile-primary underline underline-offset-2"
            >
              log in
            </Link>
            .
          </p>
        ) : null}

        {q.isPending ? (
          <p
            className="mt-10 rounded-3xl border border-dashed border-stone-300 bg-white/70 py-16 text-center text-stone-500"
            role="status"
            aria-live="polite"
          >
            Loading this host&apos;s stays...
          </p>
        ) : q.error ? (
          <div className="mt-8 space-y-4">
            {showLoginHint ? (
              <Alert tone="info">
                This host&apos;s venue list is not available without signing in.{" "}
                <Link
                  to="/login"
                  state={{ from: location }}
                  className="font-semibold underline underline-offset-2"
                >
                  Log in
                </Link>{" "}
                and reload, or go back to{" "}
                <Link
                  to="/venues"
                  className="font-semibold underline underline-offset-2"
                >
                  all venues
                </Link>
                .
              </Alert>
            ) : null}
            <Alert tone="error">{(q.error as Error).message}</Alert>
          </div>
        ) : venues.length === 0 ? (
          <p className="mt-10 rounded-3xl border border-stone-200 bg-white py-16 text-center text-stone-500">
            No venues are listed for this host right now.
          </p>
        ) : (
          <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {venues.map((v) => (
              <CuratedVenueCard
                key={v.id}
                venue={v}
                favorited={Boolean(favorites[v.id])}
                onToggleFav={toggleFavorite}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
