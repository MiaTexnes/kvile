import { Link } from "react-router-dom"
import { useDocumentTitle } from "../lib/useDocumentTitle"

export function TermsOfServicePage() {
  useDocumentTitle("Terms of service")
  return (
    <article className="font-manrope mx-auto max-w-3xl space-y-8 px-4 pb-16 text-stone-700 md:px-0">
      <div>
        <h1 className="text-3xl font-bold text-mobile-ink md:text-4xl">
          Terms of Service
        </h1>
        <p className="mt-2 text-sm text-stone-500">
          Educational demo, April 2026
        </p>
      </div>
      <section className="space-y-3 text-sm leading-relaxed md:text-base">
        <h2 className="text-lg font-bold text-mobile-ink">Acceptance</h2>
        <p>
          By using Kvile you agree these terms apply to the student-built
          interface only. Actual booking obligations follow the Noroff Holidaze
          API rules and your relationship with venue managers on the platform.
        </p>
      </section>
      <section className="space-y-3 text-sm leading-relaxed md:text-base">
        <h2 className="text-lg font-bold text-mobile-ink">Accounts</h2>
        <p>
          You need a valid Holidaze-enabled Noroff account to book or manage
          venues. Keep credentials secret; you are responsible for activity
          performed while logged in on your device.
        </p>
      </section>
      <section className="space-y-3 text-sm leading-relaxed md:text-base">
        <h2 className="text-lg font-bold text-mobile-ink">
          Bookings & availability
        </h2>
        <p>
          Availability shown depends on API data. The calendar blocks dates that
          already have bookings, but always confirm details on the venue page
          before travel.
        </p>
      </section>
      <section className="space-y-3 text-sm leading-relaxed md:text-base">
        <h2 className="text-lg font-bold text-mobile-ink">Disclaimer</h2>
        <p>
          This project is provided &quot;as is&quot; for assessment. We are not
          liable for API outages, data mismatches, or travel costs.
        </p>
      </section>
      <p className="text-sm">
        <Link
          to="/contact"
          className="font-semibold text-mobile-primary underline underline-offset-2"
        >
          Contact
        </Link>{" "}
        for coursework questions.
      </p>
    </article>
  )
}
