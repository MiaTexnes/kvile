import clsx from "clsx";
import { useEffect, useId, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  IconClose,
  IconExplore,
  IconHeart,
  IconLogOut,
  IconLuggage,
  IconMenu,
  IconPin,
  IconSearch,
  IconUser,
} from "./Icons";
import { KvileLogo } from "./KvileLogo";
import { useMobileHomeSearchChrome } from "./mobileHomeSearchChrome";

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  const a = parts[0]?.[0] ?? "?";
  const b = parts[1]?.[0] ?? "";
  return (a + b).toUpperCase();
}

const dockItem =
  "flex min-h-[3rem] flex-1 flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-2 text-[11px] font-semibold leading-tight tracking-tight transition-colors active:scale-[0.98] font-manrope";

type MobileNavDialogProps = {
  dialogRef: React.RefObject<HTMLDialogElement | null>;
};

function MobileNavDialog({ dialogRef }: MobileNavDialogProps) {
  const titleId = useId();
  const { pathname, search, hash } = useLocation();
  const { user, logout } = useAuth();

  useEffect(() => {
    dialogRef.current?.close();
  }, [pathname, search, dialogRef]);

  function closeSheet() {
    dialogRef.current?.close();
  }

  return (
    <dialog
      ref={dialogRef}
      id="kvile-mobile-menu"
      className={clsx(
        /* In-flow flex layout: absolute-only children collapse <dialog> to ~0x0, so the sheet never paints. */
        "fixed inset-0 z-[70] m-0 flex h-[100dvh] w-full max-w-none flex-col justify-start border-none bg-transparent p-0",
        "[&::backdrop]:bg-black/40",
      )}
      aria-labelledby={titleId}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          closeSheet();
        }
      }}
      onCancel={(e) => {
        e.preventDefault();
        closeSheet();
      }}
    >
      <div
        className={clsx(
          "flex max-h-[min(85vh,calc(100dvh-env(safe-area-inset-bottom)))] w-full shrink-0 flex-col",
          "rounded-b-3xl border border-stone-200/80 border-t-0 bg-white shadow-[0_12px_40px_rgba(0,0,0,0.12)] outline-none",
        )}
      >
        {/* Same row geometry as MobileTopBar so the close control sits where the hamburger does */}
        <div className="shrink-0 border-b border-stone-100 pt-[env(safe-area-inset-top)]">
          <h2 id={titleId} className="sr-only">
            Menu
          </h2>
          <div className="relative flex h-11 items-center justify-between gap-2 px-3">
            <Link
              to="/"
              onClick={closeSheet}
              className="relative z-10 flex min-w-0 max-w-[min(100%,18rem)] shrink items-center overflow-visible transition-opacity active:opacity-80"
            >
              <KvileLogo className="max-w-full" />
            </Link>
            <div className="flex shrink-0 items-center gap-0.5">
              <button
                type="button"
                onClick={closeSheet}
                className="flex size-9 items-center justify-center rounded-full text-on-surface-muted transition hover:bg-black/[0.06]"
                aria-label="Close menu"
              >
                <IconClose className="size-[22px]" />
              </button>
              <span
                className="size-9 shrink-0 rounded-full border-2 border-transparent"
                aria-hidden="true"
              />
            </div>
          </div>
        </div>

        <nav
          aria-label="More destinations"
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-2 py-2"
        >
          <ul className="divide-y divide-stone-100">
            <li>
              <NavLink
                to="/venues"
                onClick={closeSheet}
                className={({ isActive }) =>
                  clsx(
                    "flex min-h-12 items-center rounded-xl px-3 text-[15px] font-semibold",
                    isActive
                      ? "bg-mobile-primary/10 text-mobile-primary"
                      : "text-brand-950 hover:bg-stone-50",
                  )
                }
              >
                All venues
              </NavLink>
            </li>
            <li>
              <Link
                to={{ pathname: "/", hash: "about" }}
                onClick={(e) => {
                  closeSheet();
                  if (pathname === "/" && hash === "#about") {
                    e.preventDefault();
                    window.requestAnimationFrame(() =>
                      document.getElementById("about")?.scrollIntoView({
                        behavior: "smooth",
                        block: "start",
                      }),
                    );
                  }
                }}
                className="flex min-h-12 items-center rounded-xl px-3 text-[15px] font-semibold text-brand-950 hover:bg-stone-50"
              >
                About
              </Link>
            </li>
            <li>
              <NavLink
                to="/contact"
                onClick={closeSheet}
                className={({ isActive }) =>
                  clsx(
                    "flex min-h-12 items-center rounded-xl px-3 text-[15px] font-semibold",
                    isActive
                      ? "bg-mobile-primary/10 text-mobile-primary"
                      : "text-brand-950 hover:bg-stone-50",
                  )
                }
              >
                Contact
              </NavLink>
            </li>
            {!user ? (
              <li>
                <NavLink
                  to="/register"
                  onClick={closeSheet}
                  className={({ isActive }) =>
                    clsx(
                      "flex min-h-12 items-center rounded-xl px-3 text-[15px] font-semibold",
                      isActive
                        ? "bg-mobile-primary/10 text-mobile-primary"
                        : "text-brand-950 hover:bg-stone-50",
                    )
                  }
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
                  className={({ isActive }) =>
                    clsx(
                      "flex min-h-12 items-center rounded-xl px-3 text-[15px] font-semibold",
                      isActive
                        ? "bg-mobile-primary/10 text-mobile-primary"
                        : "text-brand-950 hover:bg-stone-50",
                    )
                  }
                >
                  My venues
                </NavLink>
              </li>
            ) : null}
          </ul>
        </nav>

        {user ? (
          <div className="border-t border-stone-100 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            <button
              type="button"
              className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-stone-200/90 text-[15px] font-semibold text-brand-950 transition hover:bg-stone-50"
              onClick={() => {
                closeSheet();
                logout();
              }}
            >
              <IconLogOut className="size-5 shrink-0" />
              Log out
            </button>
          </div>
        ) : null}
      </div>
    </dialog>
  );
}

