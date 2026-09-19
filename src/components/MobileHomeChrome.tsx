import clsx from "clsx"
import { useEffect, useId, useRef, useState } from "react"
import { Link, NavLink, useLocation } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { IconClose, IconLogOut, IconMenu, IconSearch, IconUser } from "./Icons"
import { KvileLogo } from "./KvileLogo"
import { useMobileHomeSearchChrome } from "./mobileHomeSearchChrome"
import { useQuery } from "@tanstack/react-query"
import * as api from "../lib/api"

function initials(name: string) {
  const parts = name.trim().split(/\s+/)
  const a = parts[0]?.[0] ?? "?"
  const b = parts[1]?.[0] ?? ""
  return (a + b).toUpperCase()
}

function sheetLinkClass(isActive: boolean) {
  return clsx(
    "flex min-h-12 items-center rounded-xl px-3 text-[15px] font-semibold",
    isActive
      ? "bg-mobile-primary/10 text-mobile-primary"
      : "text-brand-950 hover:bg-stone-50",
  )
}

type MobileNavDialogProps = {
  dialogRef: React.RefObject<HTMLDialogElement | null>
}

function MobileNavDialog({ dialogRef }: MobileNavDialogProps) {
  const titleId = useId()
  const { pathname, search, hash } = useLocation()
  const { user, logout } = useAuth()
  const profileQuery = useQuery({
    queryKey: ["profile", "me", user?.name ?? ""],
    queryFn: () => api.fetchProfile(user!.accessToken, user!.name),
    enabled: Boolean(user?.accessToken && user?.name),
  })
  const avatarUrl = profileQuery.data?.avatar?.url?.trim() ?? ""
  const [brokenAvatarUrl, setBrokenAvatarUrl] = useState("")
  const avatarBroken = brokenAvatarUrl === avatarUrl

  const viewSaved = new URLSearchParams(search).get("view") === "saved"

  useEffect(() => {
    dialogRef.current?.close()
  }, [pathname, search, dialogRef])

  function closeSheet() {
    dialogRef.current?.close()
  }

  return (
    <dialog
      ref={dialogRef}
      id="kvile-mobile-menu"
      className={clsx(
        "pointer-events-none fixed inset-x-0 bottom-0 z-[60] m-0 flex w-full max-w-none flex-col justify-start border-none bg-transparent p-0",
        "top-[calc(2.75rem+env(safe-area-inset-top))]",
        "h-[calc(100dvh-2.75rem-env(safe-area-inset-top))]",
      )}
      aria-labelledby={titleId}
      onCancel={(e) => {
        e.preventDefault()
        closeSheet()
      }}
    >
      <h2 id={titleId} className="sr-only">
        Menu
      </h2>
      <button
        type="button"
        className="pointer-events-auto absolute inset-0 bg-black/40"
        aria-label="Close menu"
        onClick={closeSheet}
      />
      <div
        className={clsx(
          "pointer-events-auto relative z-10 flex max-h-[min(85vh,100%)] w-full shrink-0 flex-col",
          "rounded-b-3xl border border-t-0 border-stone-200/80 bg-white shadow-[0_12px_40px_rgba(0,0,0,0.12)] outline-none",
        )}
      >
        <nav
          aria-label="Primary"
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-2 pt-2 pb-5"
        >
          <ul className="divide-y divide-stone-100">
            <li>
              <NavLink
                to="/"
                end
                onClick={closeSheet}
                className={({ isActive }) =>
                  sheetLinkClass(isActive && !viewSaved)
                }
              >
                Home
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/venues"
                onClick={closeSheet}
                className={() =>
                  sheetLinkClass(
                    (pathname === "/venues" ||
                      pathname.startsWith("/venues/")) &&
                      !viewSaved,
                  )
                }
              >
                Venues
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/venues?view=saved"
                onClick={closeSheet}
                className={() => sheetLinkClass(viewSaved)}
              >
                Saved
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/my-bookings"
                onClick={closeSheet}
                className={({ isActive }) => sheetLinkClass(isActive)}
              >
                My bookings
              </NavLink>
            </li>
            <li>
              <Link
                to={{ pathname: "/", hash: "about" }}
                onClick={(e) => {
                  closeSheet()
                  if (pathname === "/" && hash === "#about") {
                    e.preventDefault()
                    window.requestAnimationFrame(() =>
                      document.getElementById("about")?.scrollIntoView({
                        behavior: "smooth",
                        block: "start",
                      }),
                    )
                  }
                }}
                className={sheetLinkClass(false)}
              >
                About
              </Link>
            </li>
            <li>
              <NavLink
                to="/contact"
                onClick={closeSheet}
                className={({ isActive }) => sheetLinkClass(isActive)}
              >
                Contact
              </NavLink>
            </li>
            {!user ? (
              <li>
                <NavLink
                  to="/register"
                  onClick={closeSheet}
                  className={({ isActive }) => sheetLinkClass(isActive)}
                >
                  Register
                </NavLink>
              </li>
            ) : null}
            {user?.venueManager ? (
              <li>
                <NavLink
                  to="/manager/venues"
                  onClick={closeSheet}
                  className={({ isActive }) => sheetLinkClass(isActive)}
                >
                  My venues
                </NavLink>
              </li>
            ) : null}
          </ul>
        </nav>

        {user ? (
          <div className="border-t border-stone-100 bg-mobile-surface/70 px-3 pt-6 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            <Link
              to="/profile"
              onClick={closeSheet}
              className="mb-3 flex flex-col items-center rounded-2xl px-3 py-3 text-center transition hover:bg-white/80"
              aria-label={`Your profile, signed in as ${user.name}`}
            >
              <span className="flex size-14 items-center justify-center overflow-hidden rounded-full border-2 border-mobile-primary/35 bg-white shadow-sm">
                {avatarUrl && !avatarBroken ? (
                  <img
                    src={avatarUrl}
                    alt=""
                    className="size-full object-cover"
                    onError={() => setBrokenAvatarUrl(avatarUrl)}
                  />
                ) : (
                  <span className="text-sm font-bold text-mobile-primary font-manrope">
                    {initials(user.name)}
                  </span>
                )}
              </span>
              <span className="mt-2 font-manrope text-base font-extrabold text-mobile-ink">
                {user.name}
              </span>
              <span className="mt-0.5 text-[11px] font-semibold uppercase tracking-wide text-mobile-primary">
                View profile
              </span>
            </Link>
            <button
              type="button"
              className="flex min-h-12 w-full items-center justify-center gap-2 rounded-full border border-stone-200/90 bg-white text-[15px] font-semibold text-brand-950 transition hover:bg-stone-50"
              onClick={() => {
                closeSheet()
                logout()
              }}
            >
              <IconLogOut className="size-5 shrink-0" />
              Log out
            </button>
          </div>
        ) : (
          <div className="border-t border-stone-100 bg-mobile-surface/70 px-3 pt-6 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            <Link
              to="/login"
              onClick={closeSheet}
              className="flex min-h-12 w-full items-center justify-center gap-2 rounded-full border border-stone-200/90 bg-white text-[15px] font-semibold text-brand-950 transition hover:bg-stone-50"
            >
              <IconUser className="size-5 shrink-0" />
              Log in
            </Link>
          </div>
        )}
      </div>
    </dialog>
  )
}

