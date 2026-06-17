import { useState } from 'react'
import { GraduationCap, Search, UserPlus, UserMinus, BookOpen } from 'lucide-react'
import { useApp } from '../../context/AppContext'

export default function StudentCourses() {
  const { getAllCourses, enrollInCourse, unenrollFromCourse, user, db } = useApp()
  const allCourses = getAllCourses()
  const enrolled = user.enrolledCourses || []
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState('enrolled')
  const [err, setErr] = useState('')

  const enrolledCourses = allCourses.filter(c => enrolled.includes(c.id))
  const availableCourses = allCourses.filter(c => !enrolled.includes(c.id))

  const filtered = (tab === 'enrolled' ? enrolledCourses : availableCourses).filter(c => {
    const q = search.toLowerCase()
    return !q || c.title.toLowerCase().includes(q) || c.subject.toLowerCase().includes(q) || c.code.toLowerCase().includes(q)
  })

  const getTeacher = (teacherId) => db.teachers.find(t => t.id === teacherId)

  const handleEnroll = (courseId) => {
    setErr('')
    const error = enrollInCourse(courseId)
    if (error) setErr(error)
  }

  return (
    <>
      <div className="ph"><h1>My Courses</h1><p>{enrolledCourses.length} enrolled · {availableCourses.length} available to join</p></div>

      <div className="tabs" style={{ maxWidth:360 }}>
        <button className={`tab ${tab==='enrolled'?'on':''}`} onClick={() => setTab('enrolled')}>Enrolled ({enrolledCourses.length})</button>
        <button className={`tab ${tab==='available'?'on':''}`} onClick={() => setTab('available')}>Browse ({availableCourses.length})</button>
      </div>

      <div style={{ position:'relative', marginBottom:16, maxWidth:360 }}>
        <Search size={15} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'var(--text3)' }}/>
        <input className="inp" style={{ paddingLeft:36 }} placeholder="Search courses..." value={search} onChange={e => setSearch(e.target.value)}/>
      </div>

      {err && <div className="login-err" style={{ marginBottom:14 }}>{err}</div>}

      {filtered.length === 0 ? (
        <div className="empty" style={{ marginTop:20 }}>
          <div className="empty-ico"><GraduationCap size={32}/></div>
          <h3>{tab==='enrolled' ? 'Not enrolled in any courses' : 'No available courses'}</h3>
          <p>{tab==='enrolled' ? 'Browse available courses and enroll to receive exams' : 'All available courses are shown here'}</p>
          {tab==='enrolled' && <button className="btn btn-teal" style={{ marginTop:8 }} onClick={() => setTab('available')}>Browse Courses</button>}
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          {filtered.map(c => {
            const teacher = getTeacher(c.teacherId)
            const isEnrolled = enrolled.includes(c.id)
            const examCount = db.exams.filter(e => e.courseId===c.id && e.status==='published').length
            return (
              <div key={c.id} className="exam-card">
                <div style={{ display:'flex', alignItems:'flex-start', gap:14 }}>
                  <div style={{ width:48, height:48, borderRadius:13, background:isEnrolled?'var(--green-l)':'var(--purple-l)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <GraduationCap size={22} color={isEnrolled?'#047857':'var(--purple)'}/>
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
                      <span style={{ fontFamily:'var(--fd)', fontWeight:700, fontSize:15 }}>{c.title}</span>
                      <span className="badge bdg-b">{c.code}</span>
                      <span className="badge bdg-p">{c.level}</span>
                    </div>
                    <div style={{ fontSize:12, color:'var(--text2)', marginTop:3 }}>{c.subject} · {c.description}</div>
                    <div style={{ fontSize:12, color:'var(--text3)', marginTop:3 }}>
                      Taught by <strong style={{ color:'var(--text)' }}>{teacher?.name||'Unknown'}</strong>
                    </div>
                    <div style={{ display:'flex', gap:8, marginTop:10 }}>
                      <span className="badge" style={{ background:'var(--bg)', color:'var(--text2)' }}>{c.enrolledStudents.length} students enrolled</span>
                      {isEnrolled && <span className="badge bdg-g"><BookOpen size={10} style={{ marginRight:4 }}/>{examCount} exam{examCount!==1?'s':''} available</span>}
                    </div>
                  </div>
                  <div style={{ flexShrink:0 }}>
                    {isEnrolled ? (
                      <button className="btn btn-r btn-sm" onClick={() => unenrollFromCourse(c.id)}>
                        <UserMinus size={13}/> Unenroll
                      </button>
                    ) : (
                      <button className="btn btn-teal" style={{ padding:'8px 16px' }} onClick={() => handleEnroll(c.id)}>
                        <UserPlus size={14}/> Enroll
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </>
  )
}
