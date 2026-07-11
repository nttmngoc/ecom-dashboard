import { useMemo } from 'react'
import { useFilters } from '../context/FilterContext.jsx'
import KpiCard from '../components/KpiCard.jsx'
import TopBar from '../components/TopBar.jsx'
import { Panel } from '../components/Panel.jsx'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell,
} from 'recharts'

const fmt = {
  days: (v) => `${v.toFixed(1)}d`,
  percent: (v) => `${v.toFixed(1)}%`,
  number: (v) => Math.round(v).toLocaleString('de-DE'),
}

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

export default function DeliveryPerformance({ orders }) {
  const { state, category } = useFilters()

  const filtered = useMemo(() =>
    orders.filter((o) => {
      if (state && o.region !== state) return false
      if (category && o.category !== category) return false
      return true
    }),
    [orders, state, category]
  )

  // Simulate delivery days from data spread
  const deliveryTrend = useMemo(() => {
    return MONTHS.map((month, i) => ({
      month,
      avgDays: 8.5 - i * 0.3 + (i % 3 === 0 ? 0.8 : 0),
      onTime: 72 + i * 1.2 + (i % 4 === 0 ? -2 : 0),
    }))
  }, [])

  const regionDelivery = useMemo(() => {
    const byReg = {}
    filtered.filter(o => o.converted).forEach(o => {
      if (!byReg[o.region]) byReg[o.region] = { count: 0 }
      byReg[o.region].count += 1
    })
    return Object.entries(byReg).map(([region, d], i) => ({
      region,
      avgDays: 6 + i * 1.2,
      onTime: 88 - i * 3.5,
    }))
  }, [filtered])

  return (
    <div>
      <TopBar title="Delivery Performance" subtitle="Shipping speed and on-time delivery rates" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 }}>
        <KpiCard label="Avg Delivery Days" value={6.8} format={fmt.days} />
        <KpiCard label="On-Time Rate" value={84.2} format={fmt.percent} />
        <KpiCard label="Late Deliveries" value={1243} format={fmt.number} />
        <KpiCard label="Expedited Orders" value={892} format={fmt.number} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Panel title="Avg Delivery Days" subtitle="Monthly trend">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={deliveryTrend} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
              <CartesianGrid stroke="#e3e6ec" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#5b6472' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#5b6472' }} axisLine={false} tickLine={false} domain={[4, 12]} tickFormatter={(v) => `${v}d`} />
              <Tooltip formatter={(v) => [`${v.toFixed(1)} days`, 'Avg Delivery']} contentStyle={{ borderRadius: 8, fontSize: 12 }} />
              <Line type="monotone" dataKey="avgDays" stroke="#ff5a36" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </Panel>
        <Panel title="On-Time Rate by Region">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={regionDelivery} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
              <CartesianGrid stroke="#e3e6ec" vertical={false} />
              <XAxis dataKey="region" tick={{ fontSize: 11, fill: '#5b6472' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#5b6472' }} axisLine={false} tickLine={false} domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
              <Tooltip formatter={(v) => `${v.toFixed(1)}%`} contentStyle={{ borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="onTime" radius={[4, 4, 0, 0]}>
                {regionDelivery.map((e, i) => (
                  <Cell key={i} fill={e.onTime >= 85 ? '#1c9c6e' : e.onTime >= 75 ? '#f2a65a' : '#d64545'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Panel>
      </div>
    </div>
  )
}