function MobileTopBar({
  menuOpen,
  onToggleRequest,
  searchExpanded,
  onSearchExpandedChange,
}: {
  menuOpen: boolean
  onToggleRequest: () => void
  searchExpanded: boolean
  onSearchExpandedChange: (expanded: boolean) => void
}) {
  const { user } = useAuth()
  const { pathname } = useLocation()
  const showHomeSearch = pathname === "/"
  const searchPanelId = "kvile-mobile-home-search-panel"

  useEffect(() => {
    if (!showHomeSearch) {
      onSearchExpandedChange(false)
    }
  }, [showHomeSearch, onSearchExpandedChange])

  useEffect(() => {
    if (!searchExpanded) return
    const frame = window.requestAnimationFrame(() => {
      document.getElementById("hero-search-mobile-header")?.focus()
    })
    return () => window.cancelAnimationFrame(frame)
  }, [searchExpanded])

  useEffect(() => {
    if (!searchExpanded) return
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onSearchExpandedChange(false)
      }
    }
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [searchExpanded, onSearchExpandedChange])

  return (
    <header className="fixed top-0 z-[65] w-full overflow-x-clip border-b border-stone-200/60 pt-[env(safe-area-inset-top)] bg-mobile-surface/80 backdrop-blur-xl supports-[backdrop-filter]:bg-mobile-surface/72">
      <div className="relative flex h-11 w-full items-center justify-between gap-2 px-3">
        <Link
          to="/"
          className="relative z-[12] flex min-w-0 max-w-[min(100%,18rem)] shrink items-center overflow-visible transition-opacity active:opacity-80"
        >
          <KvileLogo className="max-w-full" />
        </Link>
        <span className="min-w-0 flex-1 shrink" aria-hidden="true" />
        <div className="relative z-[12] flex shrink-0 items-center gap-0.5">
          {showHomeSearch ? (
            <button
              type="button"
              onClick={() => onSearchExpandedChange(!searchExpanded)}
              className={clsx(
                "flex size-9 items-center justify-center rounded-full transition hover:bg-black/[0.06]",
                searchExpanded
                  ? "bg-mobile-primary/10 text-mobile-primary"
                  : "text-on-surface-muted",
              )}
              aria-expanded={searchExpanded}
              aria-controls={searchPanelId}
              aria-label="Search venues"
            >
              <IconSearch className="size-[22px]" />
            </button>
          ) : null}
          <button
            type="button"
            onClick={onToggleRequest}
            className="flex size-9 items-center justify-center rounded-full text-on-surface-muted transition hover:bg-black/[0.06]"
            aria-expanded={menuOpen}
            aria-controls="kvile-mobile-menu"
            aria-haspopup="dialog"
            aria-label={menuOpen ? "Close menu" : "Menu"}
          >
            {menuOpen ? (
              <IconClose className="size-[22px]" />
            ) : (
              <IconMenu className="size-[22px]" />
            )}
          </button>
          <Link
            to={user ? "/profile" : "/login"}
            title={
              user
                ? `Signed in as ${user.name}. Open your profile.`
                : "Sign in to your account"
            }
            className={clsx(
              "relative z-20 flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 transition active:scale-[0.98]",
              "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-950",
              user
                ? "border-mobile-primary/35 bg-white/90 shadow-sm hover:bg-stone-50"
                : "border-mobile-primary/25 bg-surface-container-high",
            )}
            aria-label={
              user ? `Your profile, signed in as ${user.name}` : "Sign in"
            }
          >
            {user ? (
              <span
                className="text-[11px] font-bold text-mobile-primary font-manrope"
                aria-hidden="true"
              >
                {initials(user.name)}
              </span>
            ) : (
              <IconUser className="size-[18px] text-mobile-primary" />
            )}
          </Link>
        </div>
      </div>
      {showHomeSearch && searchExpanded ? (
        <div
          id={searchPanelId}
          className="flex items-center gap-2 border-t border-stone-200/50 px-3 py-2"
        >
          <div id="kvile-mobile-home-search-mount" className="min-w-0 flex-1" />
          <button
            type="button"
            onClick={() => onSearchExpandedChange(false)}
            className="flex size-9 shrink-0 items-center justify-center rounded-full text-on-surface-muted transition hover:bg-black/[0.06]"
            aria-label="Close search"
          >
            <IconClose className="size-[22px]" />
          </button>
        </div>
      ) : null}
    </header>
  )
}

