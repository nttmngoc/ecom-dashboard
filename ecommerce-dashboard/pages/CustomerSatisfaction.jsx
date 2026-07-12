import { useMemo, useState } from 'react'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts'
import { STATES, CATEGORIES, MONTH_LIST } from '../data/olistData.js'
import { applyFilters, byMonth, reviewDistribution, byDeliveryOutcome, byCategory, byState } from '../data/aggregations.js'
import { useFilters } from '../context/FilterContext.jsx'
import TopBar from '../components/TopBar.jsx'
import { Panel, RankList } from '../components/Panel.jsx'
import BrazilMap from '../components/BrazilMap.jsx'

const SCORE_COLORS = { 1: '#d64545', 2: '#f2a65a', 3: '#e8c547', 4: '#8bc98a', 5: '#1c9c6e' }

const SATISFACTION_BUCKETS = [
  { label: '< 3.5', max: 3.5, color: '#e0693f' },
  { label: '3.5 – 3.9', max: 3.9, color: '#f2b183' },
  { label: '3.9 – 4.1', max: 4.1, color: '#dcdde2' },
  { label: '4.1 – 4.5', max: 4.5, color: '#a8d3a0' },
  { label: '≥ 4.5', max: 5.01, color: '#4b9e5f' },
]
function satisfactionColor(value) {
  return (SATISFACTION_BUCKETS.find((b) => value < b.max) || SATISFACTION_BUCKETS[SATISFACTION_BUCKETS.length - 1]).color
}

