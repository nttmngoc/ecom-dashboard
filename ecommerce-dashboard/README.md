# Sales Command Center

An interactive retail analytics dashboard prototype, built as a portfolio piece for
Data Analyst / BI-adjacent roles. Mimics a Power BI-style report: KPI cards, cross-filtering
between charts, and clickable slicers — all backed by synthetic mock data (no real
company or customer data).

**Stack:** React + Vite + Recharts. Ships as a static site, deployable to GitHub Pages
with no backend.

## Features

- 4 KPI cards (Revenue, Orders, AOV, Conversion Rate) with animated recompute on filter change
- Cross-filtering: click a category slice or a region bar to filter every other visual
  on the page — the same interaction model as a Power BI report page
- Active filter chips with one-click removal
- Revenue trend, category breakdown, region comparison, and top-products ranking
- Fully responsive down to mobile

## Run locally

```bash
npm install
npm run dev
```

Open the printed local URL (usually http://localhost:5173).

## Deploy to GitHub Pages

1. Create a new GitHub repo and push this project to it.
2. In `vite.config.js`, set `base` to `'/your-repo-name/'` (must match your repo's name exactly).
3. In the repo settings → **Pages**, set the source to **GitHub Actions**.
4. Push to `main`. The included workflow (`.github/workflows/deploy.yml`) builds the
   project and publishes it automatically.
5. Your dashboard will be live at `https://<your-username>.github.io/<repo-name>/`.

That URL is what you link from your CV or portfolio.

## Data

All data in `src/data/mockData.js` is synthetically generated with a seeded random
function — it is not real sales, customer, or company data, and is safe to publish
publicly.
