export default function ProgressRing({ pct, size = 120, stroke = 10, color = 'var(--purple)', label, sub }) {
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const offset = circ - (Math.min(100, Math.max(0, pct)) / 100) * circ
  return (
    <div className="ring-wrap" style={{ width: size, height: size, flexShrink: 0 }}>
      <svg className="prog-ring" width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--border)" strokeWidth={stroke} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.9s cubic-bezier(0.34,1.56,0.64,1)' }} />
      </svg>
      <div className="ring-label">
        <span className="ring-val" style={{ color }}>{label ?? `${pct}%`}</span>
        {sub && <span className="ring-sub">{sub}</span>}
      </div>
    </div>
  )
}
