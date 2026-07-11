import { useMemo } from 'react'
import { useFilters } from '../context/FilterContext.jsx'
import KpiCard from '../components/KpiCard.jsx'
import TopBar from '../components/TopBar.jsx'
import { Panel, RankList } from '../components/Panel.jsx'
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell,
} from 'recharts'

const fmt = {
  percent: (v) => `${v.toFixed(1)}%`,
  number: (v) => Math.round(v).toLocaleString('de-DE'),
}

export default function CustomerSatisfaction({ orders }) {
  const { state, category } = useFilters()

  const filtered = useMemo(() =>
    orders.filter((o) => {
      if (state && o.region !== state) return false
      if (category && o.category !== category) return false
      return true
    }),
    [orders, state, category]
  )

  const kpis = useMemo(() => {
    const conv = filtered.filter((o) => o.converted)
    const total = filtered.length
    const convRate = total ? (conv.length / total) * 100 : 0
    const repeatRate = 68.4 // simulated
    const nps = 72 // simulated NPS
    return { convRate, repeatRate, nps, sessions: total }
  }, [filtered])

  const categoryRatings = useMemo(() => {
    const catData = {}
    filtered.filter(o => o.converted).forEach(o => {
      if (!catData[o.category]) catData[o.category] = { count: 0 }
      catData[o.category].count += 1
    })
    const cats = Object.entries(catData)
    if (!cats.length) return []
    const max = Math.max(...cats.map(([, d]) => d.count))
    return cats.map(([cat, d]) => ({
      category: cat,
      score: Math.round(3.5 + (d.count / max) * 1.4),
      satisfaction: Math.round(70 + (d.count / max) * 25),
    }))
  }, [filtered])

  const radarData = categoryRatings.map((r) => ({
    subject: r.category,
    value: r.satisfaction,
  }))

  return (
    <div>
      <TopBar title="Customer Satisfaction" subtitle="Conversion, retention, and NPS signals" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 }}>
        <KpiCard label="Conv. Rate" value={kpis.convRate} format={fmt.percent} />
        <KpiCard label="Repeat Rate" value={kpis.repeatRate} format={fmt.percent} />
        <KpiCard label="NPS Score" value={kpis.nps} format={fmt.number} />
        <KpiCard label="Sessions" value={kpis.sessions} format={fmt.number} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Panel title="Satisfaction by Category" subtitle="Simulated satisfaction index (0–100)">
          <ResponsiveContainer width="100%" height={260}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#e3e6ec" />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12, fill: '#5b6472' }} />
              <Radar dataKey="value" stroke="#ff5a36" fill="#ff5a36" fillOpacity={0.25} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </Panel>
        <Panel title="Category Conversion Rates">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={categoryRatings} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
              <CartesianGrid stroke="#e3e6ec" vertical={false} />
              <XAxis dataKey="category" tick={{ fontSize: 11, fill: '#5b6472' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#5b6472' }} axisLine={false} tickLine={false} domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
              <Tooltip formatter={(v) => `${v}%`} contentStyle={{ borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="satisfaction" radius={[4, 4, 0, 0]}>
                {categoryRatings.map((_, i) => (
                  <Cell key={i} fill={i % 2 === 0 ? '#ff5a36' : '#232c47'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Panel>
      </div>
    </div>
  )
}
