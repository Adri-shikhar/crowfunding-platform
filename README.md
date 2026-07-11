# 🌱 FundSpring — Where good ideas grow

FundSpring is a **credit-based crowdfunding platform** (a MERN job-assessment
project). Supporters back admin-reviewed campaigns with credits, creators launch
projects and withdraw what they raise, and admins keep the marketplace fair.

This repository is the **client** (Next.js 16 App Router + React 19 + TypeScript
+ Tailwind v4 + HeroUI v3 + Firebase Auth). A separate Express/MongoDB server
will be wired in later — every backend call already goes through a single API
wrapper (`src/lib/api.ts`), which is currently backed by a fully-typed in-browser
mock (`src/data/*`). Flip it to the real server by setting `NEXT_PUBLIC_API_URL`.

**Live URL:** _https://your-fundspring-client.vercel.app_ &nbsp;·&nbsp; _(placeholder — update after deploy)_

---

## ✨ Features

1. **Role-based accounts** — Supporter, Creator, and Admin, each with its own
   themed dashboard (distinct accent colors) and role-guarded routes.
2. **Firebase auth** — email/password **and** Google sign-in, with a secret
   access token persisted to `localStorage`. Private routes survive a hard
   reload without bouncing to `/login` (gated on `onAuthStateChanged`).
3. **Starter credits, granted once** — Supporters get **50**, Creators get
   **20** on registration, and never again on subsequent logins.
4. **Animated marketing home** — hero Swiper (3 banners), top-funded campaigns,
   how-it-works, explore-by-category, animated impact counters, testimonials
   slider — all with real, on-theme copy (no Lorem ipsum).
5. **Discover & fund** — filterable/searchable campaign explorer and rich
   campaign detail pages with a live contribution form.
6. **Contribution lifecycle** — supporters pledge (credits held → pending);
   creators **Approve** (adds to campaign raised) or **Reject** (auto-refund).
7. **Creator tools** — create a campaign (imgBB cover upload → pending review),
   manage/edit/delete campaigns (delete refunds approved backers), and review
   incoming contributions with a details modal.
8. **Withdrawals** — creators cash out raised credits (20 credits = $1), gated
   at a **200-credit minimum**; admins mark payouts successful.
9. **Purchase credits with Stripe** — real Checkout via a Next.js route handler
   (`/api/checkout`); 10 credits = $1, with tiered bonus packages.
10. **Admin control center** — approve/reject campaigns, process withdrawals,
    manage users (change role / remove), manage & delete campaigns, resolve
    reports (suspend or dismiss).
11. **Live notifications** — a bell popup lists messages addressed to the current
    user (newest first) on every contribution, approval, rejection, campaign
    decision, and withdrawal payout.
12. **Fully responsive + dark mode** — mobile / tablet / desktop across the
    public site *and* the dashboards, with a no-flash theme toggle.

---

## 🔐 Demo accounts

The mock backend is seeded with these profiles. To sign in, **register a Firebase
account using the same email** (any password you like) — the app links your login
to the seeded role/credits by email.

| Role      | Email (placeholder)     | Password           | Notes                          |
| --------- | ----------------------- | ------------------ | ------------------------------ |
| **Admin** | `admin@fundspring.io`   | _set on register_  | Claims the seeded admin profile |
| Creator   | `noah@fundspring.io`    | _set on register_  | Has raised credits to withdraw  |
| Supporter | `lena@fundspring.io`    | _set on register_  | Has credits + contributions     |

> Or just **Register** a brand-new Supporter/Creator account to explore from
> scratch. New emails become supporters/creators (never admin).

---

## 🧱 Tech & structure

- **Next.js 16** (App Router, Turbopack) · **React 19** · **TypeScript**
- **Tailwind v4** semantic tokens (light/dark + per-role accents) · **HeroUI v3**
- **Firebase Auth** · **Swiper** (sliders) · **react-icons** · **Stripe** · **imgBB**

```
src/
  app/                     # routes (public + dashboard/{supporter,creator,admin})
    api/checkout/route.ts  # Stripe Checkout session (mock fallback w/o key)
  components/<Name>/        # reusable UI (index barrels)
  contexts/AuthContext.tsx  # Firebase + role/credits/token
  lib/
    api.ts                 # THE single apiReq wrapper (mock ⇄ real switch)
    dashboard.ts           # role config, sidebar links, themes
    utils.ts, useApi.ts, imgbb.ts, site.ts
  data/                    # typed mock backend (seed.ts + mockDb.ts) — swap later
```

---

## 🚀 Getting started

```bash
npm install
cp .env.example .env      # fill in the values below
npm run dev               # http://localhost:3000
```

### Environment variables (`.env`)

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_FIREBASE_*` | Firebase web config (auth) |
| `NEXT_PUBLIC_API_URL` | **Leave empty** to use the mock backend; set to the Express URL to go live |
| `NEXT_PUBLIC_IMGBB_API_KEY` | imgBB key for profile/cover uploads |
| `STRIPE_SECRET_KEY` | Stripe secret (server) — checkout falls back to a mock URL if unset |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key |

All secrets are read from env vars — nothing is hardcoded.

### Scripts

```bash
npm run dev     # dev server
npm run build   # production build
npm start       # serve the production build
npm run lint    # eslint
```

---

## 🔄 Switching from mock to the real server

1. Build the Express API with matching routes (`/users`, `/campaigns`,
   `/contributions`, `/payments`, `/withdrawals`, `/notifications`, `/reports`,
   `/stats/*`).
2. Set `NEXT_PUBLIC_API_URL=https://your-api-host`.
3. Done — `apiReq` stops calling the mock and hits the network with the Bearer
   token. Then delete `src/data/seed.ts` and `src/data/mockDb.ts`.
