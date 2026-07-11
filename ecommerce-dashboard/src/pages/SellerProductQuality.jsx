import { useMemo } from 'react'
import { useFilters } from '../context/FilterContext.jsx'
import KpiCard from '../components/KpiCard.jsx'
import TopBar from '../components/TopBar.jsx'
import TopProducts from '../components/TopProducts.jsx'
import { Panel, RankList } from '../components/Panel.jsx'
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts'

const fmt = {
  currency: (v) => `€${Math.round(v).toLocaleString('de-DE')}`,
  number: (v) => Math.round(v).toLocaleString('de-DE'),
  percent: (v) => `${v.toFixed(1)}%`,
}

const COLORS = ['#ff5a36', '#232c47', '#5b7fd6', '#f2a65a', '#1c9c6e']

export default function SellerProductQuality({ orders }) {
  const { state, category } = useFilters()

  const filtered = useMemo(() =>
    orders.filter((o) => {
      if (state && o.region !== state) return false
      if (category && o.category !== category) return false
      return true
    }),
    [orders, state, category]
  )

  const topProducts = useMemo(() => {
    const byProd = {}
    filtered.filter(o => o.converted).forEach(o => {
      if (!byProd[o.product]) byProd[o.product] = { product: o.product, revenue: 0, units: 0 }
      byProd[o.product].revenue += o.revenue
      byProd[o.product].units += o.units
    })
    return Object.values(byProd).sort((a, b) => b.revenue - a.revenue).slice(0, 8)
  }, [filtered])

  const categoryStats = useMemo(() => {
    const byCat = {}
    filtered.filter(o => o.converted).forEach(o => {
      if (!byCat[o.category]) byCat[o.category] = { revenue: 0, count: 0 }
      byCat[o.category].revenue += o.revenue
      byCat[o.category].count += 1
    })
    return Object.entries(byCat).map(([name, d]) => ({
      name,
      revenue: d.revenue,
      avgOrderValue: d.count ? d.revenue / d.count : 0,
      orders: d.count,
    }))
  }, [filtered])

  const scatterData = categoryStats.map((c) => ({
    x: Math.round(c.avgOrderValue),
    y: c.orders,
    name: c.name,
  }))

  return (
    <div>
      <TopBar title="Seller & Product Quality" subtitle="Product revenue, AOV, and category breakdown" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 }}>
        <KpiCard label="Return Rate" value={4.2} format={fmt.percent} />
        <KpiCard label="Avg Rating" value={4.3} format={(v) => `${v.toFixed(1)} / 5`} />
        <KpiCard label="Active SKUs" value={topProducts.length * 4} format={fmt.number} />
        <KpiCard label="Avg AOV" value={categoryStats.reduce((s, c) => s + c.avgOrderValue, 0) / Math.max(categoryStats.length, 1)} format={fmt.currency} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <TopProducts data={topProducts} />
        <Panel title="AOV vs Volume by Category" subtitle="Each dot = one category">
          <ResponsiveContainer width="100%" height={260}>
            <ScatterChart margin={{ top: 8, right: 16, left: -8, bottom: 0 }}>
              <CartesianGrid stroke="#e3e6ec" />
              <XAxis dataKey="x" name="AOV" tick={{ fontSize: 11, fill: '#5b6472' }} tickFormatter={(v) => `€${v}`} axisLine={false} tickLine={false} />
              <YAxis dataKey="y" name="Orders" tick={{ fontSize: 11, fill: '#5b6472' }} axisLine={false} tickLine={false} />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} content={({ payload }) => {
                if (!payload?.length) return null
                const d = payload[0].payload
                return (
                  <div style={{ background: '#fff', border: '1px solid #e3e6ec', borderRadius: 8, padding: '8px 12px', fontSize: 12 }}>
                    <strong>{d.name}</strong><br />
                    AOV: €{d.x} · Orders: {d.y}
                  </div>
                )
              }} />
              <Scatter data={scatterData} fill="#ff5a36">
                {scatterData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </Panel>
      </div>
    </div>
  )
}
