import { useState } from 'react'
import { Users, UserPlus, Search, GraduationCap } from 'lucide-react'
import { useApp } from '../../context/AppContext'

export default function TeacherStudents({ onNavigate }) {
  const { getAllStudents, getMyCourses, getMyExams, getExamSubmissions, addStudentToCourse } = useApp()
  const students = getAllStudents()
  const courses = getMyCourses()
  const exams = getMyExams()
  const allSubs = exams.flatMap(e => getExamSubmissions(e.id))
  const [search, setSearch] = useState('')
  const [addModal, setAddModal] = useState(null) // { student }
  const [selectedCourse, setSelectedCourse] = useState('')

  const filtered = students.filter(s => {
    const q = search.toLowerCase()
    return !q || s.name.toLowerCase().includes(q) || s.matricule.toLowerCase().includes(q) || s.department?.toLowerCase().includes(q)
  })

  const getStudentStats = (sid) => {
    const subs = allSubs.filter(s => s.studentId === sid)
    if (!subs.length) return null
    const avg = Math.round(subs.reduce((a,s) => a+(s.score/s.total)*100,0)/subs.length)
    return { count: subs.length, avg }
  }

  const getEnrolledCourses = (sid) => courses.filter(c => c.enrolledStudents.includes(sid))

  const handleAddToCourse = () => {
    if (!selectedCourse || !addModal) return
    addStudentToCourse(selectedCourse, addModal.student.id)
    setAddModal(null)
    setSelectedCourse('')
  }

  return (
    <>
      <div className="ph">
        <div className="ph-row">
          <div><h1>Students</h1><p>{students.length} registered</p></div>
          <button className="btn btn-s" onClick={() => onNavigate('courses')}><GraduationCap size={14}/> Manage Courses</button>
        </div>
      </div>

      <div style={{ position:'relative', marginBottom:20, maxWidth:380 }}>
        <Search size={15} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'var(--text3)' }}/>
        <input className="inp" style={{ paddingLeft:36 }} placeholder="Search by name, matricule or department..." value={search} onChange={e => setSearch(e.target.value)}/>
      </div>

      {filtered.length === 0 ? (
        <div className="empty" style={{ marginTop:40 }}>
          <div className="empty-ico"><Users size={32}/></div>
          <h3>No students found</h3>
          <p>Students appear here when they register for C-AtEdu</p>
        </div>
      ) : (
        <div className="card" style={{ padding:0 }}>
          <table className="tbl">
            <thead>
              <tr>
                <th>Student</th>
                <th>Matricule</th>
                <th>Level</th>
                <th>Department</th>
                <th>Enrolled In</th>
                <th>Exams</th>
                <th>Avg Score</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(s => {
                const stats = getStudentStats(s.id)
                const enrolledCourses = getEnrolledCourses(s.id)
                const myCourses = enrolledCourses.filter(c => c.teacherId === courses[0]?.teacherId)
                return (
                  <tr key={s.id}>
                    <td>
                      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                        <div style={{ width:32, height:32, borderRadius:9, background:'var(--purple-l)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, color:'var(--purple)', flexShrink:0 }}>
                          {s.name.split(' ').map(w=>w[0]).join('').slice(0,2)}
                        </div>
                        <div>
                          <div style={{ fontWeight:600, fontSize:13 }}>{s.name}</div>
                          <div style={{ fontSize:11, color:'var(--text3)' }}>{s.email}</div>
                        </div>
                      </div>
                    </td>
                    <td><code style={{ background:'var(--bg)', padding:'2px 8px', borderRadius:5, fontSize:12 }}>{s.matricule}</code></td>
                    <td>{s.level}</td>
                    <td style={{ color:'var(--text2)', fontSize:12 }}>{s.department}</td>
                    <td>
                      {myCourses.length > 0 ? (
                        <div style={{ display:'flex', flexWrap:'wrap', gap:4 }}>
                          {myCourses.map(c => <span key={c.id} className="badge bdg-p" style={{ fontSize:10 }}>{c.code}</span>)}
                        </div>
                      ) : <span style={{ color:'var(--text3)', fontSize:12 }}>—</span>}
                    </td>
                    <td style={{ fontWeight:600 }}>{stats ? stats.count : <span style={{ color:'var(--text3)' }}>—</span>}</td>
                    <td>
                      {stats ? <span style={{ fontWeight:700, color:stats.avg>=60?'var(--green)':'var(--red)' }}>{stats.avg}%</span> : <span style={{ color:'var(--text3)' }}>—</span>}
                    </td>
                    <td>
                      {courses.length > 0 && (
                        <button className="btn btn-s btn-sm" onClick={() => { setAddModal({ student:s }); setSelectedCourse(courses[0]?.id||'') }}>
                          <UserPlus size={12}/> Add to Course
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Add to course modal */}
      {addModal && (
        <div className="overlay" onClick={() => setAddModal(null)}>
          <div className="modal" style={{ maxWidth:380 }} onClick={e => e.stopPropagation()}>
            <div className="mh"><div className="mt">Add to Course</div><button className="xbtn" onClick={() => setAddModal(null)}>×</button></div>
            <div style={{ marginBottom:16, padding:'10px 14px', background:'var(--bg)', borderRadius:10 }}>
              <div style={{ fontWeight:600, fontSize:13 }}>{addModal.student.name}</div>
              <div style={{ fontSize:12, color:'var(--text2)' }}>{addModal.student.matricule} · {addModal.student.level}</div>
            </div>
            <div className="fl">
              <label className="lbl">Select Course</label>
              <select className="sel" value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)}>
                {courses.map(c => <option key={c.id} value={c.id}>{c.title} ({c.code}) — {c.enrolledStudents.includes(addModal.student.id)?'Already enrolled':c.enrolledStudents.length+' students'}</option>)}
              </select>
            </div>
            <div style={{ display:'flex', gap:10 }}>
              <button className="btn btn-s" style={{ flex:1 }} onClick={() => setAddModal(null)}>Cancel</button>
              <button className="btn btn-p" style={{ flex:2 }} onClick={handleAddToCourse}><UserPlus size={14}/> Add Student</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
