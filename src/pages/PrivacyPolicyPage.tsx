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
        <p className="mt-2 text-sm text-stone-500">Last updated: April 2026</p>
      </div>
      <section className="space-y-3 text-sm leading-relaxed md:text-base">
        <h2 className="text-lg font-bold text-mobile-ink">Overview</h2>
        <p>
          Kvile (&ldquo;we&rdquo;, &ldquo;us&rdquo;) operates this front-end as
          a Noroff coursework project. It connects to the public Noroff Holidaze
          API to list venues, handle bookings, and manage profiles when you sign
          in.
        </p>
      </section>
      <section className="space-y-3 text-sm leading-relaxed md:text-base">
        <h2 className="text-lg font-bold text-mobile-ink">Data we process</h2>
        <ul className="list-inside list-disc space-y-2">
          <li>
            <strong>Session:</strong> your access token, display name, email
            flag, and venue-manager flag are stored in{" "}
            <code className="rounded bg-stone-100 px-1 text-xs">
              sessionStorage
            </code>{" "}
            on this device for the logged-in experience.
          </li>
          <li>
            <strong>Favorites:</strong> venue ids you save on the home screen
            are stored in{" "}
            <code className="rounded bg-stone-100 px-1 text-xs">
              localStorage
            </code>{" "}
            on this browser only.
          </li>
          <li>
            <strong>API data:</strong> venue and booking data are loaded from
            Noroff&apos;s servers. Refer to their documentation for how they
            process account data.
          </li>
        </ul>
      </section>
      <section className="space-y-3 text-sm leading-relaxed md:text-base">
        <h2 className="text-lg font-bold text-mobile-ink">Your choices</h2>
        <p>
          Sign out clears session keys from this browser. You can clear site
          data in your browser settings to remove favorites and tokens. We do
          not operate ad trackers on this demo site.
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
