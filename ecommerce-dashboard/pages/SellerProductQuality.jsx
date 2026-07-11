import { useMemo } from 'react'
import {
  ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell,
} from 'recharts'
import { CATEGORIES } from '../data/olistData.js'
import { applyFilters, byCategory, sellerAggregates } from '../data/aggregations.js'
import { useFilters } from '../context/FilterContext.jsx'
import TopBar from '../components/TopBar.jsx'
import KpiCard from '../components/KpiCard.jsx'
import { Panel } from '../components/Panel.jsx'

const SCORE_BUCKETS = [
  { label: '4.5+', min: 4.5, max: 5.01 },
  { label: '4.1 – 4.5', min: 4.1, max: 4.5 },
  { label: '3.9 – 4.1', min: 3.9, max: 4.1 },
  { label: '3.5 – 3.9', min: 3.5, max: 3.9 },
  { label: '< 3.5', min: 0, max: 3.5 },
]
const NEG_BUCKETS = [
  { label: '<5%', min: 0, max: 5 },
  { label: '5–10%', min: 5, max: 10 },
  { label: '10–15%', min: 10, max: 15 },
  { label: '15–20%', min: 15, max: 20 },
  { label: '20%+', min: 20, max: 101 },
]

function heatColor(count, maxCount) {
  if (!count) return 'transparent'
  const intensity = Math.min(1, count / maxCount)
  const r = Math.round(255 - intensity * 25)
  const g = Math.round(230 - intensity * 130)
  const b = Math.round(200 - intensity * 160)
  return `rgb(${r},${g},${b})`
}

