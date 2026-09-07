import { Link } from "react-router-dom"
import type { Venue } from "../lib/types"
import { hostProfileHref } from "../lib/hostProfilePath"
import { IconHeart } from "./Icons"

export function CuratedVenueCard({
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
    <article className="group overflow-hidden rounded-3xl border border-stone-200/80 bg-white shadow-card shadow-card-hover">
      <div className="relative h-64 overflow-hidden md:h-64">
        <Link
          to={`/venues/${venue.id}`}
          className="block h-full w-full bg-stone-100"
        >
          {img ? (
            <img
              src={img.url}
              alt={img.alt ?? venue.name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
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
          className="absolute right-4 top-4 flex size-10 items-center justify-center rounded-full bg-mobile-surface/50 text-mobile-ink backdrop-blur-sm transition-colors hover:bg-mobile-surface"
          aria-label={favorited ? "Remove from favorites" : "Save to favorites"}
        >
          <IconHeart
            filled={favorited}
            className={favorited ? "size-5 text-red-500" : "size-5"}
          />
        </button>
      </div>
      <div className="p-6">
        <div className="mb-2 flex items-start justify-between gap-2">
          <Link
            to={`/venues/${venue.id}`}
            className="text-lg font-bold text-mobile-ink hover:text-mobile-primary"
          >
            {venue.name}
          </Link>
          {rating != null ? (
            <span className="flex shrink-0 items-center gap-1 text-sm font-bold tabular-nums text-badge-star-text">
              <span className="text-badge-star-text">★</span>
              {rating.toFixed(1)}
            </span>
          ) : (
            <span className="text-sm text-stone-400">-</span>
          )}
        </div>
        {loc || venue.owner?.name?.trim() ? (
          <div className="mb-4 space-y-1">
            {loc ? (
              <p className="text-sm text-on-surface-muted">{loc}</p>
            ) : null}
            {venue.owner?.name?.trim() ? (
              <p className="text-sm font-medium text-on-surface-muted">
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
        ) : null}
        <div className="mt-5 flex flex-wrap items-end justify-between gap-3 border-t border-stone-100 pt-5">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-on-surface-muted">
              From
            </p>
            <p className="mt-0.5">
              <span className="text-xl font-bold text-mobile-primary tabular-nums">
                {venue.price}
              </span>
              <span className="text-sm font-medium text-on-surface-muted">
                {" "}
                / night
              </span>
            </p>
          </div>
          <Link
            to={`/venues/${venue.id}`}
            className="inline-flex items-center gap-1 text-sm font-bold text-mobile-primary underline-offset-4 transition-colors hover:text-holidaze-blue-hover hover:underline"
          >
            View stay
            <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
    </article>
  )
}
