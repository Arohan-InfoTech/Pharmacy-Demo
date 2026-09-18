<<<<<<< HEAD
# MedTrack — Pharmacy Management (Frontend Only)

A frontend-only prototype for pharmacy/medical store management. No backend or database —
all data (medicines, sales, staff accounts) lives in the browser's `localStorage`, so it
runs entirely standalone and deploys as a static site.

## Features
- Billing (POS): search medicines, add to cart, generate a bill — stock updates instantly
- Sales history with client-side PDF invoice download (via jsPDF)
- Inventory management: add/edit/delete medicines, low-stock and expiring-soon alerts
- Dashboard: revenue, bills generated, top-selling medicines, alerts
- Login / "Register your store" (first user becomes the store admin)
- Staff accounts (admin can add staff logins)

## Run locally
```
npm install
npm run dev
```
Open the printed local URL. A demo admin account is seeded automatically:
`admin@medtrack.com` / `admin123` (pre-filled on the login page).

Or register a brand new store from the Register page — this wipes in with fresh, empty data
for that store's admin account.

## Deploy free (Vercel)
1. Push this folder to a GitHub repo
2. On https://vercel.com → New Project → import the repo
3. Framework preset: Vite (auto-detected)
4. Deploy — no environment variables needed, since there's no backend

## Important limitations (by design, since this is frontend-only)
- **Data is per-browser.** Nothing syncs across devices — it's stored in that browser's
  localStorage only. Clearing browser data wipes it.
- **Not secure.** Passwords are stored in plain text in localStorage — fine for a demo/
  prototype, never for production.
- **Single device only.** There's no real multi-user or multi-device sync, which your
  original "cloud sync across devices" requirement needs a real backend for.

## Upgrading to a real backend later
The `src/data/db.js` file is the only place that touches storage — every page calls
functions like `db.listMedicines(session)`, `db.createSale(...)`, etc. To add a real
backend, you'd replace the internals of `db.js` with `fetch()` calls to an API (the
MERN backend built earlier for this project is a ready starting point) while keeping
the same function names, so the pages don't need to change.
=======
# Pharmacy-Demo
This is a demo website for Pharmacy clients by Arohan InfoTech
>>>>>>> 7caa62f71104b1f1259c1bf989a6ed2d83933b2f
