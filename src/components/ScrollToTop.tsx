import { useEffect } from "react"
import { useLocation } from "react-router-dom"

// Scroll to top when the route path changes, but not when only query params change
// (sort, search, guests), so catalogue filters do not jump the page.
// The home `#about` anchor is handled in HomePage.
export function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: reduceMotion ? "auto" : "smooth",
    })
  }, [pathname])

  return null
}
