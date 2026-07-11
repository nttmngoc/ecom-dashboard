import { Home, Star, Truck, ShieldCheck, Lightbulb, RotateCcw } from 'lucide-react'
import { STATES, CATEGORIES } from '../data/olistData.js'
import { useFilters } from '../context/FilterContext.jsx'

const PAGES = [
  { key: 'overview', label: 'Overview', icon: Home },
  { key: 'satisfaction', label: 'Customer Satisfaction', icon: Star },
  { key: 'delivery', label: 'Delivery Performance', icon: Truck },
  { key: 'quality', label: 'Seller & Product Quality', icon: ShieldCheck },
  { key: 'recommendations', label: 'Recommendations', icon: Lightbulb },
]

export default function Sidebar({ page, setPage }) {
  const { state, setState, category, setCategory, reset } = useFilters()
  const showFilters = page !== 'recommendations'

  return (
    <aside className="sidebar">
      <div className="brand">
        <span className="brand-mark">olist</span>
      </div>

      <nav className="nav">
        {PAGES.map((p) => {
          const Icon = p.icon
          const active = page === p.key
          return (
            <button key={p.key} className={`nav-item ${active ? 'active' : ''}`} onClick={() => setPage(p.key)}>
              <Icon size={17} strokeWidth={1.8} />
              <span>{p.label}</span>
            </button>
          )
        })}
      </nav>

      {showFilters && (
        <div className="filter-block">
          <div className="filter-title">Filter</div>

          <label className="filter-label">State</label>
          <select value={state} onChange={(e) => setState(e.target.value)}>
            <option value="">All</option>
            {STATES.map((s) => (
              <option key={s.code} value={s.name}>
                {s.name}
              </option>
            ))}
          </select>

          <label className="filter-label">Product category</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">All</option>
            {CATEGORIES.map((c) => (
              <option key={c.name} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>

          <button className="reset-btn" onClick={reset}>
            <RotateCcw size={13} /> Reset filters
          </button>
        </div>
      )}

      <div className="sidebar-footer">Data updated to Aug 31, 2018</div>

      <style>{`
        .sidebar {
          width: 240px;
          flex-shrink: 0;
          background: var(--navy);
          color: #fff;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          padding: 20px 16px;
        }
        .brand { margin-bottom: 24px; padding: 10px 12px; background: var(--accent); border-radius: 8px; display: inline-block; }
        .brand-mark { font-family: var(--font-display); font-weight: 700; font-size: 18px; letter-spacing: -0.02em; color: #fff; }
        .nav { display: flex; flex-direction: column; gap: 2px; }
        .nav-item {
          display: flex;
          align-items: center;
          gap: 10px;
          background: none;
          border: none;
          color: #b7bccb;
          font-size: 13.5px;
          font-family: var(--font-body);
          text-align: left;
          padding: 10px 12px;
          border-radius: 8px;
          cursor: pointer;
        }
        .nav-item:hover { background: rgba(255,255,255,0.05); color: #fff; }
        .nav-item.active { background: rgba(255,90,54,0.15); color: #fff; border-left: 3px solid var(--accent); padding-left: 9px; }
        .filter-block { margin-top: 28px; padding-top: 16px; border-top: 1px solid rgba(255,255,255,0.1); }
        .filter-title { font-size: 11px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: #8890a3; margin-bottom: 10px; }
        .filter-label { display: block; font-size: 11.5px; color: #b7bccb; margin: 10px 0 4px; }
        .filter-block select {
          width: 100%;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.14);
          color: #fff;
          border-radius: 6px;
          padding: 7px 8px;
          font-size: 12.5px;
        }
        .filter-block select option { color: #14181f; }
        .reset-btn {
          margin-top: 16px;
          display: flex;
          align-items: center;
          gap: 6px;
          background: none;
          border: 1px solid var(--accent);
          color: var(--accent);
          font-size: 12px;
          font-weight: 600;
          padding: 7px 10px;
          border-radius: 6px;
          cursor: pointer;
          width: 100%;
          justify-content: center;
        }
        .sidebar-footer {
          margin-top: auto;
          font-size: 10.5px;
          color: #6b7286;
          padding-top: 16px;
        }
      `}</style>
    </aside>
  )
}
