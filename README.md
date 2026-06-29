# Global Job Pulse

Global Job Pulse is a Next.js platform that tracks job openings from multiple sources and turns them into trend intelligence.

It answers questions like:

- Which categories are rising or falling right now?
- Is Machine Learning still outpacing Cybersecurity?
- Which regions and countries are showing the strongest demand?

The app is built for Vercel deployment with server-side data fetching, cached analytics snapshots, and API routes for integration.

## What It Includes

- Multi-source ingestion pipeline (RemoteOK, Arbeitnow, Greenhouse)
- Taxonomy normalization into categories and sectors
- Trend engine for 30-day current vs previous window comparisons
- Dashboard for demand momentum, category velocity, country demand, and source health
- Fallback global seed feed so the UI remains useful even if live sources fail
- Public JSON APIs for trends and latest openings

## Stack

- Next.js 16 (App Router, TypeScript)
- Tailwind CSS v4
- Server components + route handlers
- `unstable_cache` for periodic snapshot refresh

## Local Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## API Endpoints

- `GET /api/trends`
	- Returns the full analytics snapshot:
		- category trends
		- sector trends
		- timeline
		- top countries
		- source status

- `GET /api/openings?limit=40`
	- Returns latest normalized openings
	- `limit` range is clamped to `1..200`

## Project Structure

- `src/lib/job-intel/sources.ts`: live source adapters and normalization
- `src/lib/job-intel/seed.ts`: synthetic fallback feed
- `src/lib/job-intel/trends.ts`: trend calculations
- `src/lib/job-intel/service.ts`: cached analytics snapshot orchestration
- `src/app/page.tsx`: main dashboard UI
- `src/app/api/trends/route.ts`: trends API
- `src/app/api/openings/route.ts`: openings API

## Deploy To Vercel

1. Push this repository to GitHub.
2. Import it into Vercel.
3. Framework preset: `Next.js` (auto-detected).
4. Build command: `npm run build`.
5. Output setting: default Next.js output (no custom output dir required).
6. Deploy.

No required environment variables for baseline functionality.

## Notes

- Live source APIs can occasionally throttle or change payloads.
- When live data drops below a threshold, a synthetic fallback dataset is blended in to keep trend visualizations stable.
- This makes the product resilient for demos and early deployment while you iterate on additional real sources.
