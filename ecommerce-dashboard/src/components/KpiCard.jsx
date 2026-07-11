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

export default function KpiCard({ label, value, format, delta, deltaGood = true }) {
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
      `}</style>
    </div>
  )
}
