import { useMemo, useState } from 'react'
import { useFilters } from '../context/FilterContext.jsx'
import KpiCard from '../components/KpiCard.jsx'
import RevenueTrend from '../components/RevenueTrend.jsx'
import CategoryBreakdown from '../components/CategoryBreakdown.jsx'
import RegionBar from '../components/RegionBar.jsx'
import TopProducts from '../components/TopProducts.jsx'
import TopBar from '../components/TopBar.jsx'
import FilterChips from '../components/FilterChips.jsx'

const fmt = {
  currency: (v) => `€${Math.round(v).toLocaleString('de-DE')}`,
  number: (v) => Math.round(v).toLocaleString('de-DE'),
  percent: (v) => `${v.toFixed(1)}%`,
}

export default function Overview({ orders }) {
  const { state, category, years } = useFilters()
  const [activeRegion, setActiveRegion] = useState(null)
  const [activeCategory, setActiveCategory] = useState(null)

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      if (state && o.region !== state) return false
      if (category && o.category !== category) return false
      return true
    })
  }, [orders, state, category])

  const kpis = useMemo(() => {
    const conv = filtered.filter((o) => o.converted)
    const revenue = conv.reduce((s, o) => s + o.revenue, 0)
    const units = conv.reduce((s, o) => s + o.units, 0)
    const convRate = filtered.length ? (conv.length / filtered.length) * 100 : 0
    const aov = conv.length ? revenue / conv.length : 0
    return { revenue, units, convRate, aov, orders: conv.length }
  }, [filtered])

  const trendData = useMemo(() => {
    const byMonth = {}
    filtered.filter((o) => o.converted).forEach((o) => {
      byMonth[o.month] = (byMonth[o.month] || 0) + o.revenue
    })
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
    return months.map((m) => ({ month: m, revenue: byMonth[m] || 0 }))
  }, [filtered])

  const categoryData = useMemo(() => {
    const byCat = {}
    filtered.filter((o) => o.converted).forEach((o) => {
      byCat[o.category] = (byCat[o.category] || 0) + o.revenue
    })
    return Object.entries(byCat).map(([category, revenue]) => ({ category, revenue }))
  }, [filtered])

  const regionData = useMemo(() => {
    const byReg = {}
    filtered.filter((o) => o.converted).forEach((o) => {
      byReg[o.region] = (byReg[o.region] || 0) + o.revenue
    })
    return Object.entries(byReg).map(([region, revenue]) => ({ region, revenue }))
      .sort((a, b) => b.revenue - a.revenue)
  }, [filtered])

  const topProducts = useMemo(() => {
    const byProd = {}
    filtered.filter((o) => o.converted).forEach((o) => {
      byProd[o.product] = (byProd[o.product] || 0) + o.revenue
    })
    return Object.entries(byProd)
      .map(([product, revenue]) => ({ product, revenue }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 8)
  }, [filtered])

  function handleRegion(r) { setActiveRegion((p) => (p === r ? null : r)) }
  function handleCategory(c) { setActiveCategory((p) => (p === c ? null : c)) }

  return (
    <div>
      <TopBar title="Overview" subtitle="Full-year sales performance across all segments" />
      <FilterChips
        filters={{ State: state, Category: category }}
        onRemove={() => {}}
        onClearAll={() => {}}
      />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 }}>
        <KpiCard label="Total Revenue" value={kpis.revenue} format={fmt.currency} />
        <KpiCard label="Orders" value={kpis.orders} format={fmt.number} />
        <KpiCard label="Conv. Rate" value={kpis.convRate} format={fmt.percent} />
        <KpiCard label="Avg Order Value" value={kpis.aov} format={fmt.currency} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 16 }}>
        <RevenueTrend data={trendData} />
        <CategoryBreakdown data={categoryData} activeCategory={activeCategory} onSelect={handleCategory} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <RegionBar data={regionData} activeRegion={activeRegion} onSelect={handleRegion} />
        <TopProducts data={topProducts} />
      </div>
    </div>
  )
}
