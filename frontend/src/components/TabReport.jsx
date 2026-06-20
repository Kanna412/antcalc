import { jsPDF } from 'jspdf'
import 'jspdf-autotable'

const SPEED_OF_LIGHT = 299_792_458

function buildReport(result) {
  if (!result) return ''
  const { type, freq, vf, wavelength_m, total_m, total_ft, arm_m, arm_ft, impedance, gain_dbi } = result
  const wlFt = wavelength_m * 3.28084

  const sep  = '═'.repeat(56)
  const dash = '─'.repeat(56)

  const notes = type === 'Half-Wave Dipole'
    ? [
        '  • Classic half-wave dipole (λ/2).',
        '  • Feed at centre with 73 Ω coax.',
        '  • Each arm = λ/4.',
        '  • A 1:1 balun is recommended.',
        `  • VF = ${vf} accounts for wire insulation`,
        '    and end effects.',
      ]
    : [
        '  • Quarter-wave monopole over ground plane.',
        '  • Requires a good RF ground or radials.',
        '  • Feed impedance ~35 Ω — use a matching network.',
        '  • Gain 5.15 dBi over isotropic (above ground).',
        `  • VF = ${vf} applied to physical length.`,
      ]

  return [
    sep,
    '  ANTENNA DESIGN REPORT',
    sep,
    `  Type            : ${type}`,
    `  Frequency       : ${freq.toFixed(6)} MHz`,
    `  Velocity Factor : ${parseFloat(vf).toFixed(4)}`,
    dash,
    `  Wavelength (λ)  : ${wavelength_m.toFixed(6)} m  /  ${wlFt.toFixed(6)} ft`,
    `  Total Length    : ${total_m.toFixed(6)} m  /  ${total_ft.toFixed(6)} ft`,
    `  Each Arm (λ/4)  : ${arm_m.toFixed(6)} m  /  ${arm_ft.toFixed(6)} ft`,
    dash,
    `  Feed Impedance  : ${impedance}`,
    `  Gain            : ${gain_dbi.toFixed(2)} dBi`,
    dash,
    '  DESIGN NOTES',
    dash,
    ...notes,
    dash,
    '  FORMULA',
    dash,
    `  λ = (c × VF) / f`,
    `    = (${SPEED_OF_LIGHT} × ${vf}) / ${(freq * 1e6).toFixed(0)}`,
    `    = ${wavelength_m.toFixed(6)} m`,
    sep,
  ].join('\n')
}

function exportPDF(result) {
  const doc = new jsPDF()
  doc.setFontSize(18)
  doc.setTextColor(40, 40, 80)
  doc.text('Antenna Design Report', 20, 20)

  doc.autoTable({
    startY: 30,
    head: [['Parameter', 'Value']],
    body: [
      ['Antenna Type',     result.type],
      ['Frequency',        `${result.freq.toFixed(6)} MHz`],
      ['Velocity Factor',  `${parseFloat(result.vf).toFixed(4)}`],
      ['Wavelength',       `${result.wavelength_m.toFixed(6)} m`],
      ['Total Length',     `${result.total_m.toFixed(6)} m  /  ${result.total_ft.toFixed(6)} ft`],
      ['Each Arm',         `${result.arm_m.toFixed(6)} m  /  ${result.arm_ft.toFixed(6)} ft`],
      ['Impedance',        result.impedance],
      ['Gain',             `${result.gain_dbi.toFixed(2)} dBi`],
    ],
    headStyles: { fillColor: [79, 142, 247] },
    alternateRowStyles: { fillColor: [245, 245, 255] },
    styles: { fontSize: 11 },
  })

  const y = doc.lastAutoTable.finalY + 14
  doc.setFontSize(12)
  doc.setTextColor(40, 40, 40)
  doc.text('Formula:', 20, y)
  doc.setFont('Courier', 'normal')
  doc.setFontSize(10)
  doc.text(
    `λ = (c × VF) / f\n  = (${SPEED_OF_LIGHT} × ${result.vf}) / ${(result.freq * 1e6).toFixed(0)}\n  = ${result.wavelength_m.toFixed(6)} m`,
    20, y + 8
  )

  doc.save('antenna_report.pdf')
}

export default function TabReport({ result }) {
  const report = buildReport(result)

  const copyToClipboard = () => {
    if (report) navigator.clipboard.writeText(report)
  }

  return (
    <div style={s.container}>
      <div style={s.header}>
        <span style={s.heading}>Technical Report</span>
        <div style={s.btnGroup}>
          <button style={s.copyBtn} onClick={copyToClipboard} disabled={!result}>
            Copy to Clipboard
          </button>
          <button style={s.pdfBtn} onClick={() => result && exportPDF(result)} disabled={!result}>
            Export PDF
          </button>
        </div>
      </div>

      <div style={s.textBox}>
        <pre style={s.pre}>
          {result ? report : 'No data yet. Run a calculation first.'}
        </pre>
      </div>
    </div>
  )
}

const s = {
  container: {
    display: 'flex', flexDirection: 'column',
    height: '100%', padding: 20, gap: 12,
  },
  header: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  },
  heading: { fontSize: 14, fontWeight: 700, color: 'var(--text)' },
  btnGroup: { display: 'flex', gap: 8 },
  copyBtn: {
    background: 'var(--border)', color: 'var(--text)',
    border: 'none', borderRadius: 6, padding: '6px 14px',
    fontSize: 12, fontFamily: 'inherit', cursor: 'pointer',
  },
  pdfBtn: {
    background: 'var(--accent)', color: '#fff',
    border: 'none', borderRadius: 6, padding: '6px 14px',
    fontSize: 12, fontFamily: 'inherit', cursor: 'pointer',
  },
  textBox: {
    flex: 1, background: 'var(--entry-bg)',
    border: '1px solid var(--border)', borderRadius: 8,
    overflowY: 'auto', padding: '14px 18px',
  },
  pre: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 12, color: 'var(--text)', lineHeight: 1.7,
    whiteSpace: 'pre-wrap', margin: 0,
  },
}
