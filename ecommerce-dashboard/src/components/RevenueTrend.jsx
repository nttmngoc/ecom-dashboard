import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function RevenueTrend({ data }) {
  return (
    <div className="panel">
      <div className="panel-title">Revenue trend <span className="panel-sub">by month</span></div>
      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={data} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
          <defs>
            <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ff5a36" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#ff5a36" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#e3e6ec" vertical={false} />
          <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#5b6472' }} axisLine={{ stroke: '#e3e6ec' }} tickLine={false} />
          <YAxis
            tick={{ fontSize: 11, fill: '#5b6472' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `€${Math.round(v / 1000)}k`}
          />
          <Tooltip
            formatter={(v) => [`€${v.toLocaleString('de-DE', { maximumFractionDigits: 0 })}`, 'Revenue']}
            contentStyle={{ borderRadius: 8, border: '1px solid #e3e6ec', fontSize: 12 }}
          />
          <Area type="monotone" dataKey="revenue" stroke="#ff5a36" strokeWidth={2} fill="url(#revFill)" />
        </AreaChart>
      </ResponsiveContainer>

      <style>{`
        .panel {
          background: var(--surface);
          border: 1px solid var(--line);
          border-radius: 10px;
          padding: 18px 18px 8px;
        }
        .panel-title {
          font-size: 13px;
          font-weight: 700;
          color: var(--navy);
          margin-bottom: 6px;
        }
        .panel-sub {
          font-weight: 400;
          color: var(--ink-soft);
          margin-left: 6px;
        }
      `}</style>
    </div>
  )
}
