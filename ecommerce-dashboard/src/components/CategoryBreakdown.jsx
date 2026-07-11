import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'

const COLORS = ['#ff5a36', '#232c47', '#5b7fd6', '#f2a65a', '#1c9c6e']

export default function CategoryBreakdown({ data, activeCategory, onSelect }) {
  return (
    <div className="panel">
      <div className="panel-title">Revenue by category</div>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={data}
            dataKey="revenue"
            nameKey="category"
            innerRadius={55}
            outerRadius={85}
            paddingAngle={2}
            onClick={(entry) => onSelect(entry.category)}
            cursor="pointer"
          >
            {data.map((entry, i) => (
              <Cell
                key={entry.category}
                fill={COLORS[i % COLORS.length]}
                opacity={activeCategory && activeCategory !== entry.category ? 0.25 : 1}
                stroke="#fff"
                strokeWidth={2}
              />
            ))}
          </Pie>
          <Tooltip formatter={(v) => `€${Math.round(v).toLocaleString('de-DE')}`} />
        </PieChart>
      </ResponsiveContainer>
      <div className="legend">
        {data.map((entry, i) => (
          <button
            key={entry.category}
            className="legend-item"
            style={{ opacity: activeCategory && activeCategory !== entry.category ? 0.4 : 1 }}
            onClick={() => onSelect(entry.category)}
          >
            <span className="dot" style={{ background: COLORS[i % COLORS.length] }} />
            {entry.category}
          </button>
        ))}
      </div>

      <style>{`
        .panel {
          background: var(--surface);
          border: 1px solid var(--line);
          border-radius: 10px;
          padding: 18px;
        }
        .panel-title {
          font-size: 13px;
          font-weight: 700;
          color: var(--navy);
          margin-bottom: 6px;
        }
        .legend {
          display: flex;
          flex-wrap: wrap;
          gap: 8px 14px;
          margin-top: 6px;
        }
        .legend-item {
          display: flex;
          align-items: center;
          gap: 6px;
          background: none;
          border: none;
          font-size: 11.5px;
          color: var(--ink-soft);
          cursor: pointer;
          padding: 2px 0;
        }
        .dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          display: inline-block;
        }
      `}</style>
    </div>
  )
}
