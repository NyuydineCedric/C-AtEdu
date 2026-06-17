import { useState } from 'react'
import { Plus, Trash2, Users, UserPlus, UserMinus, GraduationCap, BookOpen } from 'lucide-react'
import { useApp } from '../../context/AppContext'

const SUBJECTS = ['Biology','Chemistry','Mathematics','Physics','English','History','Geography','Computer Science','Economics','Other']
const LEVELS = ['100L','200L','300L','400L','500L','Postgraduate']

export default function TeacherCourses({ onNavigate }) {
  const { getMyCourses, createCourse, deleteCourse, getAllStudents, addStudentToCourse, removeStudentFromCourse, db } = useApp()
  const courses = getMyCourses()
  const allStudents = getAllStudents()
  const [showCreate, setShowCreate] = useState(false)
  const [manageId, setManageId] = useState(null)
  const [confirmDel, setConfirmDel] = useState(null)
  const [title, setTitle] = useState('')
  const [subject, setSubject] = useState('Biology')
  const [level, setLevel] = useState('100L')
  const [desc, setDesc] = useState('')
  const [formErr, setFormErr] = useState('')

  const handleCreate = () => {
    if (!title.trim()) { setFormErr('Course title is required'); return }
    createCourse({ title, subject, level, description: desc })
    setTitle(''); setSubject('Biology'); setLevel('100L'); setDesc(''); setFormErr('')
    setShowCreate(false)
  }

  const manageCourse = courses.find(c => c.id === manageId)
  const enrolled = manageCourse ? manageCourse.enrolledStudents.map(id => allStudents.find(s => s.id === id)).filter(Boolean) : []
  const notEnrolled = manageCourse ? allStudents.filter(s => !manageCourse.enrolledStudents.includes(s.id)) : []

  return (
    <>
      <div className="ph">
        <div className="ph-row">
          <div><h1>My Courses</h1><p>{courses.length} course{courses.length !== 1 ? 's' : ''}</p></div>
          <button className="btn btn-p" onClick={() => setShowCreate(true)}><Plus size={15}/> New Course</button>
        </div>
      </div>

      {courses.length === 0 && !showCreate ? (
        <div className="empty" style={{ marginTop: 40 }}>
          <div className="empty-ico" style={{ width: 72, height: 72, borderRadius: 18 }}><GraduationCap size={32}/></div>
          <h3>No courses yet</h3>
          <p>Create your first course. Students will enroll and receive your exams automatically.</p>
          <button className="btn btn-p" style={{ marginTop: 8 }} onClick={() => setShowCreate(true)}><Plus size={14}/> Create Course</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {courses.map(c => {
            const enrolledStudents = c.enrolledStudents.map(id => allStudents.find(s => s.id === id)).filter(Boolean)
            const examCount = db.exams.filter(e => e.courseId === c.id).length
            return (
              <div key={c.id} className="exam-card">
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 13, background: 'var(--purple-l)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <GraduationCap size={22} color="var(--purple)"/>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <span style={{ fontFamily: 'var(--fd)', fontWeight: 700, fontSize: 15 }}>{c.title}</span>
                      <span className="badge bdg-b">{c.code}</span>
                      <span className="badge bdg-p">{c.level}</span>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 3 }}>{c.subject} · {c.description}</div>
                    <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
                      <span className="badge bdg-g"><Users size={11} style={{ marginRight: 4 }}/>{enrolledStudents.length} enrolled</span>
                      <span className="badge bdg-p"><BookOpen size={11} style={{ marginRight: 4 }}/>{examCount} exam{examCount !== 1 ? 's' : ''}</span>
                    </div>
                    {enrolledStudents.length > 0 && (
                      <div style={{ display: 'flex', gap: 4, marginTop: 10, flexWrap: 'wrap' }}>
                        {enrolledStudents.slice(0, 8).map(s => (
                          <div key={s.id} title={s.name} style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--purple)', color: 'white', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid white' }}>
                            {s.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
                          </div>
                        ))}
                        {enrolledStudents.length > 8 && (
                          <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--border)', color: 'var(--text2)', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+{enrolledStudents.length - 8}</div>
                        )}
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: 7, flexShrink: 0 }}>
                    <button className="btn btn-s btn-sm" onClick={() => setManageId(c.id)}><UserPlus size={13}/> Students</button>
                    <button className="btn btn-s btn-sm" onClick={() => onNavigate('exams')}><BookOpen size={13}/> Exams</button>
                    <button className="btn btn-r btn-sm" onClick={() => setConfirmDel(c)}><Trash2 size={13}/></button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Create modal */}
      {showCreate && (
        <div className="overlay" onClick={() => setShowCreate(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="mh"><div className="mt">Create New Course</div><button className="xbtn" onClick={() => setShowCreate(false)}>×</button></div>
            {formErr && <div className="login-err" style={{ marginBottom: 14 }}>{formErr}</div>}
            <div className="fl"><label className="lbl">Course Title *</label><input className="inp" placeholder="e.g. Cell Biology" value={title} onChange={e => setTitle(e.target.value)} autoFocus/></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="fl"><label className="lbl">Subject</label><select className="sel" value={subject} onChange={e => setSubject(e.target.value)}>{SUBJECTS.map(s => <option key={s}>{s}</option>)}</select></div>
              <div className="fl"><label className="lbl">Level</label><select className="sel" value={level} onChange={e => setLevel(e.target.value)}>{LEVELS.map(l => <option key={l}>{l}</option>)}</select></div>
            </div>
            <div className="fl"><label className="lbl">Description</label><textarea className="inp" rows={2} placeholder="Brief description..." value={desc} onChange={e => setDesc(e.target.value)} style={{ resize: 'vertical' }}/></div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-s" style={{ flex: 1 }} onClick={() => setShowCreate(false)}>Cancel</button>
              <button className="btn btn-p" style={{ flex: 2 }} onClick={handleCreate}><Plus size={14}/> Create Course</button>
            </div>
          </div>
        </div>
      )}

      {/* Manage students modal */}
      {manageId && manageCourse && (
        <div className="overlay" onClick={() => setManageId(null)}>
          <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
            <div className="mh">
              <div><div className="mt">Students — {manageCourse.title}</div><div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 2 }}>{enrolled.length} enrolled</div></div>
              <button className="xbtn" onClick={() => setManageId(null)}>×</button>
            </div>
            <div className="g2" style={{ gap: 16 }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#047857', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: 10 }}>Enrolled ({enrolled.length})</div>
                {enrolled.length === 0 ? (
                  <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text3)', fontSize: 13, background: 'var(--bg)', borderRadius: 10 }}>No students enrolled yet</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 300, overflowY: 'auto' }}>
                    {enrolled.map(s => (
                      <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', background: 'var(--green-l)', borderRadius: 10, border: '1px solid var(--green)' }}>
                        <div style={{ width: 30, height: 30, borderRadius: 8, background: 'var(--green)', color: 'white', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          {s.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, fontSize: 13 }}>{s.name}</div>
                          <div style={{ fontSize: 11, color: 'var(--text2)' }}>{s.matricule} · {s.level}</div>
                        </div>
                        <button className="btn btn-r btn-sm" style={{ padding: '4px 8px' }} onClick={() => removeStudentFromCourse(manageId, s.id)}><UserMinus size={13}/></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--purple)', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: 10 }}>Add Students ({notEnrolled.length})</div>
                {notEnrolled.length === 0 ? (
                  <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text3)', fontSize: 13, background: 'var(--bg)', borderRadius: 10 }}>All registered students enrolled</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 300, overflowY: 'auto' }}>
                    {notEnrolled.map(s => (
                      <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', background: 'var(--bg)', borderRadius: 10, border: '1px solid var(--border)' }}>
                        <div style={{ width: 30, height: 30, borderRadius: 8, background: 'var(--purple-l)', color: 'var(--purple)', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          {s.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, fontSize: 13 }}>{s.name}</div>
                          <div style={{ fontSize: 11, color: 'var(--text2)' }}>{s.matricule} · {s.level} · {s.department}</div>
                        </div>
                        <button className="btn btn-p btn-sm" style={{ padding: '4px 8px' }} onClick={() => addStudentToCourse(manageId, s.id)}><UserPlus size={13}/></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div style={{ marginTop: 18 }}>
              <button className="btn btn-p" style={{ width: '100%', justifyContent: 'center' }} onClick={() => setManageId(null)}>Done</button>
            </div>
          </div>
        </div>
      )}

      {confirmDel && (
        <div className="overlay" onClick={() => setConfirmDel(null)}>
          <div className="modal" style={{ maxWidth: 360 }} onClick={e => e.stopPropagation()}>
            <div className="mh"><div className="mt">Delete Course?</div><button className="xbtn" onClick={() => setConfirmDel(null)}>×</button></div>
            <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 18, lineHeight: 1.6 }}>Delete <strong>"{confirmDel.title}"</strong>? All exams for this course will also be deleted.</p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-s" style={{ flex: 1 }} onClick={() => setConfirmDel(null)}>Cancel</button>
              <button className="btn btn-r" style={{ flex: 1 }} onClick={() => { deleteCourse(confirmDel.id); setConfirmDel(null) }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
