const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export async function apiCalculate({ freqMhz, velocityFactor, antenna }) {
  const res = await fetch(`${BASE}/calculate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      freq_mhz: freqMhz,
      velocity_factor: velocityFactor,
      antenna,
    }),
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.detail || 'API error')
  }
  return res.json()
}

export async function apiSweep({ startMhz, stopMhz, velocityFactor, antenna }) {
  const res = await fetch(`${BASE}/sweep`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      start_mhz: startMhz,
      stop_mhz: stopMhz,
      velocity_factor: velocityFactor,
      antenna,
    }),
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.detail || 'API error')
  }
  return res.json()
}
