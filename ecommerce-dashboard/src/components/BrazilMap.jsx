import { useMemo } from 'react'
import { geoMercator, geoPath } from 'd3-geo'
import brazilGeo from '../data/brazil-states.json'

const WIDTH = 320
const HEIGHT = 300

export default function BrazilMap({ valueByState, colorScale, activeState, onSelect, emptyColor = '#eef0f6' }) {
  const { projection, path } = useMemo(() => {
    const projection = geoMercator().preclip((sink) => sink).fitSize([WIDTH, HEIGHT], brazilGeo)
    return { projection, path: geoPath(projection) }
  }, [])

  return (
    <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} width="100%" height={HEIGHT} role="img" aria-label="Map of Brazil states">
      {brazilGeo.features.map((feature) => {
        const name = feature.properties.name
        const value = valueByState[name]
        const fill = value === undefined ? emptyColor : colorScale(value)
        const isActive = activeState === name
        return (
          <path
            key={feature.properties.sigla}
            d={path(feature)}
            fill={fill}
            stroke="#fff"
            strokeWidth={isActive ? 1.6 : 0.6}
            style={{ cursor: onSelect ? 'pointer' : 'default', opacity: activeState && !isActive ? 0.55 : 1 }}
            onClick={() => onSelect && onSelect(name)}
          >
            <title>{name}{value !== undefined ? `: ${typeof value === 'number' ? value.toFixed(2) : value}` : ''}</title>
          </path>
        )
      })}
    </svg>
  )
}
