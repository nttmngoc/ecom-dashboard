export function Panel({ title, subtitle, children, style }) {
  return (
    <div className="panel" style={style}>
      {title && (
        <div className="panel-head">
          <div className="panel-title">{title}</div>
          {subtitle && <div className="panel-sub">{subtitle}</div>}
        </div>
      )}
      {children}

      <style>{`
        .panel {
          background: var(--surface);
          border: 1px solid var(--line);
          border-radius: 10px;
          padding: 18px;
          height: 100%;
        }
        .panel-head { margin-bottom: 12px; }
        .panel-title { font-size: 13.5px; font-weight: 700; color: var(--navy); }
        .panel-sub { font-size: 12px; color: var(--ink-soft); margin-top: 2px; }
      `}</style>
    </div>
  )
}

export function RankList({ items, valueKey, labelKey, format, max, color = 'var(--accent)' }) {
  const top = max || Math.max(...items.map((i) => i[valueKey]), 1)
  return (
    <div className="rank-list">
      {items.map((item) => (
        <div className="rank-row" key={item[labelKey]}>
          <div className="rank-top">
            <span className="rank-name">{item[labelKey]}</span>
            <span className="rank-value">{format ? format(item[valueKey]) : item[valueKey]}</span>
          </div>
          <div className="rank-track">
            <div className="rank-fill" style={{ width: `${(item[valueKey] / top) * 100}%`, background: color }} />
          </div>
        </div>
      ))}

      <style>{`
        .rank-row { margin-bottom: 10px; }
        .rank-row:last-child { margin-bottom: 0; }
        .rank-top { display: flex; justify-content: space-between; font-size: 12.5px; margin-bottom: 5px; }
        .rank-name { color: var(--ink); }
        .rank-value { font-family: var(--font-mono); color: var(--ink-soft); }
        .rank-track { background: var(--navy-soft); border-radius: 3px; height: 6px; overflow: hidden; }
        .rank-fill { height: 100%; border-radius: 3px; }
      `}</style>
    </div>
  )
}
