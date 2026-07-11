import { useMemo } from 'react'
import {
  ComposedChart, Bar, Line, BarChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts'
import { STATES, MONTH_LIST } from '../data/olistData.js'
import { applyFilters, kpis, byMonth, byDeliveryTimeBucket, byState } from '../data/aggregations.js'
import { useFilters } from '../context/FilterContext.jsx'
import TopBar from '../components/TopBar.jsx'
import KpiCard from '../components/KpiCard.jsx'
import { Panel } from '../components/Panel.jsx'

export default function DeliveryPerformance({ orders }) {
  const filters = useFilters()
  const filtered = useMemo(() => applyFilters(orders, filters), [orders, filters])

  const totals = useMemo(() => kpis(filtered), [filtered])
  const trend = useMemo(() => byMonth(filtered, MONTH_LIST), [filtered])
  const buckets = useMemo(() => byDeliveryTimeBucket(filtered), [filtered])
  const stateRisk = useMemo(
    () => byState(filtered, STATES).filter((s) => s.orders >= 10).sort((a, b) => b.lateRate - a.lateRate).slice(0, 10),
    [filtered]
  )

  const baseNegative = totals.negativeReviewRate
  const onTimeNeg = filtered.filter((o) => o.deliveryStatus === 'on_time')
  const lateNeg = filtered.filter((o) => o.deliveryStatus === 'late')
  const onTimeNegRate = onTimeNeg.length ? (onTimeNeg.filter((o) => o.reviewScore <= 2).length / onTimeNeg.length) * 100 : 0
  const lateNegRate = lateNeg.length ? (lateNeg.filter((o) => o.reviewScore <= 2).length / lateNeg.length) * 100 : 0
  const riskMultiple = onTimeNegRate > 0.5 ? Math.min(15, lateNegRate / onTimeNegRate) : null

  return (
    <div>
      <TopBar title="Delivery Performance" subtitle="Deep dive into delivery performance and its impact on customer satisfaction" />

      <div className="kpi-grid-4">
        <KpiCard label="Total orders" value={totals.totalOrders} format={(v) => Math.round(v).toLocaleString('pt-BR')} />
        <KpiCard label="On-time delivery rate" value={totals.onTimeRate} format={(v) => `${v.toFixed(1)}%`} />
        <KpiCard label="Late delivery rate" value={totals.lateRate} format={(v) => `${v.toFixed(1)}%`} />
        <KpiCard label="Negative review risk" value={riskMultiple ?? 0} format={(v) => (riskMultiple === null ? 'n/a' : `${v.toFixed(1)}x higher`)} />
      </div>

      <div className="grid-2-1">
        <Panel title="Late delivery trend" subtitle="Late rate spikes correlate with order volume surges">
          <ResponsiveContainer width="100%" height={230}>
            <ComposedChart data={trend} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
              <CartesianGrid stroke="#e3e6ec" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#5b6472' }} axisLine={{ stroke: '#e3e6ec' }} tickLine={false} interval={2} />
              <YAxis yAxisId="left" tick={{ fontSize: 11, fill: '#5b6472' }} axisLine={false} tickLine={false} tickFormatter={(v) => (v / 1000).toFixed(1) + 'K'} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: '#5b6472' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${Math.round(v)}%`} />
              <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e3e6ec', fontSize: 12 }} formatter={(v, name) => (name === 'lateRate' ? [`${v.toFixed(1)}%`, 'Late rate'] : [Math.round(v), 'Orders'])} />
              <Bar yAxisId="left" dataKey="orders" fill="var(--navy)" radius={[3, 3, 0, 0]} barSize={14} />
              <Line yAxisId="right" type="monotone" dataKey="lateRate" stroke="var(--accent)" strokeWidth={2} dot={{ r: 2 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="Customer dissatisfaction by delivery time" subtitle="Negative review rate increases as delivery time lengthens">
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={buckets} layout="vertical" margin={{ top: 4, right: 24, left: 8, bottom: 0 }}>
              <CartesianGrid stroke="#e3e6ec" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10.5, fill: '#5b6472' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
              <YAxis type="category" dataKey="label" tick={{ fontSize: 11, fill: '#14181f' }} axisLine={false} tickLine={false} width={70} />
              <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e3e6ec', fontSize: 12 }} formatter={(v) => `${v.toFixed(1)}%`} />
              <Bar dataKey="negativeRate" radius={[0, 4, 4, 0]}>
                {buckets.map((b, i) => (
                  <Cell key={b.label} fill={i >= 4 ? '#d64545' : i >= 2 ? '#f2a65a' : '#e8c547'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Panel>
      </div>

      <Panel title="States with highest delivery risk" subtitle="Ranked by late delivery rate">
        <table className="risk-table">
          <thead>
            <tr>
              <th>#</th><th>State</th><th>Late rate</th><th>Avg delay</th><th>Delivered orders</th>
            </tr>
          </thead>
          <tbody>
            {stateRisk.map((s, i) => (
              <tr key={s.code}>
                <td className="mono">{i + 1}</td>
                <td>{s.state} ({s.code})</td>
                <td className="mono risk-cell">{s.lateRate.toFixed(1)}%</td>
                <td className="mono">{s.avgDelayDays.toFixed(1)}d</td>
                <td className="mono">{s.orders.toLocaleString('pt-BR')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>

      <style>{`
        .kpi-grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 16px; }
        .grid-2-1 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px; }
        .risk-table { width: 100%; border-collapse: collapse; font-size: 12.5px; }
        .risk-table th { text-align: left; color: var(--ink-soft); font-weight: 600; font-size: 11px; text-transform: uppercase; letter-spacing: 0.03em; padding-bottom: 8px; border-bottom: 1px solid var(--line); }
        .risk-table td { padding: 8px 0; border-bottom: 1px solid var(--line); }
        .risk-table tr:last-child td { border-bottom: none; }
        .mono { font-family: var(--font-mono); }
        .risk-cell { color: var(--negative); font-weight: 600; }
        @media (max-width: 1000px) {
          .kpi-grid-4 { grid-template-columns: repeat(2, 1fr); }
          .grid-2-1 { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  )
}
