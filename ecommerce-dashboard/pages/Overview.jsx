import { useMemo } from 'react'
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { STATES, CATEGORIES, MONTH_LIST } from '../data/olistData.js'
import { applyFilters, kpis, byMonth, byCategory, byState } from '../data/aggregations.js'
import { useFilters } from '../context/FilterContext.jsx'
import TopBar from '../components/TopBar.jsx'
import KpiCard from '../components/KpiCard.jsx'
import { Panel, RankList } from '../components/Panel.jsx'
import BrazilMap from '../components/BrazilMap.jsx'

const eur = (v) => `R$${Math.round(v).toLocaleString('pt-BR')}`

function revenueColor(value, max) {
  const t = Math.min(1, value / max)
  // interpolate light blue -> navy
  const from = [200, 210, 230]
  const to = [35, 44, 71]
  const rgb = from.map((f, i) => Math.round(f + (to[i] - f) * t))
  return `rgb(${rgb.join(',')})`
}

export default function Overview({ orders }) {
  const filters = useFilters()
  const filtered = useMemo(() => applyFilters(orders, filters), [orders, filters])

  const totals = useMemo(() => kpis(filtered), [filtered])
  const trend = useMemo(() => byMonth(filtered, MONTH_LIST), [filtered])
  const topCategories = useMemo(
    () => byCategory(filtered, CATEGORIES).sort((a, b) => b.revenue - a.revenue).slice(0, 5),
    [filtered]
  )
  const allStatesByRevenue = useMemo(() => byState(filtered, STATES), [filtered])
  const topStates = useMemo(() => [...allStatesByRevenue].sort((a, b) => b.revenue - a.revenue).slice(0, 5), [allStatesByRevenue])
  const stateRevenueMap = useMemo(
    () => Object.fromEntries(allStatesByRevenue.map((s) => [s.state, s.revenue])),
    [allStatesByRevenue]
  )
  const maxStateRevenue = useMemo(() => Math.max(...allStatesByRevenue.map((s) => s.revenue), 1), [allStatesByRevenue])

  const health = [
    { metric: 'Negative review rate', value: totals.negativeReviewRate, deltaGood: false, fmt: (v) => `${v.toFixed(1)}%`, status: totals.negativeReviewRate > 13 ? 'Monitor' : 'Good' },
    { metric: 'On-time delivery rate', value: totals.onTimeRate, deltaGood: true, fmt: (v) => `${v.toFixed(1)}%`, status: totals.onTimeRate > 90 ? 'Good' : 'Monitor' },
    { metric: 'Order cancellation rate', value: totals.cancellationRate, deltaGood: false, fmt: (v) => `${v.toFixed(1)}%`, status: totals.cancellationRate < 1 ? 'Good' : 'Risk' },
    { metric: 'Completion rate', value: totals.completionRate, deltaGood: true, fmt: (v) => `${v.toFixed(1)}%`, status: totals.completionRate > 95 ? 'Good' : 'Monitor' },
  ]

  return (
    <div>
      <TopBar title="Executive Overview" subtitle="High-level overview of business performance, customer base, and operational health" />

      <div className="kpi-grid-5">
        <KpiCard label="Total revenue" value={totals.totalRevenue} format={eur} />
        <KpiCard label="Total orders" value={totals.totalOrders} format={(v) => Math.round(v).toLocaleString('pt-BR')} />
        <KpiCard label="Total customers" value={totals.totalCustomers} format={(v) => Math.round(v).toLocaleString('pt-BR')} />
        <KpiCard label="Avg order value" value={totals.avgOrderValue} format={(v) => `R$${v.toFixed(2)}`} />
        <KpiCard label="Avg review score" value={totals.avgReviewScore} format={(v) => `${v.toFixed(2)} / 5`} />
      </div>

      <div className="grid-2-1">
        <Panel title="Revenue & orders trend" subtitle="Monthly performance over time">
          <ResponsiveContainer width="100%" height={250}>
            <ComposedChart data={trend} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
              <CartesianGrid stroke="#e3e6ec" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 10.5, fill: '#5b6472' }} axisLine={{ stroke: '#e3e6ec' }} tickLine={false} interval={2} />
              <YAxis yAxisId="left" tick={{ fontSize: 11, fill: '#5b6472' }} axisLine={false} tickLine={false} tickFormatter={(v) => (v / 1000).toFixed(1) + 'K'} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: '#5b6472' }} axisLine={false} tickLine={false} tickFormatter={(v) => `R$${Math.round(v / 1000)}k`} />
              <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e3e6ec', fontSize: 12 }} formatter={(v, name) => (name === 'revenue' ? [eur(v), 'Revenue'] : [Math.round(v), 'Orders'])} />
              <Bar yAxisId="left" dataKey="orders" fill="var(--navy)" radius={[3, 3, 0, 0]} barSize={14} />
              <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="var(--accent)" strokeWidth={2} dot={{ r: 2 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="Operational health monitor" subtitle="Key indicators">
          <table className="health-table">
            <thead>
              <tr><th>Metric</th><th>Current</th><th>Status</th></tr>
            </thead>
            <tbody>
              {health.map((h) => (
                <tr key={h.metric}>
                  <td>{h.metric}</td>
                  <td className="mono">{h.fmt(h.value)}</td>
                  <td><span className={`status-pill ${h.status.toLowerCase()}`}>{h.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
      </div>

      <div className="grid-2">
        <Panel title="Top 5 categories by revenue" subtitle="Revenue concentration across categories">
          <RankList items={topCategories} labelKey="category" valueKey="revenue" format={eur} />
        </Panel>
        <Panel title="Revenue by state" subtitle="Customer demand is highly concentrated in the Southeast region">
          <div className="map-row">
            <div className="map-wrap">
              <BrazilMap
                valueByState={stateRevenueMap}
                colorScale={(v) => revenueColor(v, maxStateRevenue)}
                activeState={filters.state}
                onSelect={(name) => filters.setState(filters.state === name ? '' : name)}
              />
            </div>
            <div className="map-side">
              <div className="map-side-title">Highest 5 states</div>
              <RankList items={topStates} labelKey="state" valueKey="revenue" format={eur} color="var(--navy)" />
            </div>
          </div>
        </Panel>
      </div>

      <style>{`
        .map-row { display: flex; flex-direction: column; gap: 14px; }
        .map-wrap { max-width: 260px; margin: 0 auto; }
        .map-side { width: 100%; }
        .map-side-title { font-size: 11.5px; font-weight: 700; color: var(--ink-soft); text-transform: uppercase; letter-spacing: 0.03em; margin-bottom: 10px; }
      `}</style>

      <style>{`
        .kpi-grid-5 { display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; margin-bottom: 16px; }
        .grid-2-1 { display: grid; grid-template-columns: 2fr 1fr; gap: 14px; margin-bottom: 14px; }
        .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .health-table { width: 100%; border-collapse: collapse; font-size: 12.5px; }
        .health-table th { text-align: left; color: var(--ink-soft); font-weight: 600; font-size: 11px; text-transform: uppercase; letter-spacing: 0.03em; padding-bottom: 8px; border-bottom: 1px solid var(--line); }
        .health-table td { padding: 9px 0; border-bottom: 1px solid var(--line); }
        .health-table tr:last-child td { border-bottom: none; }
        .mono { font-family: var(--font-mono); }
        .status-pill { font-size: 11px; font-weight: 700; padding: 3px 9px; border-radius: 999px; }
        .status-pill.good { background: #dff5ea; color: var(--positive); }
        .status-pill.monitor { background: #fff3e0; color: #b96a1a; }
        .status-pill.risk { background: #fde8e8; color: var(--negative); }
        @media (max-width: 1000px) {
          .kpi-grid-5 { grid-template-columns: repeat(2, 1fr); }
          .grid-2-1, .grid-2 { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  )
}
