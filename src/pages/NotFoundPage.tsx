import { Link } from "react-router-dom"
import { useDocumentTitle } from "../lib/useDocumentTitle"

export function NotFoundPage() {
  useDocumentTitle("Page Not Found")
  return (
    <div className="font-manrope mx-auto max-w-lg rounded-2xl border border-stone-200 bg-white px-8 py-12 text-center shadow-sm">
      <p className="text-sm font-semibold uppercase tracking-widest text-on-surface-muted">
        404
      </p>
      <h1 className="mt-2 text-2xl font-bold text-mobile-ink">
        Page Not Found
      </h1>
      <p className="mt-3 text-stone-600">
        That URL does not exist or has moved. Head back to the homepage to keep
        exploring.
      </p>
      <Link
        to="/"
        className="mt-8 inline-flex rounded-full bg-mobile-primary px-8 py-3 text-sm font-semibold text-white transition hover:bg-holidaze-blue-hover"
      >
        Go Back to Homepage
      </Link>
    </div>
  )
}
