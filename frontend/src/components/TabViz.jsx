export default function TabViz({ result, antenna }) {
  if (!result) {
    return (
      <div style={s.empty}>
        <span style={{ fontSize: 40 }}>📡</span>
        <p>Enter frequency and hit <strong>Calculate</strong> to visualize your antenna.</p>
      </div>
    )
  }

  return (
    <div style={s.container}>
      <AntennaDiagram result={result} antenna={antenna} />
      <RadiationPattern pattern={result.pattern} antenna={antenna} />
    </div>
  )
}

function AntennaDiagram({ result, antenna }) {
  const { total_m, arm_m, freq, vf } = result
  const totalFt = total_m * 3.28084
  const armFt   = arm_m  * 3.28084

  return (
    <div style={s.panel}>
      <div style={s.title}>
        {antenna === 'dipole' ? 'Half-Wave Dipole' : 'Quarter-Wave Monopole'}
        &nbsp;&nbsp;|&nbsp;&nbsp;{freq} MHz&nbsp;&nbsp;|&nbsp;&nbsp;VF = {vf}
      </div>
      <svg viewBox="0 0 480 200" style={{ width: '100%', maxWidth: 480 }}>
        {antenna === 'dipole' ? (
          <>
            {/* Left arm */}
            <line x1="80" y1="100" x2="240" y2="100" stroke="#4f8ef7" strokeWidth="8" strokeLinecap="round" />
            {/* Right arm */}
            <line x1="240" y1="100" x2="400" y2="100" stroke="#4f8ef7" strokeWidth="8" strokeLinecap="round" />
            {/* Feed point */}
            <circle cx="240" cy="100" r="9" fill="#f7914f" />
            {/* Dimension arrows */}
            <line x1="80" y1="135" x2="400" y2="135" stroke="#8891aa" strokeWidth="1.5" markerEnd="url(#arr)" markerStart="url(#arr)" />
            <text x="240" y="155" textAnchor="middle" fill="#8891aa" fontSize="12" fontFamily="JetBrains Mono, monospace">
              {total_m.toFixed(4)} m  /  {totalFt.toFixed(4)} ft
            </text>
            <text x="160" y="88" textAnchor="middle" fill="#4fcc8a" fontSize="12" fontFamily="JetBrains Mono, monospace">
              {arm_m.toFixed(4)} m
            </text>
            <text x="320" y="88" textAnchor="middle" fill="#4fcc8a" fontSize="12" fontFamily="JetBrains Mono, monospace">
              {arm_m.toFixed(4)} m
            </text>
            <text x="240" y="78" textAnchor="middle" fill="#f7914f" fontSize="11" fontFamily="Inter, sans-serif">
              Feed Point
            </text>
          </>
        ) : (
          <>
            {/* Ground plane */}
            <line x1="100" y1="160" x2="380" y2="160" stroke="#2e3350" strokeWidth="3" />
            <rect x="100" y="160" width="280" height="18" fill="#2e3350" opacity="0.4" />
            <text x="240" y="190" textAnchor="middle" fill="#8891aa" fontSize="11" fontFamily="Inter, sans-serif">Ground Plane</text>
            {/* Monopole */}
            <line x1="240" y1="160" x2="240" y2="50" stroke="#4f8ef7" strokeWidth="8" strokeLinecap="round" />
            {/* Feed */}
            <circle cx="240" cy="160" r="9" fill="#f7914f" />
            <circle cx="240" cy="50"  r="6" fill="#4f8ef7" />
            {/* Dimension */}
            <line x1="280" y1="160" x2="280" y2="50" stroke="#8891aa" strokeWidth="1.5" markerEnd="url(#arr)" markerStart="url(#arr)" />
            <text x="310" y="112" fill="#4fcc8a" fontSize="12" fontFamily="JetBrains Mono, monospace">
              {total_m.toFixed(4)} m
            </text>
            <text x="310" y="128" fill="#4fcc8a" fontSize="11" fontFamily="JetBrains Mono, monospace">
              {totalFt.toFixed(4)} ft
            </text>
          </>
        )}

        {/* Arrowhead marker */}
        <defs>
          <marker id="arr" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
            <path d="M0,0 L8,4 L0,8 Z" fill="#8891aa" />
          </marker>
        </defs>
      </svg>
    </div>
  )
}

function RadiationPattern({ pattern, antenna }) {
  if (!pattern?.length) return null

  const SIZE = 200
  const CX = SIZE / 2
  const CY = SIZE / 2
  const R  = 80

  const points = pattern
    .map(({ theta, r }) => {
      const x = CX + r * R * Math.cos(theta)
      const y = CY - r * R * Math.sin(theta)
      return `${x},${y}`
    })
    .join(' ')

  return (
    <div style={s.panel}>
      <div style={s.title}>Radiation Pattern (E-plane)</div>
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} style={{ width: 220, height: 220 }}>
        {/* Grid circles */}
        {[0.25, 0.5, 0.75, 1.0].map(r => (
          <circle key={r} cx={CX} cy={CY} r={r * R}
            stroke="#2e3350" strokeWidth="0.8" strokeDasharray="4,3" fill="none" />
        ))}
        {/* Axes */}
        <line x1={CX - R - 10} y1={CY} x2={CX + R + 10} y2={CY} stroke="#2e3350" strokeWidth="0.8" />
        <line x1={CX} y1={CY - R - 10} x2={CX} y2={CY + R + 10} stroke="#2e3350" strokeWidth="0.8" />

        {/* Pattern fill */}
        <polygon points={points} fill="#4f8ef7" fillOpacity="0.18" stroke="#4f8ef7" strokeWidth="1.8" />
      </svg>
    </div>
  )
}

const s = {
  container: {
    display: 'flex', flexWrap: 'wrap', gap: 24,
    padding: 24, height: '100%', alignItems: 'flex-start',
  },
  panel: {
    display: 'flex', flexDirection: 'column', gap: 16,
    alignItems: 'center', flex: 1, minWidth: 260,
  },
  title: {
    fontSize: 13, color: 'var(--text)', fontWeight: 600,
    letterSpacing: '0.02em',
  },
  empty: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', height: '100%', gap: 14,
    color: 'var(--muted)', fontSize: 14, textAlign: 'center', padding: 40,
  },
}
