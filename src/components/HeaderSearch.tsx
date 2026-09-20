import clsx from "clsx"
import { useEffect, useState, type FormEvent } from "react"
import { useLocation, useNavigate, useSearchParams } from "react-router-dom"
import { clampSearchGuests, DEFAULT_SEARCH_GUESTS } from "../lib/filterVenues"
import {
  formatVenueSearchQueryForDisplay,
  parseVenueSearchQuery,
} from "../lib/parseVenueSearchQuery"
import { IconClose, IconSearch } from "./Icons"
import { useMobileHomeSearchChrome } from "./mobileHomeSearchChrome"

function noopSetSearchExpanded() {}

export function HeaderSearch({ compact }: { compact: boolean }) {
  const searchFieldId = compact
    ? "kvile-header-search-mobile"
    : "kvile-header-search-desktop"
  const searchPanelId = compact
    ? "kvile-header-search-panel-mobile"
    : "kvile-header-search-panel-desktop"
  const chrome = useMobileHomeSearchChrome()
  const { pathname } = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const [input, setInput] = useState("")
  const searchExpanded = chrome?.searchExpanded ?? false
  const setSearchExpanded = chrome?.setSearchExpanded ?? noopSetSearchExpanded

  useEffect(() => {
    if (pathname !== "/" && pathname !== "/venues") return
    const q = (searchParams.get("q") ?? "").trim()
    const guests = Number.parseInt(searchParams.get("guests") ?? "", 10)
    const pets = searchParams.get("pets") === "1"
    // eslint-disable-next-line react-hooks/set-state-in-effect -- keep the box in sync with ?q=&guests=&pets=
    setInput(
      formatVenueSearchQueryForDisplay(
        q,
        Number.isFinite(guests)
          ? clampSearchGuests(guests)
          : DEFAULT_SEARCH_GUESTS,
        pets,
      ),
    )
  }, [pathname, searchParams])

  useEffect(() => {
    if (!searchExpanded) return
    const frame = window.requestAnimationFrame(() => {
      const el = document.getElementById(searchFieldId)
      if (!el || el.getClientRects().length === 0) return
      el.focus()
    })
    return () => window.cancelAnimationFrame(frame)
  }, [searchExpanded, searchFieldId])
  useEffect(() => {
    if (!searchExpanded) return
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setSearchExpanded(false)
    }
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [searchExpanded, setSearchExpanded])

  useEffect(() => {
    if (!searchExpanded) return
    function onPointerDown(e: PointerEvent) {
      const t = e.target
      if (t instanceof Element && t.closest("[data-kvile-header-search]")) {
        return
      }
      setSearchExpanded(false)
    }
    document.addEventListener("pointerdown", onPointerDown)
    return () => document.removeEventListener("pointerdown", onPointerDown)
  }, [searchExpanded, setSearchExpanded])

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    const parsed = parseVenueSearchQuery(input)
    const next = new URLSearchParams(searchParams)
    if (parsed.textQuery) next.set("q", parsed.textQuery)
    else next.delete("q")
    next.set(
      "guests",
      String(clampSearchGuests(parsed.guests ?? DEFAULT_SEARCH_GUESTS)),
    )
    if (parsed.requirePets) next.set("pets", "1")
    else next.delete("pets")
    next.delete("view")

    if (pathname === "/" || pathname === "/venues") {
      setSearchParams(next)
    } else {
      navigate({ pathname: "/venues", search: next.toString() })
    }
    setSearchExpanded(false)
  }

  if (!chrome) {
    throw new Error(
      "HeaderSearch must be inside MobileHomeSearchChromeContext.",
    )
  }

  return (
    <>
      <button
        type="button"
        data-kvile-header-search=""
        onClick={() => setSearchExpanded(!searchExpanded)}
        className={clsx(
          "flex size-9 items-center justify-center rounded-full transition",
          searchExpanded
            ? "bg-mobile-primary/10 text-mobile-primary"
            : compact
              ? "text-on-surface-muted hover:bg-black/[0.06]"
              : "text-stone-600 hover:bg-stone-100 hover:text-holidaze-blue",
        )}
        aria-expanded={searchExpanded}
        aria-controls={searchPanelId}
        aria-label="Search venues"
      >
        <IconSearch className={compact ? "size-[22px]" : "size-5"} />
      </button>

      {searchExpanded ? (
        <div
          id={searchPanelId}
          data-kvile-header-search=""
          className={clsx(
            "flex items-center gap-2 border-t border-stone-200/50",
            compact ? "px-3 py-2" : "px-6 py-3",
            // Sit under the header row, full width of <header>
            "absolute inset-x-0 top-full z-50 bg-mobile-surface/95 shadow-[0_8px_24px_rgb(0_0_0/0.08)] backdrop-blur-xl",
          )}
        >
          <form
            onSubmit={onSubmit}
            className="relative flex min-h-8 min-w-0 flex-1 items-center gap-1.5 rounded-full border border-white/55 bg-mobile-surface/92 px-2 py-1 shadow-sm ring-1 ring-stone-900/6"
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
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Place, guests, pets..."
              className="min-w-0 flex-1 border-none bg-transparent py-0.5 text-[13px] font-medium text-mobile-ink outline-none placeholder:text-on-surface-muted/65"
            />
            <button
              type="submit"
              className="flex size-7 shrink-0 items-center justify-center rounded-full bg-mobile-primary text-white"
              aria-label="Search"
            >
              <IconSearch className="size-[15px] text-white" aria-hidden />
            </button>
          </form>
          <button
            type="button"
            onClick={() => setSearchExpanded(false)}
            className="flex size-9 shrink-0 items-center justify-center rounded-full text-on-surface-muted hover:bg-black/[0.06]"
            aria-label="Close search"
          >
            <IconClose className="size-[22px]" />
          </button>
        </div>
      ) : null}
    </>
  )
}
