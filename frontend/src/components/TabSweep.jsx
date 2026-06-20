import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ReferenceLine, ResponsiveContainer, Label,
} from 'recharts'

export default function TabSweep({ sweepData, result }) {
  if (!sweepData) {
    return (
      <div style={s.empty}>
        <span style={{ fontSize: 40 }}>📈</span>
        <p>Run a calculation with a valid sweep range to see the chart.</p>
      </div>
    )
  }

  const data = sweepData.freqs.map((f, i) => ({
    freq: parseFloat(f.toFixed(2)),
    length: parseFloat(sweepData.lengths[i].toFixed(5)),
  }))

  const curFreq = result?.freq

  return (
    <div style={s.container}>
      <div style={s.heading}>
        Length vs Frequency
        {result && (
          <span style={s.sub}>
            &nbsp;|&nbsp; VF = {result.vf} &nbsp;|&nbsp;
            {result.type}
          </span>
        )}
      </div>
      <ResponsiveContainer width="100%" height={340}>
        <LineChart data={data} margin={{ top: 10, right: 30, left: 10, bottom: 30 }}>
          <CartesianGrid stroke="#2e3350" strokeDasharray="4 3" opacity={0.6} />
          <XAxis
            dataKey="freq"
            stroke="#8891aa"
            tick={{ fill: '#8891aa', fontSize: 11, fontFamily: 'JetBrains Mono, monospace' }}
          >
            <Label value="Frequency (MHz)" offset={-10} position="insideBottom" fill="#8891aa" fontSize={12} />
          </XAxis>
          <YAxis
            stroke="#8891aa"
            tick={{ fill: '#8891aa', fontSize: 11, fontFamily: 'JetBrains Mono, monospace' }}
          >
            <Label value="Length (m)" angle={-90} position="insideLeft" fill="#8891aa" fontSize={12} offset={10} />
          </YAxis>
          <Tooltip
            contentStyle={{
              background: '#1a1d27', border: '1px solid #2e3350',
              borderRadius: 8, fontFamily: 'JetBrains Mono, monospace', fontSize: 12,
            }}
            labelFormatter={v => `${v} MHz`}
            formatter={v => [`${v} m`, 'Length']}
          />
          {curFreq && (
            <ReferenceLine
              x={parseFloat(curFreq.toFixed(2))}
              stroke="#f7914f"
              strokeDasharray="5 3"
              strokeWidth={1.5}
              label={{
                value: `${curFreq} MHz`,
                position: 'top',
                fill: '#f7914f',
                fontSize: 11,
                fontFamily: 'JetBrains Mono, monospace',
              }}
            />
          )}
          <Line
            type="monotone"
            dataKey="length"
            stroke="#4f8ef7"
            strokeWidth={2.2}
            dot={false}
            activeDot={{ r: 5, fill: '#4f8ef7' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

const s = {
  container: { padding: '24px 16px 16px', height: '100%' },
  heading: {
    fontSize: 14, fontWeight: 600, color: 'var(--text)',
    marginBottom: 20,
  },
  sub: { color: 'var(--muted)', fontWeight: 400, fontSize: 13 },
  empty: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', height: '100%', gap: 14,
    color: 'var(--muted)', fontSize: 14, textAlign: 'center', padding: 40,
  },
}
