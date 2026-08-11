import { useEffect } from "react"

// Keep in sync with <title> in index.html
export const DEFAULT_DOCUMENT_TITLE = "Kvile | Venue bookings"

export function useDocumentTitle(segment?: string) {
  useEffect(() => {
    document.title =
      segment && segment.trim() !== ""
        ? `Kvile | ${segment.trim()}`
        : DEFAULT_DOCUMENT_TITLE
  }, [segment])
}
