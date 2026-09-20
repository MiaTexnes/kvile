# Kvile

Front end for Noroff Project Exam 2. It is a holiday booking site on the Holidaze API: guests browse venues, search, check a calendar, and book. Venue managers can create and edit listings and see who booked them.

Live demo: [kvile.netlify.app](https://kvile.netlify.app)
Repo: [github.com/MiaTexnes/kvile](https://github.com/MiaTexnes/kvile)

There is no custom backend. All data comes from `https://v2.api.noroff.dev`.

I named the product Kvile (Norwegian for rest / quiet) instead of Holidaze. Cream background, teal buttons, Fraunces on the large headings, Manrope for the rest. Dates are chosen on the venue page, not in the home search bar.

## Stack

- React 19, TypeScript, Vite — this is the course default. Vite is just the fastest way to run a React SPA.
- Tailwind v4 — utility classes, tokens live in `src/index.css`
- React Router — URLs like `/venues/:id` without a full reload
- TanStack Query — venues and bookings come from the API. I didn’t want a pile of `useEffect` fetches.
- React Hook Form + Zod — login, register, booking, profile, host form
- react-day-picker + date-fns — calendar on the venue page (and on the manager bookings page)
- Vitest — helpers plus a couple of page / route tests
- Netlify — static host, SPA fallback

Not using Next.js, Redux, or Bootstrap. Don’t need a server, and Redux is overkill when Query already holds server state.

## Setup

You need Node 20.19 or newer. Vite 8 will not run on 18. To register a test user you need a `@stud.noroff.no` email — the form enforces that.

```bash
npm install
```

Copy `.env.example` to `.env` (`copy` on Windows, `cp` on Mac/Linux).

Open `.env` and add your Noroff API key:

```
VITE_API_BASE_URL=https://v2.api.noroff.dev
VITE_NOROFF_API_KEY=paste-key-here
```

No trailing slash on the base URL (the app strips one if you add it). Create a key from the [API key docs](https://docs.noroff.dev/docs/v2/auth/api-key) after you log in (`POST /auth/create-api-key`, copy `data.key`).

```bash
npm run dev
```

Restart the dev server after you change `.env`. Vite only reads env vars at startup.

If the API key is missing, public venue pages still load. Anything that needs a logged-in token (bookings, profile, manager tools) will fail. Login / register can look like they work, then the next authenticated request dies.

| Command | What it does |
| --- | --- |
| `npm run dev` | Local dev server |
| `npm run build` | Typecheck + production bundle in `dist/` |
| `npm run preview` | Serve the build |
| `npm run lint` | ESLint |
| `npm run test` | Vitest |

## Notes for testers

These are the things that usually go wrong.

**Login.** The app calls `POST /auth/login?_holidaze=true` so the token matches the Holidaze module. Do not drop `_holidaze=true`.

**API key.** Noroff v2 wants both `Authorization: Bearer <token>` and `X-Noroff-API-Key`. One key per app, from `POST /auth/create-api-key` (see [.env.example](.env.example) and the [API key docs](https://docs.noroff.dev/docs/v2/auth/api-key)). Without the key header you often get 401 even after a valid login. The live site has this set in Netlify.

**Session.** Token, name, email, and the venue-manager flag sit in `sessionStorage`. Closing the tab logs you out. On load the app re-fetches the Holidaze profile so `venueManager` stays in sync with the API. Hearts (saved venues) are in `localStorage`, so those survive a new tab and a browser restart.

**Register.** `POST /auth/register` does not return a token. After a successful sign-up the app logs you in automatically. Tick “Register as venue manager” for host tools; leave it off for a customer. You can also turn hosting on later from Profile.

**Search.** Typed search hits `/holidaze/venues/search?q=`, then the app also pulls in a couple of browse pages and filters guests / pets / top rated in the browser. So “2 guests, pets, oslo” is not sent to the API as one raw `q` string.

**Calendar.** There is no free-dates endpoint. The venue page loads `GET /holidaze/venues/:id?_bookings=true` and disables days that overlap a booking. Check-in through check-out are both blocked, in the browser’s local timezone.

**Profile URLs.** Holidaze `GET/PUT /holidaze/profiles/<name>` is picky about casing. The app tries the name as typed, then a lowercase slug. The UI can still show mixed case.

**Avatar.** Optional. If you save one, `PUT /holidaze/profiles/<name>` wants a public `https` URL. Private or broken links return 400. Bio and banner are on the same form; leave them blank if you do not care.

**Create / edit / delete venue.** `POST` / `PUT` / `DELETE` `/holidaze/venues`. You need a venue-manager profile and `VITE_NOROFF_API_KEY`. Body shape matches [Create venue](https://docs.noroff.dev/docs/v2/holidaze/venues). [Swagger](https://v2.api.noroff.dev/docs/static/index.html) is useful if a request fails. Edit and bookings pages also check that you own the venue, so another host’s id in the URL will not open their form. Delete is on the manager list and on the edit page.

**Blocking dates.** Holidaze has no block-dates API. On `/manager/venues/:id/bookings` a manager creates a 1-guest hold booking. Those nights then show as unavailable on the public calendar. “Remove block” deletes that hold. Guest bookings are not deleted from this screen.

## Pages

| Path | Who |
| --- | --- |
| `/` | Home — search and listings |
| `/venues` | Full catalogue and filters |
| `/venues/:id` | Venue, calendar, booking |
| `/venues?view=saved` | Hearted venues (saved in this browser) |
| `/hosts/:hostName` | Venues by that host |
| `/contact`, `/privacy`, `/terms` | Extra pages |
| `/login`, `/register` | Auth |
| `/my-bookings`, `/profile` | Signed in |
| `/manager/venues` | Your listings (managers) |
| `/manager/venues/new` | Create a venue |
| `/manager/venues/:id/edit` | Edit or delete |
| `/manager/venues/:id/bookings` | Bookings and date blocks |
| anything else | 404 |

Search can use `q`, `guests`, `pets=1`, `topRated`, `sort` (`newest`, `price-asc`, `rating-desc`), and `view=saved`. Wifi / parking / breakfast pills stay in the UI, they are not in the URL.

## Hosting

The demo is on Netlify.

- Production branch: `main`
- Build: `npm run build`
- Publish folder: `dist`
- SPA fallback: `netlify.toml` and `public/_redirects`
- `VITE_NOROFF_API_KEY` must be set in Netlify or logged-in flows break on the live site

## How to test it

Use the [hosted site](https://kvile.netlify.app) if you can, so you are on the same build as Moodle.

1. Home loads venue cards.
2. Search a place. You can add guests or “pets” in the box; booked dates are still only on the venue page.
3. Open a venue — photo, description, price, amenities, location.
4. Calendar — booked days are disabled; pick a free check-in and check-out.
5. Register a customer (`stud.noroff.no`, manager box off). You should already be logged in.
6. Book — confirmation, then the trip under **My bookings**.
7. Heart a venue. It should still be there under saved stays after a refresh.
8. Log out from the desktop header, or the mobile menu / Profile page. `/my-bookings` should send you to login.
9. Log in again — session comes back from `sessionStorage` until you close the tab.
10. Profile — paste a public `https` image URL for the avatar, or leave it blank.
11. Register a second account as a venue manager (tick the box). Host tools should appear.
12. Create a venue — it shows in the manager list.
13. Edit it — the change is still there after refresh.
14. Open **Bookings** for that venue — dates and guest counts (and the customer when the API sends it).
15. Block a free range, confirm the checkbox, save. Those days should be unavailable on the public calendar. Remove block to free them.
16. Delete the venue in the confirm dialog (list or edit page). It leaves the manager list.
17. Clone the repo, `npm install`, copy `.env.example` to `.env`, paste the API key, `npm run dev` — should match these notes.

## Where things live

- `src/lib/api/` — fetch wrapper and Holidaze endpoints (auth, venues, bookings, profiles)
- `src/lib/availability.ts` — which calendar days are taken
- `src/lib/managerVenueBooking.ts` — host hold / block rows
- `src/lib/filterVenues.ts` — catalogue filters
- `src/lib/parseVenueSearchQuery.ts` — “2 guests, pets, oslo” in the search box
- `src/lib/venueFavorites.ts` — saved hearts
- `src/context/AuthContext.tsx` — login, register, logout, session
- `src/pages/` — screens
- `src/pages/Manager/` — venue CRUD and bookings

## Links

- Demo: https://kvile.netlify.app
- Repo: https://github.com/MiaTexnes/kvile
- API: https://docs.noroff.dev/docs/v2/holidaze/venues
- Swagger: https://v2.api.noroff.dev/docs/static/index.html

Kanban, Gantt, and Figma are in the Moodle hand-in.
