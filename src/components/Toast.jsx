import { CheckCircle, AlertCircle, Info } from 'lucide-react'

export default function Toast({ toasts }) {
  if (!toasts.length) return null
  return (
    <div className="toast-wrap">
      {toasts.map(t => (
        <div key={t.id} className={`toast ${t.type}`}>
          {t.type === 'ok' && <CheckCircle size={16} color="var(--green)" />}
          {t.type === 'err' && <AlertCircle size={16} color="var(--red)" />}
          {t.type === 'info' && <Info size={16} color="var(--purple)" />}
          <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>{t.msg}</span>
        </div>
      ))}
    </div>
  )
}
