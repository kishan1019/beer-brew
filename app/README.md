# Bubble & Bottle

A real implementation of the "Personalized Beer Brewing App" design (`project/Brewhouse.dc.html`) from the Claude Design handoff bundle in the repo root. Guests redeem a batch code to follow their brew day-by-day; the host runs everything from a console behind a password.

## Stack

- **frontend/** — React + TypeScript + Vite + Tailwind v4. Talks to the API over `fetch`, cookie-based sessions.
- **backend/** — Express + TypeScript + SQLite (`better-sqlite3`). File uploads land in `backend/uploads/` and are served statically.

This is a plain, portable stack on purpose so it's easy to run and iterate on locally. When you move this into Lovable, the natural swap is SQLite → Supabase Postgres (the schema in `backend/src/db.ts` maps over directly) and the Express routes → Supabase edge functions or a small API layer — the React frontend and its `lib/api.ts` client can move over largely as-is.

## Running locally

**Backend:**
```
cd backend
npm install
cp .env.example .env      # defaults are fine for local dev
npm run seed               # creates one demo batch, code MALT-482
npm run dev                 # http://localhost:4000
```

**Frontend** (separate terminal):
```
cd frontend
npm install
npm run dev                 # http://localhost:5173, proxies /api to :4000
```

Open http://localhost:5173. Guest side: use code `MALT-482`. Host side: click **Host**, password is `brewhouse` (set `ADMIN_PASSWORD` in `backend/.env` to change it — do this before deploying anywhere real).

## What's implemented

- **Guest**: code redemption, Brew tab (live day/stage/progress/gravity, stage road, sticker badges), Journal tab (host's day-by-day posts with photo/video), Recipe tab (OG/FG/ABV/IBU, grain bill, hops, yeast, process explainer with light/deep toggle), Pickup tab (booking one of three collection slots once bottled).
- **Host**: password-gated console, batch list (active + bottled, progress, guest count, pickup collection count), new batch form with the same HTML-recipe drag-and-drop parser as the original prototype (BeerSmith/Brewfather/Brewer's Friend exports, or any HTML with a grain-bill table — see `project/sample-recipe.html` for a file to try), post-update composer with photo/video upload and gravity/temp/bubble readings, mark-bottled (opens the 20-day pickup window and generates the three collection slots).

## Deliberate departures from the prototype

The `.dc.html` file is a desktop preview of a mobile screen — a phone bezel with a fake `9:41` status bar — because that's how Claude Design lets you preview a mobile layout on a desktop canvas. That bezel isn't part of the product; real guests open this in their own phone's browser, which already has its own status bar. So the implementation drops the bezel and renders a normal responsive mobile-first page instead, while keeping every color, font, spacing, card, and copy choice from the design.

A few other adaptations, since the prototype's `state = {...}` was local-only and this app has a real backend:
- The blank-code shortcut ("just hit the button") is gone — codes are checked against the database and only exact matches unlock a batch.
- Stage timing (brew day → primary → conditioning → bottling → pickup) and stickers are computed from `brewDate` / `bottledAt` instead of being hardcoded to "Day 16."
- The recipe parser only ever produces flat label/value lines (that's what the original `ingest()` does too — it doesn't distinguish fermentables from hops). Grain bill and OG/FG/ABV/IBU are auto-filled from a dropped recipe file; hops and yeast are typed in by hand, since there's no reliable way to tell them apart from a generic export.
- Pickup booking is scoped per-browser (a random guest ID in `localStorage`), since up to 6 guests can share one code and each needs to hold their own slot.

## Known gaps / next steps

- No email/SMS notifications when a batch is bottled or updated — guests need to check the page themselves.
- Single shared host password, not per-user accounts — fine for one host, not for multiple.
- No production deploy config yet (this was built to run and be tested locally first).
