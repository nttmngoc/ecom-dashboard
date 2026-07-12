import { useEffect, useRef, useState } from 'react'

function useCountUp(target, duration = 500) {
  const [value, setValue] = useState(target)
  const prev = useRef(target)

  useEffect(() => {
    const start = prev.current
    const startTime = performance.now()

    let raf
    function tick(now) {
      const progress = Math.min((now - startTime) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(start + (target - start) * eased)
      if (progress < 1) raf = requestAnimationFrame(tick)
      else prev.current = target
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target])

  return value
}

export default function KpiCard({ label, value, format, delta, deltaGood = true, sub }) {
  const animated = useCountUp(value)

  return (
    <div className="kpi-card">
      <div className="kpi-label">{label}</div>
      <div className="kpi-value">{format(animated)}</div>
      {delta !== undefined && (
        <div className={`kpi-delta ${delta >= 0 === deltaGood ? 'up' : 'down'}`}>
          {delta >= 0 ? '▲' : '▼'} {Math.abs(delta).toFixed(1)}% vs. prior filter
        </div>
      )}
      {sub && (
        <div className="kpi-sub">
          {sub.map((s) => (
            <div className="kpi-sub-item" key={s.label}>
              <div className="kpi-sub-label">{s.label}</div>
              <div className="kpi-sub-value">{s.value}</div>
            </div>
          ))}
        </div>
      )}

      <style>{`
        .kpi-card {
          background: var(--surface);
          border: 1px solid var(--line);
          border-radius: 10px;
          padding: 18px 20px;
          min-width: 0;
        }
        .kpi-label {
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          color: var(--ink-soft);
          margin-bottom: 10px;
        }
        .kpi-value {
          font-family: var(--font-mono);
          font-size: 28px;
          font-weight: 500;
          color: var(--navy);
          font-variant-numeric: tabular-nums;
        }
        .kpi-delta {
          margin-top: 8px;
          font-size: 12px;
          font-family: var(--font-mono);
        }
        .kpi-delta.up { color: var(--positive); }
        .kpi-delta.down { color: var(--negative); }
        .kpi-sub {
          display: flex;
          gap: 16px;
          margin-top: 12px;
          padding-top: 12px;
          border-top: 1px solid var(--line);
        }
        .kpi-sub-item { flex: 1; min-width: 0; }
        .kpi-sub-label { font-size: 10.5px; color: var(--ink-soft); margin-bottom: 3px; }
        .kpi-sub-value { font-size: 13px; font-family: var(--font-mono); color: var(--navy); font-weight: 500; }
      `}</style>
    </div>
  )
}
