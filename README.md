# iptrace — IP Lookup & Geolocation

A modern dark-mode IP geolocation tool built with Next.js 15, TypeScript, and Tailwind CSS.

## Features

- **IP Lookup** — Enter any IPv4 or IPv6 address to get country, city, region, ISP, ASN, timezone, and coordinates
- **My IP** — Automatically detect and display your public IP with a Refresh button
- **Google Maps** — Embedded map preview + direct link for every result
- **Copy IP** — One-click clipboard copy
- **Toast notifications** — Success, error, and info feedback
- **Validation** — Client-side IPv4/IPv6 format validation
- **Edge Runtime** — API routes run on Vercel Edge for minimal latency

## Tech Stack

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- Fetch API (no external SDK dependencies)
- [ipwho.is](https://ipwho.is) — free public geolocation API, no key required

## Deploy to Vercel

```bash
# 1. Push to GitHub
git init && git add . && git commit -m "init"
gh repo create ip-lookup --public --push

# 2. Deploy via Vercel CLI
npx vercel --prod

# OR import directly at https://vercel.com/new
```

No environment variables required — works out of the box.

## Local Development

```bash
npm install
npm run dev
# Open http://localhost:3000
```

## Project Structure

```
ip-lookup/
├── app/
│   ├── api/
│   │   ├── lookup/route.ts     # GET /api/lookup?ip=...
│   │   └── myip/route.ts       # GET /api/myip
│   ├── ip-lookup/page.tsx      # IP Lookup page
│   ├── my-ip/page.tsx          # My IP page
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx                # Landing/home
├── components/
│   ├── IPResultCard.tsx        # Shared result display
│   ├── Navbar.tsx
│   ├── Spinner.tsx
│   └── ToastProvider.tsx       # Toast context + UI
├── lib/
│   └── utils.ts                # IP validation, helpers
├── types/
│   └── index.ts
├── vercel.json
└── package.json
```
