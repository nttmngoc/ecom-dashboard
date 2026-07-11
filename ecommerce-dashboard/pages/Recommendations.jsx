import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts'
import { Panel } from '../components/Panel.jsx'

const insights = [
  {
    n: 1,
    title: 'Delivery delays are the strongest dissatisfaction driver',
    stat: '9.5x',
    statLabel: 'higher negative review rate after 35 delivery days',
    detail: '35+ delivery days (72.1%) vs. within 7 days (7.6%)',
  },
  {
    n: 2,
    title: 'Dissatisfaction is concentrated in a small seller & category group',
    stat: '19 + 4',
    statLabel: 'sellers and categories concentrating dissatisfaction',
    detail: '37.5% (sellers) · 22.3% (categories) vs. platform average',
  },
  {
    n: 3,
    title: 'North & Northeast regions lag in delivery performance',
    stat: '2–4x',
    statLabel: 'higher late rates in the lowest-performing states',
    detail: 'vs. the highest-performing state benchmark',
  },
]

const initiatives = [
  { name: 'Delivery SLA alerts', effort: 2, impact: 8, z: 60 },
  { name: 'High-risk seller watch', effort: 3, impact: 6.5, z: 50 },
  { name: 'Freight transparency', effort: 2.5, impact: 4, z: 40 },
  { name: 'Regional network expansion', effort: 8, impact: 7.5, z: 70 },
  { name: 'SLA renegotiation', effort: 7, impact: 5.5, z: 45 },
  { name: 'Category freight review', effort: 6, impact: 3, z: 35 },
]

const actions = [
  {
    n: '01',
    title: 'Delivery reliability',
    items: ['Day-21 SLA alerts for orders at risk of delay', 'Carrier capacity pre-commitment', 'Target late rate at the best-performing region benchmark'],
    impact: '~1,000 negative reviews recoverable',
  },
  {
    n: '02',
    title: 'Seller & category remediation',
    items: ['Review high-risk seller performance', 'Targeted seller coaching and probation programs', 'Category audit for the lowest-scoring categories'],
    impact: '~1,400 negative reviews recoverable',
  },
  {
    n: '03',
    title: 'Regional delivery investment',
    items: ['Carrier network expansion in underserved regions', 'Fulfillment capacity increase in high-risk states', 'Focus on the lowest-performing states'],
    impact: 'Unlock underserved regional demand',
  },
]

export default function Recommendations() {
  return (
    <div>
      <div className="rec-header">
        <h1 className="page-title">Recommendations</h1>
        <p className="page-sub">Operational priorities to reduce customer dissatisfaction across the platform</p>
      </div>

      <div className="insight-grid">
        {insights.map((i) => (
          <div className="insight-card" key={i.n}>
            <span className="insight-num">{i.n}</span>
            <p className="insight-title">{i.title}</p>
            <p className="insight-stat">{i.stat}</p>
            <p className="insight-stat-label">{i.statLabel}</p>
            <p className="insight-detail">{i.detail}</p>
          </div>
        ))}
      </div>

      <div className="grid-2">
        <Panel title="Impact vs. effort matrix" subtitle="Initiatives prioritized by expected business impact and implementation effort">
          <ResponsiveContainer width="100%" height={260}>
            <ScatterChart margin={{ top: 8, right: 16, left: -8, bottom: 4 }}>
              <ReferenceLine x={5} stroke="#e3e6ec" />
              <ReferenceLine y={5.5} stroke="#e3e6ec" />
              <XAxis type="number" dataKey="effort" name="Implementation effort" domain={[0, 10]} tick={{ fontSize: 10.5, fill: '#5b6472' }} axisLine={{ stroke: '#e3e6ec' }} tickLine={false} label={{ value: 'Implementation effort →', position: 'insideBottom', offset: -2, fontSize: 11, fill: '#5b6472' }} />
              <YAxis type="number" dataKey="impact" name="Business impact" domain={[0, 10]} tick={{ fontSize: 10.5, fill: '#5b6472' }} axisLine={false} tickLine={false} label={{ value: 'Business impact →', angle: -90, position: 'insideLeft', fontSize: 11, fill: '#5b6472' }} />
              <ZAxis type="number" dataKey="z" range={[80, 500]} />
              <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e3e6ec', fontSize: 12 }} formatter={(v, name, p) => [v, name]} labelFormatter={() => ''} content={({ payload }) => payload && payload.length ? (
                <div style={{ background: '#fff', border: '1px solid #e3e6ec', borderRadius: 8, padding: '6px 10px', fontSize: 12 }}>{payload[0].payload.name}</div>
              ) : null} />
              <Scatter data={initiatives} fill="var(--navy)">
                {initiatives.map((it, i) => (
                  <Cell key={it.name} fill={it.effort <= 5 && it.impact >= 5.5 ? '#1c9c6e' : it.effort > 5 && it.impact >= 5.5 ? 'var(--navy)' : '#9aa1b0'} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
          <div className="quadrant-labels">
            <span>Quick wins</span><span>Strategy bets</span><span>Nice to have</span><span>Deprioritize</span>
          </div>
        </Panel>

        <Panel title="Priority actions" subtitle="Ranked by expected impact">
          <div className="actions">
            {actions.map((a) => (
              <div className="action-row" key={a.n}>
                <span className="action-num">{a.n}</span>
                <div>
                  <p className="action-title">{a.title}</p>
                  <ul>
                    {a.items.map((it) => (
                      <li key={it}>{it}</li>
                    ))}
                  </ul>
                  <p className="action-impact">{a.impact}</p>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <style>{`
        .rec-header { margin-bottom: 20px; }
        .page-title { font-family: var(--font-display); font-size: 26px; font-weight: 700; margin: 0 0 4px; color: var(--navy); }
        .page-sub { font-size: 13px; color: var(--ink-soft); margin: 0; }
        .insight-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin-bottom: 16px; }
        .insight-card { background: #fff; border: 1px solid var(--line); border-top: 3px solid var(--accent); border-radius: 10px; padding: 16px; }
        .insight-num {
          display: inline-flex; align-items: center; justify-content: center; width: 22px; height: 22px;
          background: var(--accent-soft); color: var(--accent); font-weight: 700; font-size: 12px; border-radius: 50%; margin-bottom: 8px;
        }
        .insight-title { font-size: 13px; font-weight: 600; color: var(--navy); margin: 0 0 10px; }
        .insight-stat { font-family: var(--font-mono); font-size: 24px; font-weight: 500; color: var(--accent); margin: 0; }
        .insight-stat-label { font-size: 11.5px; color: var(--ink-soft); margin: 2px 0 8px; }
        .insight-detail { font-size: 11.5px; color: var(--ink-soft); margin: 0; border-top: 1px solid var(--line); padding-top: 8px; }
        .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .quadrant-labels { display: flex; justify-content: space-between; font-size: 11px; color: var(--ink-soft); margin-top: 4px; padding: 0 8px; }
        .actions { display: flex; flex-direction: column; gap: 14px; }
        .action-row { display: flex; gap: 12px; }
        .action-num { font-family: var(--font-mono); font-size: 20px; font-weight: 500; color: var(--accent); }
        .action-title { font-size: 13px; font-weight: 700; color: var(--navy); margin: 0 0 6px; }
        .action-row ul { margin: 0 0 6px; padding-left: 16px; font-size: 12px; color: var(--ink-soft); }
        .action-row li { margin-bottom: 2px; }
        .action-impact { font-size: 12px; font-weight: 600; color: var(--positive); margin: 0; }
        @media (max-width: 1000px) {
          .insight-grid { grid-template-columns: 1fr; }
          .grid-2 { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  )
}
