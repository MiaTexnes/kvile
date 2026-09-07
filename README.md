# Kvile

Front end for Noroff Project Exam 2. It is a holiday booking site on the Holidaze API: guests browse venues, search, check a calendar, and book. Venue managers can create and edit listings and see who booked them.

Live demo: [kvile.netlify.app](https://kvile.netlify.app)  
Repo: [github.com/MiaTexnes/kvile](https://github.com/MiaTexnes/kvile)

There is no custom backend. All data comes from `https://v2.api.noroff.dev`.

I named the product Kvile (Norwegian for rest / quiet) instead of Holidaze. Cream background, teal buttons, Fraunces on the large headings. Dates are chosen on the venue page, not in the home search bar.

## Stack

- React 19, TypeScript, Vite
- Tailwind CSS v4
- React Router
- TanStack Query, React Hook Form, Zod
- react-day-picker for the availability calendar

Hosted on Netlify.

## Setup

You need Node 20+ (18 usually works). To register a test user you need a `@stud.noroff.no` email — the form enforces that.

```bash
npm install
copy .env.example .env
```

Open `.env` and add your Noroff API key:

```
VITE_API_BASE_URL=https://v2.api.noroff.dev
VITE_NOROFF_API_KEY=paste-key-here
```

No trailing slash on the base URL. Create a key from the [API key docs](https://docs.noroff.dev/docs/v2/auth/api-key) after you log in (`POST /auth/create-api-key`, copy `data.key`).

```bash
npm run dev
```

Restart the dev server after you change `.env`. Vite only reads env vars at startup.

If the API key is missing, public venue pages still load, but login, bookings, profile, and manager tools will fail.

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

**Session.** Token, name, email, and the venue-manager flag sit in `sessionStorage`. Closing the tab logs you out. On load the app re-fetches the Holidaze profile so `venueManager` stays in sync with the API.

**Register.** `POST /auth/register` does not return a token. After a successful sign-up the app logs you in automatically. Tick “Register as venue manager” for host tools; leave it off for a customer.

**Calendar.** There is no free-dates endpoint. The venue page loads `GET /holidaze/venues/:id?_bookings=true` and disables days that overlap a booking. Check-in through check-out are both blocked, in the browser’s local timezone.

**Profile URLs.** Holidaze `GET/PUT /holidaze/profiles/<name>` expects a lowercase slug. The app lowercases the name when it builds those paths. The UI can still show mixed case.

**Avatar.** Optional. If you save one, `PUT /holidaze/profiles/<name>` needs a public `https` URL. Private or broken links return 400.

**Create / edit / delete venue.** `POST` / `PUT` / `DELETE` `/holidaze/venues`. You need a venue-manager profile and `VITE_NOROFF_API_KEY`. Body shape matches [Create venue](https://docs.noroff.dev/docs/v2/holidaze/venues). [Swagger](https://v2.api.noroff.dev/docs/static/index.html) is useful if a request fails. Edit and bookings pages also check that you own the venue, so another host’s id in the URL will not open their form.

**Blocking dates.** Holidaze has no block-dates API. On `/manager/venues/:id/bookings` a manager creates a 1-guest hold booking. Those nights then show as unavailable on the public calendar. “Remove block” deletes that hold. Guest bookings are not deleted from this screen.

## Pages

| Path | Who |
| --- | --- |
| `/` | Home — search and listings |
| `/venues` | Full catalogue and filters |
| `/venues/:id` | Venue, calendar, booking |
| `/hosts/:hostName` | Venues by that host |
| `/contact`, `/privacy`, `/terms` | Extra pages |
| `/login`, `/register` | Auth |
| `/my-bookings`, `/profile` | Signed in |
| `/manager/venues` | Your listings (managers) |
| `/manager/venues/new` | Create a venue |
| `/manager/venues/:id/edit` | Edit or delete |
| `/manager/venues/:id/bookings` | Bookings and date blocks |

Search can use `q`, `guests`, `pets=1`, `topRated`, `sort`, and `view=saved`.

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
2. Search — results come from `/holidaze/venues/search?q=`.
3. Open a venue — photo, description, price, amenities, location.
4. Calendar — booked days are disabled; pick a free check-in and check-out.
5. Register a customer (`stud.noroff.no`, manager box off). You should already be logged in.
6. Book — confirmation, then the trip under **My bookings**.
7. Log out from the desktop header, or the mobile menu / Profile page. `/my-bookings` should send you to login.
8. Log in again — session comes back from `sessionStorage` until you close the tab.
9. Profile — paste a public image URL for the avatar, or leave it blank.
10. Register a second account as a venue manager (tick the box). Host tools should appear.
11. Create a venue — it shows in the manager list.
12. Edit it — the change is still there after refresh.
13. Open **Bookings** for that venue — dates and guest counts (and the customer when the API sends it).
14. Block a free range, confirm the checkbox, save. Those days should be unavailable on the public calendar. Remove block to free them.
15. Delete the venue in the confirm dialog. It leaves the manager list.
16. Clone the repo, `npm install`, `npm run dev` — should match these notes.

## Where things live

- `src/lib/api.ts` — fetch wrapper and Holidaze endpoints
- `src/lib/availability.ts` — which calendar days are taken
- `src/lib/managerVenueBooking.ts` — host hold / block rows
- `src/lib/filterVenues.ts` — catalogue filters
- `src/context/AuthContext.tsx` — login, register, logout, session
- `src/pages/` — screens
- `src/pages/Manager/` — venue CRUD and bookings

## Links

- Demo: https://kvile.netlify.app
- Repo: https://github.com/MiaTexnes/kvile
- API: https://docs.noroff.dev/docs/v2/holidaze/venues
- Swagger: https://v2.api.noroff.dev/docs/static/index.html

Kanban, Gantt, and Figma are in the Moodle hand-in.