export default function SellerProductQuality({ orders }) {
  const filters = useFilters()
  const filtered = useMemo(() => applyFilters(orders, filters), [orders, filters])

  const sellers = useMemo(() => sellerAggregates(filtered), [filtered])
  const highRiskSellers = useMemo(() => sellers.filter((s) => s.avgReview < 3.5), [sellers])
  const worstSeller = useMemo(() => [...sellers].sort((a, b) => a.avgReview - b.avgReview)[0], [sellers])

  const cats = useMemo(() => byCategory(filtered, CATEGORIES).filter((c) => c.orders >= 15), [filtered])
  const highRiskCategories = useMemo(() => cats.filter((c) => c.negativeRate >= 20), [cats])
  const worstCategory = useMemo(() => [...cats].sort((a, b) => a.avgReview - b.avgReview)[0], [cats])

  const heatmap = useMemo(() => {
    const grid = SCORE_BUCKETS.map((sb) =>
      NEG_BUCKETS.map((nb) => sellers.filter((s) => s.avgReview >= sb.min && s.avgReview < sb.max && s.negativeRate >= nb.min && s.negativeRate < nb.max).length)
    )
    const maxCount = Math.max(...grid.flat(), 1)
    return { grid, maxCount }
  }, [sellers])

  const highRiskScatterData = highRiskSellers.map((s) => ({ x: s.avgReview, y: s.negativeRate, z: s.orders, critical: s.avgReview < 2.8 }))

  return (
    <div>
      <TopBar title="Seller & Product Quality" subtitle="Examining seller performance and product categories that contribute to dissatisfaction" />

      <div className="kpi-grid-4">
        <KpiCard label="Worst seller score" value={worstSeller ? worstSeller.avgReview : 0} format={(v) => v.toFixed(2)} />
        <KpiCard label="High-risk sellers" value={highRiskSellers.length} format={(v) => Math.round(v)} />
        <KpiCard label="Worst category score" value={worstCategory ? worstCategory.avgReview : 0} format={(v) => v.toFixed(2)} />
        <KpiCard label="High-risk categories" value={highRiskCategories.length} format={(v) => Math.round(v)} />
      </div>

      <div className="grid-2">
        <Panel title="Category risk matrix" subtitle="Freight-to-price ratio vs. negative review rate (bubble = order volume)">
          <ResponsiveContainer width="100%" height={260}>
            <ScatterChart margin={{ top: 8, right: 16, left: -8, bottom: 4 }}>
              <CartesianGrid stroke="#e3e6ec" />
              <XAxis type="number" dataKey="freightRatio" name="Freight-to-price" unit="%" tick={{ fontSize: 10.5, fill: '#5b6472' }} axisLine={{ stroke: '#e3e6ec' }} tickLine={false} domain={[15, 55]} />
              <YAxis type="number" dataKey="negativeRate" name="Negative review rate" unit="%" tick={{ fontSize: 10.5, fill: '#5b6472' }} axisLine={false} tickLine={false} />
              <ZAxis type="number" dataKey="orders" range={[40, 400]} />
              <ReferenceLine y={20} stroke="#d64545" strokeDasharray="4 4" label={{ value: 'High-risk threshold', fontSize: 10, fill: '#d64545', position: 'insideTopRight' }} />
              <Tooltip
                cursor={{ strokeDasharray: '3 3' }}
                contentStyle={{ borderRadius: 8, border: '1px solid #e3e6ec', fontSize: 12 }}
                formatter={(v, name) => (name === 'negativeRate' || name === 'freightRatio' ? [`${v.toFixed(1)}%`, name] : [v, name])}
                labelFormatter={() => ''}
              />
              <Scatter data={cats} fill="var(--accent)">
                {cats.map((c) => (
                  <Cell key={c.category} fill={c.negativeRate >= 20 ? '#d64545' : '#f2a65a'} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="High-risk seller scatter" subtitle="Sellers with ≥15 orders and avg score below 3.5">
          <ResponsiveContainer width="100%" height={260}>
            <ScatterChart margin={{ top: 8, right: 16, left: -8, bottom: 4 }}>
              <CartesianGrid stroke="#e3e6ec" />
              <XAxis type="number" dataKey="x" name="Avg review score" domain={[1.8, 3.6]} tick={{ fontSize: 10.5, fill: '#5b6472' }} axisLine={{ stroke: '#e3e6ec' }} tickLine={false} />
              <YAxis type="number" dataKey="y" name="Negative review rate" unit="%" tick={{ fontSize: 10.5, fill: '#5b6472' }} axisLine={false} tickLine={false} />
              <ZAxis type="number" dataKey="z" range={[40, 400]} />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ borderRadius: 8, border: '1px solid #e3e6ec', fontSize: 12 }} formatter={(v, name) => (name === 'y' ? [`${v.toFixed(1)}%`, 'Negative rate'] : name === 'x' ? [v.toFixed(2), 'Avg score'] : [v, 'Orders'])} />
              <Scatter data={highRiskScatterData}>
                {highRiskScatterData.map((d, i) => (
                  <Cell key={i} fill={d.critical ? '#d64545' : '#f2a65a'} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
          <div className="legend-row">
            <span><span className="dot" style={{ background: '#d64545' }} /> Critical (score &lt; 2.8)</span>
            <span><span className="dot" style={{ background: '#f2a65a' }} /> High risk</span>
          </div>
        </Panel>
      </div>

      <Panel title="Seller quality heatmap" subtitle="Sellers grouped by average review score and negative review rate">
        <table className="heatmap-table">
          <thead>
            <tr>
              <th></th>
              {NEG_BUCKETS.map((nb) => (
                <th key={nb.label}>{nb.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {SCORE_BUCKETS.map((sb, ri) => (
              <tr key={sb.label}>
                <td className="row-label">{sb.label}</td>
                {NEG_BUCKETS.map((nb, ci) => (
                  <td key={nb.label} style={{ background: heatColor(heatmap.grid[ri][ci], heatmap.maxCount) }}>
                    {heatmap.grid[ri][ci] || ''}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>

      <style>{`
        .kpi-grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 16px; }
        .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px; }
        .legend-row { display: flex; gap: 16px; font-size: 11.5px; color: var(--ink-soft); margin-top: 8px; }
        .legend-row .dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; margin-right: 5px; }
        .heatmap-table { width: 100%; border-collapse: collapse; font-size: 12.5px; text-align: center; }
        .heatmap-table th { font-size: 11px; color: var(--ink-soft); font-weight: 600; padding-bottom: 8px; }
        .heatmap-table td { padding: 10px 4px; border: 1px solid var(--line); font-family: var(--font-mono); }
        .row-label { text-align: left; font-family: var(--font-body); color: var(--ink); font-weight: 500; padding-left: 4px !important; }
        @media (max-width: 1000px) {
          .kpi-grid-4 { grid-template-columns: repeat(2, 1fr); }
          .grid-2 { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  )
}
