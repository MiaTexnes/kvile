import { useDocumentTitle } from "../../lib/useDocumentTitle"

export function ManagerVenuesPage() {
  useDocumentTitle("Your venues")

  return (
    <div className="space-y-4">
      <h1 className="font-display text-3xl font-semibold text-brand-950">
        Your venues
      </h1>
      <p className="text-brand-800/80">
        Host dashboard listing will be built in a later task.
      </p>
    </div>
  )
}