function MobileTopBar({
  menuOpen,
  onToggleRequest,
  searchExpanded,
  onSearchExpandedChange,
}: {
  menuOpen: boolean;
  onToggleRequest: () => void;
  searchExpanded: boolean;
  onSearchExpandedChange: (expanded: boolean) => void;
}) {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const showHomeSearch = pathname === "/";
  const searchPanelId = "kvile-mobile-home-search-panel";

  useEffect(() => {
    if (!showHomeSearch) {
      onSearchExpandedChange(false);
    }
  }, [showHomeSearch, onSearchExpandedChange]);

  useEffect(() => {
    if (!searchExpanded) return;
    const frame = window.requestAnimationFrame(() => {
      document.getElementById("hero-search-mobile-header")?.focus();
    });
    return () => window.cancelAnimationFrame(frame);
  }, [searchExpanded]);

  useEffect(() => {
    if (!searchExpanded) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onSearchExpandedChange(false);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [searchExpanded, onSearchExpandedChange]);

  return (
    <header className="fixed top-0 z-[65] w-full overflow-x-clip border-b border-stone-200/60 pt-[env(safe-area-inset-top)] bg-mobile-surface/80 backdrop-blur-xl supports-[backdrop-filter]:bg-mobile-surface/72 md:hidden">
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
            aria-label="Open menu"
          >
            <IconMenu className="size-[22px]" />
          </button>
          <Link
            to={user ? "/profile" : "/login"}
            title={
              user
                ? `Signed in as ${user.name}. Open your profile.`
                : "Sign in to your account"
            }
            className={clsx(
              "relative flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 transition active:scale-[0.98]",
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
          <div
            id="kvile-mobile-home-search-mount"
            className="min-w-0 flex-1"
          />
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
  );
}

function MobileBottomDock() {
  const { pathname, search } = useLocation();
  const viewSaved = new URLSearchParams(search).get("view") === "saved";
  const exploreActive = pathname === "/" && !viewSaved;
  const venuesTabActive =
    pathname.startsWith("/venues/") || (pathname === "/venues" && !viewSaved);
  const tripsActive = pathname === "/my-bookings";

  return (
    <nav
      className={clsx(
        "pointer-events-none fixed bottom-0 left-0 right-0 z-[65] pb-[max(0.75rem,env(safe-area-inset-bottom))] md:hidden",
      )}
      aria-label="Primary"
    >
      <div className="pointer-events-auto mx-3 mb-3 flex rounded-2xl border border-stone-200/80 bg-white/90 p-1.5 shadow-lg shadow-stone-900/[0.08] backdrop-blur-xl supports-[backdrop-filter]:bg-white/85">
        <NavLink
          to="/"
          end
          className={() =>
            clsx(
              dockItem,
              exploreActive
                ? "bg-mobile-primary text-white shadow-inner"
                : "text-on-surface-muted hover:bg-stone-100",
            )
          }
        >
          <IconExplore className="size-[22px]" />
          Explore
        </NavLink>
        <NavLink
          to="/venues?view=saved"
          className={() =>
            clsx(
              dockItem,
              viewSaved
                ? "bg-mobile-primary text-white shadow-inner"
                : "text-on-surface-muted hover:bg-stone-100",
            )
          }
        >
          <IconHeart className="size-[22px]" filled={viewSaved} />
          Saved
        </NavLink>
        <NavLink
          to="/my-bookings"
          className={() =>
            clsx(
              dockItem,
              tripsActive
                ? "bg-mobile-primary text-white shadow-inner"
                : "text-on-surface-muted hover:bg-stone-100",
            )
          }
        >
          <IconLuggage className="size-[22px]" />
          Trips
        </NavLink>
        <NavLink
          to="/venues"
          className={() =>
            clsx(
              dockItem,
              venuesTabActive
                ? "bg-mobile-primary text-white shadow-inner"
                : "text-on-surface-muted hover:bg-stone-100",
            )
          }
        >
          <IconPin className="size-[22px]" />
          Venues
        </NavLink>
      </div>
    </nav>
  );
}

// Top bar + bottom dock; hamburger opens the sheet
export function MobileShell({ dockVisible = true }: { dockVisible?: boolean }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const mobileSearchChrome = useMobileHomeSearchChrome();
  if (!mobileSearchChrome) {
    throw new Error(
      "MobileShell must be rendered inside MobileHomeSearchChromeContext.Provider (see Layout.tsx).",
    );
  }
  const { searchExpanded, setSearchExpanded } = mobileSearchChrome;

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    function syncOpen() {
      setMenuOpen(dialogRef.current?.open ?? false);
    }
    el.addEventListener("toggle", syncOpen as EventListener);
    return () => el.removeEventListener("toggle", syncOpen as EventListener);
  }, []);

  function toggleMenu() {
    const el = dialogRef.current;
    if (!el) return;
    if (el.open) {
      el.close();
      return;
    }
    el.showModal();
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
      {dockVisible ? <MobileBottomDock /> : null}
    </>
  );
}
