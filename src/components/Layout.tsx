import clsx from "clsx"
import { Suspense, useState } from "react"
import { Link, NavLink, Outlet, useLocation } from "react-router-dom"
import { MobileShell } from "./MobileHomeChrome"
import { MobileHomeSearchChromeContext } from "./mobileHomeSearchChrome"
import { ScrollToTop } from "./ScrollToTop"
import { KVILE_LOGO_SRC } from "./KvileLogo"
import { SiteHeader } from "./SiteHeader"
import { SkipLink } from "./SkipLink"

// Room for the fixed bottom dock + home indicator on phones
const MOBILE_DOCK_BOTTOM_PAD =
  "max-md:pb-[calc(7.5rem+env(safe-area-inset-bottom))]"

function FooterKvileBrand({ className }: { className?: string }) {
  return (
    <Link
      to="/"
      className={clsx(
        "pointer-events-auto inline-flex origin-center scale-[2.92] items-center px-3 py-2 leading-none outline-none transition-opacity hover:opacity-90 md:scale-[3.22]",
        className,
      )}
      aria-label="Kvile home"
    >
      <img
        src={KVILE_LOGO_SRC}
        alt=""
        decoding="async"
        className="block h-8 w-auto max-w-[11rem] object-contain md:max-w-[12rem]"
      />
    </Link>
  )
}

function footerLinkClass({ isActive }: { isActive: boolean }) {
  return clsx("footer-legal-link", isActive && "text-holidaze-blue")
}

function SiteFooter({ className }: { className?: string }) {
  return (
    <footer
      className={clsx(
        "font-manrope mt-auto flex w-full flex-col gap-6 overflow-visible border-t border-stone-200 bg-stone-50 py-8 text-sm text-on-surface-muted",
        className,
      )}
    >
      <div className="pointer-events-none relative z-0 flex w-full justify-center overflow-visible px-4 md:px-12">
        <FooterKvileBrand />
      </div>
      <div className="relative z-10 mx-auto flex min-w-0 w-full max-w-screen-2xl flex-col items-center gap-6 px-4 md:flex-row md:items-center md:justify-between md:px-12">
        <p className="text-center md:text-left">
          © {new Date().getFullYear()} Kvile. Your Digital Sanctuary.
        </p>
        <nav className="flex flex-wrap justify-center gap-x-8 gap-y-2 md:flex-nowrap md:justify-end">
          <NavLink to="/privacy" className={footerLinkClass}>
            Privacy Policy
          </NavLink>
          <NavLink to="/terms" className={footerLinkClass}>
            Terms of Service
          </NavLink>
          <NavLink to="/contact" className={footerLinkClass}>
            Contact Us
          </NavLink>
        </nav>
      </div>
    </footer>
  )
}

export function Layout() {
  const { pathname } = useLocation()
  const isHome = pathname === "/"
  const isManager = pathname.startsWith("/manager")
  const dockPadMobile = !isManager
  const [mobileSearchExpanded, setMobileSearchExpanded] = useState(false)

  return (
    <MobileHomeSearchChromeContext.Provider
      value={{
        searchExpanded: mobileSearchExpanded,
        setSearchExpanded: setMobileSearchExpanded,
      }}
    >
      <div
        className={clsx(
          "flex min-h-screen flex-col",
          isHome ? "bg-mobile-surface" : "app-page-bg",
        )}
      >
        <ScrollToTop />
        <SkipLink />
        <SiteHeader
          variant={isHome ? "overlay" : "solid"}
          className="hidden md:block"
        />
        <div className="md:hidden">
          <MobileShell dockVisible={!isManager} />
        </div>
        <main
          id="main-content"
          tabIndex={-1}
          aria-label="Main content"
          className={clsx(
            "flex-1 outline-none",
            isHome
              ? clsx(
                  "w-full px-0 pt-0",
                  dockPadMobile && MOBILE_DOCK_BOTTOM_PAD,
                )
              : clsx(
                  "mx-auto w-full max-w-6xl px-4 py-8 md:px-6 md:py-10",
                  "max-md:pt-[calc(2.75rem+env(safe-area-inset-top))]",
                  dockPadMobile ? MOBILE_DOCK_BOTTOM_PAD : "max-md:pb-10",
                ),
          )}
        >
          <Suspense
            fallback={
              <p role="status" aria-live="polite" className="text-brand-800">
                Loading page...
              </p>
            }
          >
            <Outlet />
          </Suspense>
        </main>
        <SiteFooter
          className={clsx(
            isHome && "hidden md:block",
            !isHome && dockPadMobile && MOBILE_DOCK_BOTTOM_PAD,
          )}
        />
      </div>
    </MobileHomeSearchChromeContext.Provider>
  )
}