export default function CustomerSatisfaction({ orders }) {
  const filters = useFilters()
  const [catView, setCatView] = useState('bottom')
  const filtered = useMemo(() => applyFilters(orders, filters), [orders, filters])

  const trend = useMemo(() => byMonth(filtered, MONTH_LIST), [filtered])
  const dist = useMemo(() => reviewDistribution(filtered), [filtered])
  const outcomes = useMemo(() => byDeliveryOutcome(filtered), [filtered])
  const catScores = useMemo(() => byCategory(filtered, CATEGORIES).filter((c) => c.orders >= 10), [filtered])
  const catRanked = useMemo(() => {
    const sorted = [...catScores].sort((a, b) => a.avgReview - b.avgReview)
    return catView === 'bottom' ? sorted.slice(0, 5) : sorted.slice(-5).reverse()
  }, [catScores, catView])

  const stateScores = useMemo(() => byState(filtered, STATES).filter((s) => s.orders >= 10), [filtered])
  const lowestStates = useMemo(() => [...stateScores].sort((a, b) => a.avgReview - b.avgReview).slice(0, 5), [stateScores])
  const highestStates = useMemo(() => [...stateScores].sort((a, b) => b.avgReview - a.avgReview).slice(0, 5), [stateScores])
  const stateReviewMap = useMemo(
    () => Object.fromEntries(stateScores.map((s) => [s.state, s.avgReview])),
    [stateScores]
  )

  const negPct = filtered.length ? ((dist[0].count + dist[1].count) / filtered.length) * 100 : 0

  return (
    <div>
      <TopBar title="Customer Satisfaction" subtitle="Explore where and when customer dissatisfaction is most concentrated" />

      <div className="grid-2">
        <Panel title="Average review score trend" subtitle="Monthly average across the period">
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={trend} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
              <CartesianGrid stroke="#e3e6ec" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#5b6472' }} axisLine={{ stroke: '#e3e6ec' }} tickLine={false} interval={2} />
              <YAxis domain={[1, 5]} tick={{ fontSize: 11, fill: '#5b6472' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e3e6ec', fontSize: 12 }} formatter={(v) => v.toFixed(2)} />
              <Line type="monotone" dataKey="avgReview" stroke="var(--accent)" strokeWidth={2} dot={{ r: 2 }} />
            </LineChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="Customer review score distribution" subtitle={`${negPct.toFixed(1)}% of customers are actively dissatisfied (score ≤2)`}>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={dist} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
              <CartesianGrid stroke="#e3e6ec" vertical={false} />
              <XAxis dataKey="score" tick={{ fontSize: 12, fill: '#5b6472' }} axisLine={{ stroke: '#e3e6ec' }} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#5b6472' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e3e6ec', fontSize: 12 }} formatter={(v, n, p) => [`${p.payload.count} (${p.payload.pct.toFixed(1)}%)`, 'Orders']} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {dist.map((d) => (
                  <Cell key={d.score} fill={SCORE_COLORS[d.score]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Panel>
      </div>

      <div className="grid-2">
        <Panel title="Average review score by delivery outcome" subtitle="Dissatisfaction concentrates in late and canceled orders">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={outcomes} layout="vertical" margin={{ top: 4, right: 24, left: 8, bottom: 0 }}>
              <CartesianGrid stroke="#e3e6ec" horizontal={false} />
              <XAxis type="number" domain={[0, 5]} tick={{ fontSize: 11, fill: '#5b6472' }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="outcome" tick={{ fontSize: 11.5, fill: '#14181f' }} axisLine={false} tickLine={false} width={110} />
              <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e3e6ec', fontSize: 12 }} formatter={(v) => v.toFixed(2)} />
              <Bar dataKey="avgReview" radius={[0, 4, 4, 0]}>
                {outcomes.map((o) => (
                  <Cell key={o.key} fill={o.key === 'on_time' ? '#1c9c6e' : o.key === 'other' ? '#9aa1b0' : '#d64545'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Panel>

        <Panel
          title="Product category score ranking"
          subtitle={
            <span>
              <button className={`toggle-btn ${catView === 'bottom' ? 'active' : ''}`} onClick={() => setCatView('bottom')}>Bottom 5</button>
              <button className={`toggle-btn ${catView === 'top' ? 'active' : ''}`} onClick={() => setCatView('top')}>Top 5</button>
            </span>
          }
        >
          <RankList items={catRanked} labelKey="category" valueKey="avgReview" format={(v) => v.toFixed(2)} max={5} color={catView === 'bottom' ? '#f2a65a' : '#1c9c6e'} />
        </Panel>
      </div>

      <Panel title="Geographic satisfaction landscape" subtitle="Dissatisfaction is concentrated in the North and Northeast regions">
        <div className="geo-row">
          <div className="geo-map">
            <BrazilMap
              valueByState={stateReviewMap}
              colorScale={satisfactionColor}
              activeState={filters.state}
              onSelect={(name) => filters.setState(filters.state === name ? '' : name)}
            />
          </div>
          <div className="geo-legend">
            <div className="geo-legend-title">Avg. review score</div>
            {SATISFACTION_BUCKETS.map((b) => (
              <div className="legend-row" key={b.label}>
                <span className="legend-dot" style={{ background: b.color }} />
                {b.label}
              </div>
            ))}
          </div>
          <div className="geo-side">
            <div className="map-side-title">Lowest 5 states</div>
            <RankList items={lowestStates} labelKey="state" valueKey="avgReview" format={(v) => v.toFixed(2)} max={5} color="#e0693f" />
            <div className="map-side-title" style={{ marginTop: 16 }}>Highest 5 states</div>
            <RankList items={highestStates} labelKey="state" valueKey="avgReview" format={(v) => v.toFixed(2)} max={5} color="#4b9e5f" />
          </div>
        </div>
      </Panel>

      <style>{`
        .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px; }
        .toggle-btn {
          background: none; border: 1px solid var(--line); font-size: 11px; padding: 4px 9px;
          border-radius: 6px; margin-right: 6px; cursor: pointer; color: var(--ink-soft);
        }
        .toggle-btn.active { border-color: var(--accent); color: var(--accent); background: var(--accent-soft); }
        .geo-row { display: flex; gap: 20px; align-items: flex-start; }
        .geo-map { flex: 1.1; min-width: 0; }
        .geo-legend { flex: 0 0 130px; padding-top: 8px; }
        .geo-legend-title { font-size: 11.5px; font-weight: 700; color: var(--ink-soft); margin-bottom: 8px; }
        .legend-row { display: flex; align-items: center; gap: 7px; font-size: 12px; color: var(--ink); margin-bottom: 6px; }
        .legend-dot { width: 10px; height: 10px; border-radius: 3px; display: inline-block; flex-shrink: 0; }
        .geo-side { flex: 1.2; min-width: 0; }
        .map-side-title { font-size: 11.5px; font-weight: 700; color: var(--ink-soft); text-transform: uppercase; letter-spacing: 0.03em; margin-bottom: 10px; }
        @media (max-width: 1000px) { .grid-2 { grid-template-columns: 1fr; } }
        @media (max-width: 800px) { .geo-row { flex-direction: column; } }
      `}</style>
    </div>
  )
}
