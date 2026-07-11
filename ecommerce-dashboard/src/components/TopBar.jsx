import { YEARS } from '../data/olistData.js'
import { useFilters } from '../context/FilterContext.jsx'

export default function TopBar({ title, subtitle }) {
  const { years, toggleYear } = useFilters()

  return (
    <div className="topbar">
      <div>
        <h1 className="page-title">{title}</h1>
        <p className="page-sub">{subtitle}</p>
      </div>
      <div className="year-toggle">
        {YEARS.map((y) => (
          <button key={y} className={`year-btn ${years.includes(y) ? 'active' : ''}`} onClick={() => toggleYear(y)}>
            {y}
          </button>
        ))}
      </div>

      <style>{`
        .topbar {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 20px;
          flex-wrap: wrap;
          gap: 12px;
        }
        .page-title {
          font-family: var(--font-display);
          font-size: 26px;
          font-weight: 700;
          margin: 0 0 4px;
          color: var(--navy);
        }
        .page-sub { font-size: 13px; color: var(--ink-soft); margin: 0; }
        .year-toggle { display: flex; gap: 6px; }
        .year-btn {
          background: #fff;
          border: 1px solid var(--line);
          border-radius: 6px;
          padding: 7px 14px;
          font-size: 13px;
          font-weight: 600;
          color: var(--ink-soft);
          cursor: pointer;
        }
        .year-btn.active { border-color: var(--accent); color: var(--accent); background: var(--accent-soft); }
      `}</style>
    </div>
  )
}
