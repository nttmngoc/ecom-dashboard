import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, ResponsiveContainer } from 'recharts'

export default function RegionBar({ data, activeRegion, onSelect }) {
  return (
    <div className="panel">
      <div className="panel-title">Revenue by region <span className="panel-sub">click a bar to filter</span></div>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} layout="vertical" margin={{ top: 4, right: 24, left: 8, bottom: 0 }}>
          <CartesianGrid stroke="#e3e6ec" horizontal={false} />
          <XAxis type="number" tickFormatter={(v) => `€${Math.round(v / 1000)}k`} tick={{ fontSize: 11, fill: '#5b6472' }} axisLine={false} tickLine={false} />
          <YAxis type="category" dataKey="region" tick={{ fontSize: 12, fill: '#14181f' }} axisLine={false} tickLine={false} width={90} />
          <Tooltip formatter={(v) => `€${Math.round(v).toLocaleString('de-DE')}`} contentStyle={{ borderRadius: 8, border: '1px solid #e3e6ec', fontSize: 12 }} />
          <Bar dataKey="revenue" radius={[0, 4, 4, 0]} cursor="pointer" onClick={(entry) => onSelect(entry.region)}>
            {data.map((entry) => (
              <Cell
                key={entry.region}
                fill={activeRegion === entry.region ? '#ff5a36' : '#232c47'}
                opacity={activeRegion && activeRegion !== entry.region ? 0.3 : 1}
              />
            ))}
          </Bar>
        </BarChart>
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
          font-size: 11.5px;
        }
      `}</style>
    </div>
  )
}
