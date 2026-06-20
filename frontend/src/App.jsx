import { useState, useCallback } from 'react'
import Sidebar from './components/Sidebar.jsx'
import TabViz from './components/TabViz.jsx'
import TabSweep from './components/TabSweep.jsx'
import TabReport from './components/TabReport.jsx'
import { apiCalculate, apiSweep } from './api.js'

const TABS = ['Visualization', 'Frequency Sweep', 'Report']

export default function App() {
  const [tab, setTab] = useState(0)
  const [status, setStatus] = useState('Ready')
  const [error, setError] = useState(null)
  const [result, setResult] = useState(null)
  const [sweepData, setSweepData] = useState(null)
  const [loading, setLoading] = useState(false)

  // inputs
  const [antenna, setAntenna] = useState('dipole')
  const [freq, setFreq] = useState('146.000')
  const [vf, setVf] = useState('0.95')
  const [unit, setUnit] = useState('meters')
  const [sweepStart, setSweepStart] = useState('100')
  const [sweepStop, setSweepStop] = useState('500')

  const calculate = useCallback(async () => {
    const freqMhz = parseFloat(freq)
    const velocityFactor = parseFloat(vf)
    const startMhz = parseFloat(sweepStart)
    const stopMhz = parseFloat(sweepStop)

    if (isNaN(freqMhz) || isNaN(velocityFactor)) {
      setError('Invalid frequency or velocity factor.')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const [calcRes, sweepRes] = await Promise.all([
        apiCalculate({ freqMhz, velocityFactor, antenna }),
        (!isNaN(startMhz) && !isNaN(stopMhz) && startMhz < stopMhz)
          ? apiSweep({ startMhz, stopMhz, velocityFactor, antenna })
          : Promise.resolve(null),
      ])
      setResult({ ...calcRes, freq: freqMhz, vf: velocityFactor })
      setSweepData(sweepRes)
      setStatus(`✓  ${calcRes.type}  |  ${freqMhz} MHz  |  VF = ${velocityFactor}`)
    } catch (e) {
      setError(e.message)
      setStatus('⚠  Error')
    } finally {
      setLoading(false)
    }
  }, [freq, vf, antenna, sweepStart, sweepStop])

  return (
    <div style={styles.root}>
      <Sidebar
        antenna={antenna} setAntenna={setAntenna}
        freq={freq} setFreq={setFreq}
        vf={vf} setVf={setVf}
        unit={unit} setUnit={setUnit}
        sweepStart={sweepStart} setSweepStart={setSweepStart}
        sweepStop={sweepStop} setSweepStop={setSweepStop}
        onCalculate={calculate}
        status={status}
        loading={loading}
      />

      <div style={styles.main}>
        {/* Metric cards */}
        {result && <MetricCards result={result} unit={unit} />}

        {/* Error banner */}
        {error && (
          <div style={styles.errorBanner}>⚠ {error}</div>
        )}

        {/* Tab bar */}
        <div style={styles.tabBar}>
          {TABS.map((t, i) => (
            <button
              key={t}
              onClick={() => setTab(i)}
              style={{ ...styles.tabBtn, ...(tab === i ? styles.tabActive : {}) }}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div style={styles.tabContent}>
          {tab === 0 && <TabViz result={result} antenna={antenna} />}
          {tab === 1 && <TabSweep sweepData={sweepData} result={result} sweepStart={sweepStart} sweepStop={sweepStop} />}
          {tab === 2 && <TabReport result={result} />}
        </div>
      </div>
    </div>
  )
}

function MetricCards({ result, unit }) {
  const fmt = (m, ft) => {
    if (unit === 'meters') return `${m.toFixed(4)} m`
    if (unit === 'feet')   return `${ft.toFixed(4)} ft`
    return `${m.toFixed(4)} m\n${ft.toFixed(4)} ft`
  }

  const cards = [
    { label: 'TOTAL LENGTH', value: fmt(result.total_m, result.total_ft),        color: 'var(--accent)' },
    { label: 'EACH ARM',     value: fmt(result.arm_m, result.arm_ft),             color: 'var(--green)' },
    { label: 'WAVELENGTH',   value: fmt(result.wavelength_m, result.wavelength_m * 3.28084), color: 'var(--accent2)' },
    { label: 'IMPEDANCE',    value: result.impedance,                              color: 'var(--muted)' },
    { label: 'GAIN',         value: `${result.gain_dbi.toFixed(2)} dBi`,          color: 'var(--muted)' },
  ]

  return (
    <div style={styles.cards}>
      {cards.map(c => (
        <div key={c.label} style={styles.card}>
          <span style={styles.cardLabel}>{c.label}</span>
          <span style={{ ...styles.cardValue, color: c.color, whiteSpace: 'pre' }}>{c.value}</span>
        </div>
      ))}
    </div>
  )
}

const styles = {
  root: {
    display: 'flex', height: '100vh', overflow: 'hidden',
  },
  main: {
    flex: 1, display: 'flex', flexDirection: 'column',
    overflow: 'hidden', padding: '20px 20px 20px 0',
  },
  cards: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, 1fr)',
    gap: 10, marginBottom: 14,
  },
  card: {
    background: 'var(--card)', border: '1px solid var(--border)',
    borderRadius: 10, padding: '12px 14px',
    display: 'flex', flexDirection: 'column', gap: 6,
  },
  cardLabel: {
    fontSize: 10, fontWeight: 700, color: 'var(--muted)',
    letterSpacing: '0.08em',
  },
  cardValue: {
    fontFamily: "'JetBrains Mono', monospace", fontSize: 15, fontWeight: 600,
  },
  errorBanner: {
    background: '#2a1420', border: '1px solid var(--red)',
    color: 'var(--red)', borderRadius: 8, padding: '10px 16px',
    marginBottom: 12, fontSize: 13,
  },
  tabBar: {
    display: 'flex', gap: 2, marginBottom: 10,
    borderBottom: '1px solid var(--border)', paddingBottom: 0,
  },
  tabBtn: {
    background: 'none', color: 'var(--muted)',
    padding: '10px 20px', fontSize: 13, fontFamily: 'inherit',
    borderRadius: '8px 8px 0 0', transition: 'all 0.15s',
    border: '1px solid transparent',
  },
  tabActive: {
    background: 'var(--card)', color: 'var(--text)',
    borderColor: 'var(--border)', borderBottomColor: 'var(--card)',
  },
  tabContent: {
    flex: 1, background: 'var(--card)', border: '1px solid var(--border)',
    borderRadius: '0 8px 8px 8px', overflow: 'hidden',
  },
}
