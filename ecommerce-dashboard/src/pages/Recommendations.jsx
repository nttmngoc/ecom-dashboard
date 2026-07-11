import { useMemo } from 'react'
import { useFilters } from '../context/FilterContext.jsx'
import TopBar from '../components/TopBar.jsx'
import { Panel } from '../components/Panel.jsx'

const INSIGHTS = [
  {
    title: 'Boost Electronics in Q4',
    priority: 'High',
    color: '#ff5a36',
    body: 'Electronics revenue peaks in Nov–Dec (+60%). Increase ad spend and inventory buffers for Wireless Earbuds Pro and Smart Watch SE starting mid-October.',
  },
  {
    title: 'Expand North America footprint',
    priority: 'High',
    color: '#ff5a36',
    body: 'North America drives 35% more revenue per order than LATAM. Prioritising Prime-style fulfilment and localised promotions could lift conversion by an estimated 3–5%.',
  },
  {
    title: 'Reduce Beauty return rate',
    priority: 'Medium',
    color: '#f2a65a',
    body: 'Clay Mask Trio and SPF 50 Daily Cream account for 38% of Beauty returns. Improving product descriptions and adding shade-matching tools could reduce returns by ~1.5pp.',
  },
  {
    title: 'Recover summer conversion dip',
    priority: 'Medium',
    color: '#f2a65a',
    body: 'Jul–Aug shows a consistent 15% conversion drop. A mid-year flash sale or loyalty double-points event could offset seasonal decline.',
  },
  {
    title: 'Optimise delivery in APAC',
    priority: 'Low',
    color: '#1c9c6e',
    body: 'APAC on-time delivery sits at 76%, 8pp below North America. Partnering with regional 3PL providers is expected to close the gap within two quarters.',
  },
  {
    title: 'Cross-sell Sports into Apparel buyers',
    priority: 'Low',
    color: '#1c9c6e',
    body: 'Apparel and Sports share a 62% buyer overlap by region. A "Complete the look" recommendation widget could lift Sports AOV by €4–6 per order.',
  },
]

export default function Recommendations({ orders }) {
  const { category } = useFilters()

  const relevantInsights = useMemo(() => {
    if (!category) return INSIGHTS
    return INSIGHTS.filter((i) =>
      i.body.toLowerCase().includes(category.toLowerCase()) || i.title.toLowerCase().includes(category.toLowerCase())
    ).concat(INSIGHTS.filter((i) =>
      !i.body.toLowerCase().includes(category.toLowerCase()) && !i.title.toLowerCase().includes(category.toLowerCase())
    )).slice(0, 6)
  }, [category])

  return (
    <div>
      <TopBar title="Recommendations" subtitle="Actionable growth opportunities derived from the data" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
        {relevantInsights.map((ins) => (
          <Panel key={ins.title}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: '#14181f', lineHeight: 1.35, flex: 1 }}>{ins.title}</div>
              <span style={{
                marginLeft: 10,
                fontSize: 11,
                fontWeight: 700,
                padding: '3px 9px',
                borderRadius: 999,
                background: ins.color + '20',
                color: ins.color,
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}>{ins.priority}</span>
            </div>
            <p style={{ fontSize: 13, color: '#5b6472', lineHeight: 1.6, margin: 0 }}>{ins.body}</p>
          </Panel>
        ))}
      </div>
    </div>
  )
}
