import { Link, NavLink, useLocation } from "react-router-dom"
import clsx from "clsx"
import { useAuth } from "../context/AuthContext"
import { IconUser } from "./Icons"
import { KvileLogo } from "./KvileLogo"

type Variant = "overlay" | "solid"

export function SiteHeader({
  variant,
  className,
}: {
  variant: Variant
  className?: string
}) {
  const { user, logout } = useAuth()
  const { pathname, search, hash } = useLocation()
  const viewSaved = new URLSearchParams(search).get("view") === "saved"
  const exploreActive = pathname === "/" && !viewSaved
  const isOverlay = variant === "overlay"

  const navInactive = clsx(
    "border-b-2 border-transparent pb-1 text-sm font-semibold text-stone-600 transition-all hover:text-holidaze-blue",
  )

  return (
    <header
      className={clsx(
        className,
        isOverlay
          ? "fixed inset-x-0 top-0 z-50 border-b border-white/40 bg-mobile-surface/75 shadow-[0_1px_0_rgb(0_0_0/0.04)] backdrop-blur-xl"
          : "sticky top-0 z-50 border-b border-stone-200/70 bg-gradient-to-b from-brand-50/50 to-cream/95 shadow-sm shadow-stone-900/5 backdrop-blur-md",
      )}
    >
      <div
        className={clsx(
          "font-manrope mx-auto flex max-w-screen-2xl flex-wrap items-center justify-between gap-2 px-3 py-1.5 tracking-tight md:gap-6 md:px-10 md:py-2",
          !isOverlay && "md:flex-nowrap",
        )}
      >
        <Link
          to="/"
          className="relative z-10 order-1 flex shrink-0 items-center overflow-visible outline-none transition-opacity hover:opacity-90 md:order-none"
        >
          <KvileLogo />
        </Link>

        <nav
          aria-label="Primary"
          className={clsx(
            "order-3 flex w-full basis-full items-center justify-center gap-6 border-t border-stone-200/60 py-1.5 md:order-none md:flex md:w-auto md:basis-auto md:gap-8 md:border-t-0 md:py-0",
          )}
        >
          <NavLink
            to="/"
            end
            className={() =>
              clsx(
                "inline-block pb-1 text-sm font-semibold transition-all",
                exploreActive
                  ? "border-b-2 border-mobile-primary text-mobile-primary"
                  : "border-b-2 border-transparent text-stone-600 hover:text-holidaze-blue",
              )
            }
          >
            Explore
          </NavLink>
          <NavLink
            to="/venues"
            className={({ isActive }) =>
              clsx(
                "inline-block pb-1 text-sm font-semibold transition-all",
                isActive
                  ? "border-b-2 border-mobile-primary text-mobile-primary"
                  : "border-b-2 border-transparent text-stone-600 hover:text-holidaze-blue",
              )
            }
          >
            All Venues
          </NavLink>
          <Link
            to={{ pathname: "/", hash: "about" }}
            className={navInactive}
            onClick={(e) => {
              if (pathname === "/" && hash === "#about") {
                e.preventDefault()
                document
                  .getElementById("about")
                  ?.scrollIntoView({ behavior: "smooth", block: "start" })
              }
            }}
          >
            About
          </Link>
        </nav>

        <div className="order-2 flex min-w-0 shrink-0 items-center gap-2 md:order-none md:gap-4">
          {user ? (
            <>
              <Link
                to="/my-bookings"
                className="hidden rounded-full px-3 py-2 text-sm font-medium text-stone-600 hover:text-holidaze-blue sm:inline"
              >
                My bookings
              </Link>
              {user.venueManager ? (
                <Link
                  to="/manager/venues"
                  className="hidden rounded-full px-3 py-2 text-sm font-medium text-stone-600 hover:text-holidaze-blue sm:inline"
                >
                  My venues
                </Link>
              ) : null}
              <Link
                to="/profile"
                className={clsx(
                  "hidden max-w-[14rem] items-center gap-2 rounded-full border border-stone-300 bg-white/90 px-3 py-1.5 text-left shadow-sm transition sm:flex md:max-w-[18rem]",
                  "hover:border-mobile-primary/40 hover:bg-stone-50 hover:shadow active:scale-[0.98]",
                  isOverlay &&
                    "border-stone-200/90 bg-white/80 supports-[backdrop-filter]:bg-white/70",
                )}
                title={`Signed in as ${user.name}. Open your profile.`}
                aria-label={`Your profile, signed in as ${user.name}`}
              >
                <IconUser className="size-[18px] shrink-0 text-mobile-primary" />
                <span className="flex min-w-0 flex-col leading-tight font-manrope">
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-on-surface-muted">
                    Signed in
                  </span>
                  <span className="truncate text-sm font-semibold text-stone-900">
                    {user.name}
                  </span>
                </span>
              </Link>
              <button
                type="button"
                onClick={() => logout()}
                className="rounded-full border border-stone-400 px-5 py-2 text-sm font-medium text-mobile-ink transition hover:bg-stone-100"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-full border border-stone-400/70 px-6 py-2 text-sm font-medium text-on-surface-muted transition hover:bg-stone-100/80 active:scale-95"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="hidden rounded-full bg-mobile-primary px-5 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-holidaze-blue-hover sm:inline"
              >
                Join
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
