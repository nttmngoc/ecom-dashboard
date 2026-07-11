import { useMemo, useState } from 'react'
import { generateOrders, MONTH_LIST } from './data/mockData.js'
import KpiCard from './components/KpiCard.jsx'
import FilterChips from './components/FilterChips.jsx'
import RevenueTrend from './components/RevenueTrend.jsx'
import CategoryBreakdown from './components/CategoryBreakdown.jsx'
import RegionBar from './components/RegionBar.jsx'
import TopProducts from './components/TopProducts.jsx'

const ALL_ORDERS = generateOrders()

function aggregate(orders) {
  const revenue = orders.reduce((s, o) => s + o.revenue, 0)
  const orderCount = orders.filter((o) => o.converted).length
  const visits = orders.length
  const aov = orderCount ? revenue / orderCount : 0
  const conversion = visits ? (orderCount / visits) * 100 : 0
  return { revenue, orderCount, aov, conversion }
}

export default function App() {
  const [filters, setFilters] = useState({ category: null, region: null })

  const filtered = useMemo(() => {
    return ALL_ORDERS.filter(
      (o) =>
        (!filters.category || o.category === filters.category) &&
        (!filters.region || o.region === filters.region)
    )
  }, [filters])

  const totals = useMemo(() => aggregate(filtered), [filtered])
  const baseline = useMemo(() => aggregate(ALL_ORDERS), [])

  const trendData = useMemo(() => {
    return MONTH_LIST.map((month) => ({
      month,
      revenue: filtered.filter((o) => o.month === month).reduce((s, o) => s + o.revenue, 0),
    }))
  }, [filtered])

  const categoryData = useMemo(() => {
    const byCat = {}
    // Category chart ignores its own filter so all segments stay clickable
    const source = ALL_ORDERS.filter((o) => !filters.region || o.region === filters.region)
    source.forEach((o) => {
      byCat[o.category] = (byCat[o.category] || 0) + o.revenue
    })
    return Object.entries(byCat).map(([category, revenue]) => ({ category, revenue }))
  }, [filters.region])

  const regionData = useMemo(() => {
    const byRegion = {}
    const source = ALL_ORDERS.filter((o) => !filters.category || o.category === filters.category)
    source.forEach((o) => {
      byRegion[o.region] = (byRegion[o.region] || 0) + o.revenue
    })
    return Object.entries(byRegion).map(([region, revenue]) => ({ region, revenue }))
  }, [filters.category])

  const topProducts = useMemo(() => {
    const byProduct = {}
    filtered.forEach((o) => {
      byProduct[o.product] = (byProduct[o.product] || 0) + o.revenue
    })
    return Object.entries(byProduct)
      .map(([product, revenue]) => ({ product, revenue }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 6)
  }, [filtered])

  function toggleFilter(key, value) {
    setFilters((f) => ({ ...f, [key]: f[key] === value ? null : value }))
  }

  function removeFilter(key) {
    setFilters((f) => ({ ...f, [key]: null }))
  }

  function clearAll() {
    setFilters({ category: null, region: null })
  }

  const pctDelta = (curr, base) => (base ? ((curr - base) / base) * 100 : 0)

  return (
    <div className="app">
      <header className="masthead">
        <div className="masthead-inner">
          <div className="brand">
            <span className="brand-mark">◆</span>
            <span className="brand-name">Sales Command Center</span>
          </div>
          <span className="brand-tag">Retail performance · FY2026 mock data</span>
        </div>
      </header>

      <main className="content">
        <FilterChips
          filters={{ category: filters.category, region: filters.region }}
          onRemove={removeFilter}
          onClearAll={clearAll}
        />

        <div className="kpi-grid">
          <KpiCard
            label="Revenue"
            value={totals.revenue}
            format={(v) => `€${Math.round(v).toLocaleString('de-DE')}`}
            delta={pctDelta(totals.revenue, baseline.revenue)}
          />
          <KpiCard
            label="Orders"
            value={totals.orderCount}
            format={(v) => Math.round(v).toLocaleString('de-DE')}
            delta={pctDelta(totals.orderCount, baseline.orderCount)}
          />
          <KpiCard
            label="Avg. order value"
            value={totals.aov}
            format={(v) => `€${v.toFixed(2)}`}
            delta={pctDelta(totals.aov, baseline.aov)}
          />
          <KpiCard
            label="Conversion rate"
            value={totals.conversion}
            format={(v) => `${v.toFixed(1)}%`}
            delta={pctDelta(totals.conversion, baseline.conversion)}
          />
        </div>

        <div className="main-grid">
          <div className="col-wide">
            <RevenueTrend data={trendData} />
          </div>
          <div className="col-narrow">
            <CategoryBreakdown
              data={categoryData}
              activeCategory={filters.category}
              onSelect={(c) => toggleFilter('category', c)}
            />
          </div>

          <div className="col-wide">
            <RegionBar
              data={regionData}
              activeRegion={filters.region}
              onSelect={(r) => toggleFilter('region', r)}
            />
          </div>
          <div className="col-narrow">
            <TopProducts data={topProducts} />
          </div>
        </div>
      </main>

      <style>{`
        .app { min-height: 100vh; padding-bottom: 40px; }
        .masthead {
          background: var(--navy);
          border-bottom: 3px solid var(--accent);
        }
        .masthead-inner {
          max-width: 1180px;
          margin: 0 auto;
          padding: 18px 24px;
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 6px;
        }
        .brand { display: flex; align-items: center; gap: 10px; }
        .brand-mark { color: var(--accent); font-size: 16px; }
        .brand-name {
          font-family: var(--font-display);
          font-size: 20px;
          font-weight: 600;
          color: #fff;
          letter-spacing: -0.01em;
        }
        .brand-tag {
          font-size: 12px;
          color: #aab1c4;
          font-family: var(--font-mono);
        }
        .content {
          max-width: 1180px;
          margin: 0 auto;
          padding: 24px;
        }
        .kpi-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 14px;
          margin-bottom: 18px;
        }
        .main-grid {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 14px;
        }
        @media (max-width: 820px) {
          .kpi-grid { grid-template-columns: repeat(2, 1fr); }
          .main-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  )
}
