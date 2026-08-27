# Kvile — exam front end

Customer-facing **venue discovery, search, detail, and booking** plus **venue manager** tools to create, update, delete venues, inspect bookings, and block dates. **Kvile** is the product name used in this repo; data comes from the **Noroff Holidaze API** (`v2.api.noroff.dev`).

## Visual design

The **home page** pairs **Fraunces** (marketing headline) with **Inter** / **Manrope** body type on a warm cream background (`#f5f4f1`) and a **botanical teal** brand (`--color-holidaze-blue: #0f766e`, primary action `#127a6c`) with a terracotta/clay accent. A full-bleed hero photo sits under a transparent header with the headline **“Find Your Place of Peace”** and a **pill search bar** (place / keywords / guests / pets — dates are chosen later on the venue page). Below it, a **Recommended stays** section opens pre-filtered to Top Rated (≥4.5) + WiFi + Parking, with **filter pills** (Top Rated · Breakfast · Pets · WiFi · Parking), a **sort select** (price / rating), **four-column** listing cards (heart, rating, location, teal price) on desktop and a stacked featured layout on mobile. Color tokens, hero gradients, and the day-picker theme live in [`src/index.css`](src/index.css). Inner pages reuse the same tokens via the `.app-page-bg` backdrop.

## Stack (approved)

- **React 19** + **TypeScript** + **Vite**
- **Tailwind CSS v4**
- **React Router v7**
- **TanStack Query**, **React Hook Form**, **Zod**
- **react-day-picker** for the availability calendar

## Prerequisites

- **Node.js** 20+ recommended (18 LTS should work)
- A **stud.noroff.no** email for registering test accounts (enforced in the register form to match the brief)

## Setup

```bash
npm install
```

Copy environment template and add your Noroff API key (see **API notes** below):

```bash
copy .env.example .env
```

`VITE_API_BASE_URL` must have **no trailing slash**, e.g. `https://v2.api.noroff.dev`.
`VITE_NOROFF_API_KEY` must be set for **every** authenticated Noroff Holidaze request (profiles, bookings, manager tools). If it is missing, the app throws a clear error before calling the API. **Restart** `npm run dev` after you change `.env` — Vite only injects env vars at startup.

## Scripts

| Command | Description |
| ------- | ----------- |
| `npm run dev` | Local dev server (Vite) |
| `npm run build` | Typecheck + production bundle to `dist/` |
| `npm run preview` | Serve `dist` locally |
| `npm run lint` | ESLint |
| `npm run test` | Vitest unit/component tests (headless) |

## API notes (important for testers)

1. **Login (`_holidaze=true`)** — The app calls
   `POST /auth/login?_holidaze=true`
   so the JWT and profile match the Noroff Holidaze module. Do **not** omit `_holidaze=true`.

