export default function TopProducts({ data }) {
  const max = Math.max(...data.map((d) => d.revenue), 1)

  return (
    <div className="panel">
      <div className="panel-title">Top products <span className="panel-sub">in current filter</span></div>
      <div className="table">
        {data.map((p, i) => (
          <div className="row" key={p.product}>
            <span className="rank">{String(i + 1).padStart(2, '0')}</span>
            <div className="row-main">
              <div className="row-top">
                <span className="name">{p.product}</span>
                <span className="value">€{Math.round(p.revenue).toLocaleString('de-DE')}</span>
              </div>
              <div className="bar-track">
                <div className="bar-fill" style={{ width: `${(p.revenue / max) * 100}%` }} />
              </div>
            </div>
          </div>
        ))}
        {data.length === 0 && <div className="empty">No orders match the current filters.</div>}
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
          margin-bottom: 12px;
        }
        .panel-sub {
          font-weight: 400;
          color: var(--ink-soft);
          margin-left: 6px;
          font-size: 11.5px;
        }
        .row {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 9px 0;
          border-bottom: 1px solid var(--line);
        }
        .row:last-child { border-bottom: none; }
        .rank {
          font-family: var(--font-mono);
          font-size: 11px;
          color: var(--ink-soft);
          width: 18px;
        }
        .row-main { flex: 1; min-width: 0; }
        .row-top {
          display: flex;
          justify-content: space-between;
          font-size: 12.5px;
          margin-bottom: 5px;
        }
        .name { color: var(--ink); font-weight: 500; }
        .value { font-family: var(--font-mono); color: var(--ink-soft); }
        .bar-track {
          background: var(--navy-soft);
          border-radius: 3px;
          height: 5px;
          overflow: hidden;
        }
        .bar-fill {
          background: var(--accent);
          height: 100%;
          border-radius: 3px;
        }
        .empty {
          font-size: 12.5px;
          color: var(--ink-soft);
          padding: 12px 0;
        }
      `}</style>
    </div>
  )
}
