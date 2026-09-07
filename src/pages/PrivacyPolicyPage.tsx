import { Link } from "react-router-dom"
import { useDocumentTitle } from "../lib/useDocumentTitle"

export function PrivacyPolicyPage() {
  useDocumentTitle("Privacy policy")
  return (
    <article className="font-manrope mx-auto max-w-3xl space-y-8 px-4 pb-16 text-stone-700 md:px-0">
      <div>
        <h1 className="text-3xl font-bold text-mobile-ink md:text-4xl">
          Privacy Policy
        </h1>
        <p className="mt-2 text-sm text-on-surface-muted">
          Last updated: 5 September 2026
        </p>
      </div>
      <section className="space-y-3 text-sm leading-relaxed md:text-base">
        <h2 className="text-lg font-bold text-mobile-ink">Overview</h2>
        <p>
          Kvile (&ldquo;we&rdquo;, &ldquo;us&rdquo;) runs this site so you can
          browse venues, book stays, and manage a host profile.
        </p>
      </section>
      <section className="space-y-3 text-sm leading-relaxed md:text-base">
        <h2 className="text-lg font-bold text-mobile-ink">
          What we keep on this device
        </h2>
        <ul className="list-inside list-disc space-y-2">
          <li>
            <strong>Sign-in:</strong> your session stays in this browser until
            you log out.
          </li>
          <li>
            <strong>Saved stays:</strong> venues you heart are stored only in
            this browser.
          </li>
          <li>
            <strong>Account data:</strong> your profile, venues, and bookings
            are stored with your account so you can sign in on another device
            and still see them.
          </li>
        </ul>
      </section>
      <section className="space-y-3 text-sm leading-relaxed md:text-base">
        <h2 className="text-lg font-bold text-mobile-ink">Your choices</h2>
        <p>
          Log out to end the session on this browser. You can also clear this
          site&apos;s data in your browser settings to remove saved stays.
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
