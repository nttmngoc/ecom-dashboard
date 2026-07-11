import { useMemo, useState } from 'react'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts'
import { STATES, CATEGORIES, MONTH_LIST } from '../data/olistData.js'
import { applyFilters, byMonth, reviewDistribution, byDeliveryOutcome, byCategory, byState } from '../data/aggregations.js'
import { useFilters } from '../context/FilterContext.jsx'
import TopBar from '../components/TopBar.jsx'
import { Panel, RankList } from '../components/Panel.jsx'

const SCORE_COLORS = { 1: '#d64545', 2: '#f2a65a', 3: '#e8c547', 4: '#8bc98a', 5: '#1c9c6e' }

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

      <div className="grid-2">
        <Panel title="Lowest 5 states by review score" subtitle="Dissatisfaction concentrated in North and Northeast">
          <RankList items={lowestStates} labelKey="state" valueKey="avgReview" format={(v) => v.toFixed(2)} max={5} color="#f2a65a" />
        </Panel>
        <Panel title="Highest 5 states by review score">
          <RankList items={highestStates} labelKey="state" valueKey="avgReview" format={(v) => v.toFixed(2)} max={5} color="#1c9c6e" />
        </Panel>
      </div>

      <style>{`
        .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px; }
        .toggle-btn {
          background: none; border: 1px solid var(--line); font-size: 11px; padding: 4px 9px;
          border-radius: 6px; margin-right: 6px; cursor: pointer; color: var(--ink-soft);
        }
        .toggle-btn.active { border-color: var(--accent); color: var(--accent); background: var(--accent-soft); }
        @media (max-width: 1000px) { .grid-2 { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  )
}