export function MobileShell() {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const mobileSearchChrome = useMobileHomeSearchChrome()
  if (!mobileSearchChrome) {
    throw new Error(
      "MobileShell must be rendered inside MobileHomeSearchChromeContext.Provider (see Layout.tsx).",
    )
  }
  const { searchExpanded, setSearchExpanded } = mobileSearchChrome

  const { pathname, search } = useLocation()
  const routeKey = `${pathname}${search}`
  const [menuRouteKey, setMenuRouteKey] = useState(routeKey)
  if (routeKey !== menuRouteKey) {
    setMenuRouteKey(routeKey)
    setMenuOpen(false)
  }

  useEffect(() => {
    const el = dialogRef.current
    if (!el) return
    function syncOpen() {
      setMenuOpen(dialogRef.current?.open ?? false)
    }
    el.addEventListener("toggle", syncOpen as EventListener)
    return () => el.removeEventListener("toggle", syncOpen as EventListener)
  }, [])

  function toggleMenu() {
    const el = dialogRef.current
    if (!el) return
    if (el.open) {
      el.close()
      setMenuOpen(false)
      return
    }
    setSearchExpanded(false)
    el.show()
    setMenuOpen(true)
  }

  return (
    <>
      <MobileTopBar
        menuOpen={menuOpen}
        onToggleRequest={toggleMenu}
        searchExpanded={searchExpanded}
        onSearchExpandedChange={setSearchExpanded}
      />
      <MobileNavDialog dialogRef={dialogRef} />
    </>
  )
}
