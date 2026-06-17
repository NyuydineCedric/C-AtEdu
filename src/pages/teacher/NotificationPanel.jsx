import { useApp } from '../../context/AppContext'
import { UserPlus, CheckCheck, X } from 'lucide-react'

export default function NotificationPanel({ onClose }) {
  const { getMyNotifications, markNotificationRead, markAllNotificationsRead, db } = useApp()
  const notifs = getMyNotifications().slice().sort((a, b) => new Date(b.date) - new Date(a.date))
  const unread = notifs.filter(n => !n.read).length

  const getStudent = (id) => db.students.find(s => s.id === id)

  return (
    <>
      <div style={{ position: 'fixed', inset: 0, zIndex: 49 }} onClick={onClose}/>
      <div style={{ position: 'absolute', top: 46, right: 0, width: 340, background: 'white', borderRadius: 16, border: '1px solid var(--border)', boxShadow: '0 16px 48px rgba(27,26,46,0.16)', zIndex: 50, overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
          <div>
            <div style={{ fontFamily: 'var(--fd)', fontWeight: 700, fontSize: 14 }}>Notifications</div>
            {unread > 0 && <div style={{ fontSize: 11, color: 'var(--purple)', fontWeight: 600 }}>{unread} unread</div>}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {unread > 0 && (
              <button className="btn btn-s btn-sm" onClick={markAllNotificationsRead} style={{ padding: '4px 10px', fontSize: 11 }}>
                <CheckCheck size={12}/> Mark all read
              </button>
            )}
            <button className="icon-btn" style={{ width: 28, height: 28, borderRadius: 7 }} onClick={onClose}><X size={14}/></button>
          </div>
        </div>
        <div style={{ maxHeight: 360, overflowY: 'auto' }}>
          {notifs.length === 0 ? (
            <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--text3)', fontSize: 13 }}>No notifications yet</div>
          ) : notifs.map(n => {
            const student = getStudent(n.studentId)
            return (
              <div key={n.id}
                onClick={() => markNotificationRead(n.id)}
                style={{ display: 'flex', gap: 12, padding: '12px 16px', borderBottom: '1px solid var(--bg)', background: n.read ? 'white' : 'var(--purple-l)', cursor: 'pointer', transition: 'background 0.15s' }}
              >
                <div style={{ width: 34, height: 34, borderRadius: 10, background: n.read ? 'var(--bg)' : 'var(--purple)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <UserPlus size={16} color={n.read ? 'var(--text3)' : 'white'}/>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: n.read ? 400 : 600, color: 'var(--text)', lineHeight: 1.4 }}>{n.message}</div>
                  {student && (
                    <div style={{ fontSize: 11, color: 'var(--text2)', marginTop: 2 }}>{student.matricule} · {student.level} · {student.department}</div>
                  )}
                  <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 3 }}>
                    {new Date(n.date).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                {!n.read && <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--purple)', flexShrink: 0, marginTop: 6 }}/>}
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}
