export default function FilterChips({ filters, onRemove, onClearAll }) {
  const entries = Object.entries(filters).filter(([, v]) => v)

  return (
    <div className="chips-row">
      <span className="chips-label">
        {entries.length ? 'Active filters' : 'Click any chart to cross-filter the report'}
      </span>
      {entries.map(([key, val]) => (
        <button key={key} className="chip" onClick={() => onRemove(key)}>
          {val} <span className="chip-x">×</span>
        </button>
      ))}
      {entries.length > 0 && (
        <button className="chip chip-clear" onClick={onClearAll}>
          Clear all
        </button>
      )}

      <style>{`
        .chips-row {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
          min-height: 32px;
          margin-bottom: 18px;
        }
        .chips-label {
          font-size: 12px;
          color: var(--ink-soft);
          margin-right: 4px;
        }
        .chip {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: var(--accent-soft);
          color: var(--accent);
          border: 1px solid #ffd0c0;
          border-radius: 999px;
          padding: 5px 12px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
        }
        .chip-x { font-size: 14px; line-height: 1; }
        .chip-clear {
          background: transparent;
          border: 1px solid var(--line);
          color: var(--ink-soft);
        }
      `}</style>
    </div>
  )
}
