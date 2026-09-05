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
          Last updated: 5 September 2026
        </p>
      </div>
      <section className="space-y-3 text-sm leading-relaxed md:text-base">
        <h2 className="text-lg font-bold text-mobile-ink">Acceptance</h2>
        <p>
          By using Kvile you agree to these terms. Bookings are an agreement
          between you and the venue host.
        </p>
      </section>
      <section className="space-y-3 text-sm leading-relaxed md:text-base">
        <h2 className="text-lg font-bold text-mobile-ink">Accounts</h2>
        <p>
          You need an account to book or manage venues. Keep your login details
          private. You are responsible for activity on your account.
        </p>
      </section>
      <section className="space-y-3 text-sm leading-relaxed md:text-base">
        <h2 className="text-lg font-bold text-mobile-ink">
          Bookings & availability
        </h2>
        <p>
          The calendar shows nights that are already reserved. Always confirm
          dates, guest count, and house rules on the venue page before you
          travel.
        </p>
      </section>
      <section className="space-y-3 text-sm leading-relaxed md:text-base">
        <h2 className="text-lg font-bold text-mobile-ink">Disclaimer</h2>
        <p>
          Listings, prices, and availability are provided by hosts and may
          change. Kvile is not responsible for travel costs if a stay cannot go
          ahead as planned.
        </p>
      </section>
      <p className="text-sm">
        Questions?{" "}
        <Link
          to="/contact"
          className="font-semibold text-mobile-primary underline underline-offset-2"
        >
          Contact us
        </Link>
        .
      </p>
    </article>
  )
}
