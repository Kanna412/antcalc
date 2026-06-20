const FREQ_PRESETS = [
  { label: 'AM\n0.9',   value: '0.9' },
  { label: 'FM\n100',   value: '100' },
  { label: 'VHF\n146',  value: '146' },
  { label: 'UHF\n446',  value: '446' },
  { label: 'WiFi\n2400',value: '2400' },
]
const VF_PRESETS = [
  { label: 'Free\n1.00', value: '1.00' },
  { label: 'Coax\n0.66', value: '0.66' },
  { label: 'Wire\n0.95', value: '0.95' },
  { label: 'Foam\n0.80', value: '0.80' },
]

export default function Sidebar({
  antenna, setAntenna,
  freq, setFreq,
  vf, setVf,
  unit, setUnit,
  sweepStart, setSweepStart,
  sweepStop, setSweepStop,
  onCalculate, status, loading,
}) {
  return (
    <aside style={s.sb}>
      {/* Logo */}
      <div style={s.logo}>
        <span style={s.bolt}>⚡</span>
        <div>
          <div style={s.appName}>AntCalc</div>
          <div style={s.appSub}>Antenna Length Calculator</div>
        </div>
      </div>

      <Sep />

      {/* Antenna type */}
      <SLabel>ANTENNA TYPE</SLabel>
      <div style={s.row}>
        <Radio label="Half-Wave Dipole" value="dipole"    current={antenna} set={setAntenna} />
        <Radio label="¼-Wave Monopole"  value="monopole"  current={antenna} set={setAntenna} />
      </div>

      {/* Frequency */}
      <SLabel>FREQUENCY</SLabel>
      <div style={s.row}>
        <input
          style={s.input}
          value={freq}
          onChange={e => setFreq(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && onCalculate()}
        />
        <span style={s.unit}>MHz</span>
      </div>
      <PresetRow presets={FREQ_PRESETS} set={setFreq} onCalculate={onCalculate} />

      {/* Velocity Factor */}
      <SLabel>VELOCITY FACTOR</SLabel>
      <div style={s.row}>
        <input
          style={s.input}
          value={vf}
          onChange={e => setVf(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && onCalculate()}
        />
        <span style={s.unit}>(0.01 – 1.00)</span>
      </div>
      <PresetRow presets={VF_PRESETS} set={setVf} onCalculate={onCalculate} />
      <input
        type="range" min="0.01" max="1.00" step="0.01"
        value={parseFloat(vf) || 0.95}
        onChange={e => setVf(parseFloat(e.target.value).toFixed(2))}
        style={{ width: '100%', marginBottom: 20 }}
      />

      {/* Display unit */}
      <SLabel>DISPLAY UNIT</SLabel>
      <div style={{ ...s.row, marginBottom: 20 }}>
        {['meters','feet','both'].map(u => (
          <Radio key={u} label={u[0].toUpperCase()+u.slice(1)} value={u} current={unit} set={setUnit} />
        ))}
      </div>

      <Sep />

      {/* Sweep range */}
      <SLabel>FREQUENCY SWEEP</SLabel>
      <div style={{ ...s.row, marginBottom: 20 }}>
        <span style={s.unit}>From</span>
        <input style={{ ...s.input, width: 70 }} value={sweepStart}
          onChange={e => setSweepStart(e.target.value)} />
        <span style={s.unit}>to</span>
        <input style={{ ...s.input, width: 70 }} value={sweepStop}
          onChange={e => setSweepStop(e.target.value)} />
        <span style={s.unit}>MHz</span>
      </div>

      {/* Calculate */}
      <button
        style={{ ...s.calcBtn, opacity: loading ? 0.7 : 1 }}
        onClick={onCalculate}
        disabled={loading}
      >
        {loading ? 'Calculating…' : 'Calculate  →'}
      </button>

      <div style={s.status}>{status}</div>
    </aside>
  )
}

function Sep() {
  return <div style={{ height: 1, background: 'var(--border)', margin: '10px 16px 14px' }} />
}

function SLabel({ children }) {
  return (
    <div style={{
      fontSize: 11, fontWeight: 700, color: 'var(--muted)',
      letterSpacing: '0.08em', marginBottom: 8,
    }}>
      {children}
    </div>
  )
}

function Radio({ label, value, current, set }) {
  const active = current === value
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', marginRight: 14 }}>
      <div style={{
        width: 16, height: 16, borderRadius: '50%',
        border: `2px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
        background: active ? 'var(--accent)' : 'transparent',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {active && <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff' }} />}
      </div>
      <span style={{ color: active ? 'var(--text)' : 'var(--muted)', fontSize: 13 }}>{label}</span>
      <input type="radio" value={value} checked={active}
        onChange={() => set(value)} style={{ display: 'none' }} />
    </label>
  )
}

function PresetRow({ presets, set, onCalculate }) {
  return (
    <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
      {presets.map(p => (
        <button
          key={p.value}
          style={s.preset}
          onClick={() => { set(p.value); onCalculate() }}
        >
          {p.label}
        </button>
      ))}
    </div>
  )
}

const s = {
  sb: {
    width: 300, minWidth: 280, background: 'var(--panel)',
    padding: '24px 20px', overflowY: 'auto',
    display: 'flex', flexDirection: 'column', gap: 2,
    borderRight: '1px solid var(--border)',
  },
  logo: { display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 },
  bolt: { fontSize: 30, color: 'var(--accent)' },
  appName: { fontSize: 22, fontWeight: 700, color: 'var(--text)' },
  appSub: { fontSize: 12, color: 'var(--muted)' },
  row: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, flexWrap: 'wrap' },
  input: {
    background: 'var(--entry-bg)', color: 'var(--text)',
    border: '1px solid var(--border)', borderRadius: 6,
    padding: '7px 10px', fontSize: 13, width: 110,
  },
  unit: { color: 'var(--muted)', fontSize: 12 },
  preset: {
    background: 'var(--entry-bg)', color: 'var(--muted)',
    border: '1px solid var(--border)', borderRadius: 6,
    padding: '4px 8px', fontSize: 11, whiteSpace: 'pre', textAlign: 'center',
    fontFamily: 'inherit', cursor: 'pointer',
    transition: 'background 0.15s',
  },
  calcBtn: {
    background: 'var(--accent)', color: '#fff',
    border: 'none', borderRadius: 8,
    padding: '13px 0', fontSize: 14, fontWeight: 700,
    width: '100%', marginBottom: 8,
    fontFamily: 'inherit', transition: 'opacity 0.15s',
  },
  status: {
    fontSize: 11, color: 'var(--muted)', lineHeight: 1.5,
  },
}