2. **Authorization** — Noroff **v2** expects **both**:
   `Authorization: Bearer <accessToken>` (from login) **and**
   `X-Noroff-API-Key` (one key per **app**, from `POST /auth/create-api-key` — see [.env.example](.env.example) and [API keys](https://docs.noroff.dev/docs/v2/auth/api-key)). Without the key header, authenticated routes often return **401** even after a valid login.

3. **Session** — `accessToken`, name, email, and venue-manager flag live in **`sessionStorage`**. The app **re-fetches** your Noroff Holidaze profile on load so **`venueManager`** stays in sync with the API (`holidazeFetch` sends Bearer + optional API key on those calls).

4. **Register** — `POST /auth/register` does **not** return a token; the app **logs in automatically** after a successful registration.

5. **Availability** — There is no dedicated “free dates” endpoint. The UI loads
   `GET /holidaze/venues/<id>?_bookings=true`
   and **disables calendar days** that overlap existing bookings.
   **Rule used here:** each booking blocks **every calendar day from `dateFrom` through `dateTo`, inclusive**, interpreted in the **user’s local timezone**.

6. **Profile URLs** — Noroff Holidaze `GET/PUT /holidaze/profiles/<name>` routes expect the **lowercase** profile slug. The app normalizes the `name` from login when building those paths (display name casing can still be mixed in the UI).

7. **Avatar** — Saving an avatar image is **optional** until you paste a URL on **Profile** and submit. When you do send one, `PUT /holidaze/profiles/<name>` expects **`avatar.url`** to be **publicly reachable** over `https`; private or bad URLs return **400**.

8. **Manager — create / edit / delete venue** — These use `POST` / `PUT` / `DELETE` `/holidaze/venues` and require a **venue manager** profile, **`VITE_NOROFF_API_KEY`**, and a **restarted dev server** after editing `.env`. Request body shape matches [Holidaze Venues → Create venue](https://docs.noroff.dev/docs/v2/holidaze/venues). Use [Swagger UI](https://v2.api.noroff.dev/docs/static/index.html) to inspect the live schema. To obtain an app key, use [`POST /auth/create-api-key`](https://docs.noroff.dev/docs/v2/auth/api-key) or the [API Key Tool](https://docs.noroff.dev/docs/v2/auth/api-key#api-key-tool) in the docs (login, then create key); paste **`data.key`** into **`VITE_NOROFF_API_KEY`**.

9. **Manager date blocks** — There is no separate Holidaze “block dates” API.
   A venue manager blocks nights by creating a **hold booking** on their own venue
   (`POST /holidaze/bookings` with `guests: 1`) from
   `/manager/venues/:id/bookings`. Those nights then appear unavailable on the
   guest calendar. Holds are listed as “Blocked dates”; **Remove block** deletes
   that booking. Guest reservations are not deleted from this UI.

## Routes

Full map (access rules, query strings, diagram): **[docs/route-map.md](docs/route-map.md)**.

| Path | Who |
| ---- | --- |
| `/` | Home — hero, search, venue listings |
| `/venues` | Full venue catalogue + filters |
| `/venues/:id` | Venue detail, calendar, booking |
| `/hosts/:hostName` | Venues by host profile |
| `/contact` | Contact form |
| `/privacy`, `/terms` | Legal pages |
| `/login`, `/register` | Auth |
| `/my-bookings`, `/profile` | Signed-in customer |
| `/manager/venues`, `/manager/venues/new`, `/manager/venues/:id/edit`, `/manager/venues/:id/bookings` | Venue manager |

## Hosting (Netlify)

1. Connect the Git repo; set **production branch** to **`main`**.
2. Build command: `npm run build`, publish directory: `dist`.
3. SPA fallback is configured in **`netlify.toml`** and **`public/_redirects`**.
4. Set **`VITE_NOROFF_API_KEY`** in Netlify (required for auth against the live API), and **`VITE_API_BASE_URL`** only if you override the default host.

## Delivery links

Fill out **[DELIVERY-LINKS.md](./DELIVERY-LINKS.md)** with your Gantt, Figma/XD/Sketch links, kanban board, repo, and live demo for Moodle.

## Manual test script (assessors)

1. Open the **hosted** home page — venue cards load.
2. **Search** — results update from `/holidaze/venues/search?q=`.
3. Open a **venue** — media, description, price, meta, location render.
4. **Calendar** — booked periods are disabled; pick a free check-in / check-out range.
5. **Register** a **customer** (`stud.noroff.no`, leave manager unchecked) — you should land logged in.
6. **Book** — confirmation message; booking appears under **My bookings** (upcoming filter).
7. **Log out** — Use **Log out** in the desktop header, the **Log out** icon beside **Account** on the **mobile home** top bar, or **Sign out** on **Profile**. Protected routes should redirect to login afterward.
8. **Log in** again — session restored from `sessionStorage`.
9. **Profile** — Optionally set **avatar** with a known public image URL (e.g. Wikimedia), or leave the field blank.
10. **Register** a **manager** (second account, check “venue manager”) — after login, **Host** / manager routes should appear.
11. **Create venue** — appears in the manager list.
12. **Edit venue** — change saves; persists after refresh.
13. **Bookings** (manager) — open **Bookings** for that venue; reservation ranges and guest counts are listed (customer object appears when the API embeds it).
14. **Block dates (manager)** — On a venue’s Bookings page, pick a free range,
    confirm the checkbox, Save block. Those days show as unavailable on the
    public venue calendar. Remove block restores them.
15. **Delete venue** — confirm dialog; venue disappears from manager list.
16. Clone repo fresh, `npm install`, `npm run dev` — matches these instructions.

## Project structure (high level)

- `src/lib/api.ts` — `fetch` wrapper + Noroff endpoints
- `src/lib/availability.ts` — date blocking helpers
- `src/lib/managerVenueBooking.ts` — detect manager hold / block rows
- `src/lib/hostBookingFeed.ts` — guest-only bookings for host dashboard cards
- `src/lib/filterVenues.ts` — Catalogue filters (top-rated, amenities, guests)
- `src/lib/venueFavorites.ts` — client-side favorite storage
- `src/context/AuthContext.tsx` — session + login/register/logout
- `src/components/Alert.tsx` — reusable `role="alert"`/`role="status"` banner
- `src/components/ErrorBoundary.tsx` — top-level catch for render errors (accessible recovery screen)
- `src/components/Icons.tsx` — shared inline SVG icons
- `src/components/SkipLink.tsx` — keyboard skip-to-content link
- `src/pages/*` — screens
- `src/pages/manager/*` — venue CRUD + manager bookings

## Exam coverage notes

The project is built around Project Exam 2's ten grading points:

**Best practices**
- **JS:** React 19 + TS, small modules, no runtime ESLint errors (`npm run lint`), unit tests (`npm run test`), TanStack Query for cache/refetch, React Hook Form + Zod for forms.
- **CSS:** Tailwind v4 with design tokens in `src/index.css`, no stray IDs, consistent focus + reduced-motion rules.
- **HTML:** Semantic landmarks (`<header>`, `<main id="main-content">`, `<nav aria-label="Primary">`, `<footer>`), meta description/OG/Twitter/`<noscript>` in `index.html`, WCAG alt text on all content images.

**User experience**
- **Error handling:** Reusable `Alert` with `role="alert"`/`aria-live="assertive"` for errors, `role="status"`/`aria-live="polite"` for loading and success.
- **Form validation + accessibility:** Forms use `htmlFor`/`id` labels, `aria-invalid`, `aria-describedby`, and inline `role="alert"` errors where fields are validated. Required fields use `required` + matching Zod rules; optional fields (e.g. profile avatar) omit `required` but still expose hints.
- **Navigation accessibility:** "Skip to main content" link, visible focus outlines everywhere, keyboard-operable calendar and mobile bottom nav with `aria-current="page"`.

**Design appeal**
- **Theme:** Bespoke botanical-teal palette (`brand-*` / `holidaze-blue`, cream `#f5f4f1`, terracotta accent) with Fraunces display + Manrope/Inter body; distinct desktop + mobile shells.
- **WCAG color:** Interactive text colors are checked against a 4.5:1 minimum; error text uses `red-700` on white, success on emerald/amber surfaces.
- **Responsive:** Mobile-first; dedicated mobile home shell, breakpoints at `md:` and `lg:` for list grids, bottom-nav on mobile.

Run the full quality check before delivery:

```bash
npm run lint
npm run build
npm run test
```

---

© Student project — **Kvile** (Noroff Project Exam 2 / Holidaze API). Front end only; all data from **`https://v2.api.noroff.dev`**.