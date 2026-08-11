import { useEffect } from "react"

// Matches the `<title>` shipped in `index.html` for the home route.
export const DEFAULT_DOCUMENT_TITLE = "Kvile | Venue bookings"

// Sets `document.title` for the current screen. Pass `undefined` to use the home default.
export function useDocumentTitle(segment?: string) {
  useEffect(() => {
    document.title =
      segment && segment.trim() !== ""
        ? `Kvile | ${segment.trim()}`
        : DEFAULT_DOCUMENT_TITLE
  }, [segment])
}
