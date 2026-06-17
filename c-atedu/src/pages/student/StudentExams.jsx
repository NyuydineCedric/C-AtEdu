import { Clock, CheckCircle, BookOpen, GraduationCap } from 'lucide-react'
import { useApp } from '../../context/AppContext'

export default function StudentExams({ onStart }) {
  const { getMyAssignedExams, getMySubmission, db, user } = useApp()
  const exams = getMyAssignedExams()
  const enrolled = user.enrolledCourses||[]
  const enrolledCourses = db.courses.filter(c => enrolled.includes(c.id))

  if (enrolledCourses.length===0) return (
    <>
      <div className="ph"><h1>My Exams</h1></div>
      <div className="empty" style={{ marginTop:40 }}>
        <div className="empty-ico"><GraduationCap size={32}/></div>
        <h3>No courses enrolled</h3>
        <p>Enroll in a course first to see your exams.</p>
      </div>
    </>
  )

  if (exams.length===0) return (
    <>
      <div className="ph"><h1>My Exams</h1><p>From your enrolled courses</p></div>
      <div className="empty" style={{ marginTop:40 }}>
        <div className="empty-ico"><Clock size={32}/></div>
        <h3>No exams yet</h3>
        <p>Your teachers haven't published any exams for your courses yet. Check back later.</p>
      </div>
    </>
  )

  // Group by course
  const byCourse = enrolledCourses.map(c => ({
    course: c,
    exams: exams.filter(e => e.courseId===c.id),
    teacher: db.teachers.find(t => t.id===c.teacherId),
  })).filter(g => g.exams.length>0)

  return (
    <>
      <div className="ph"><h1>My Exams</h1><p>{exams.length} exam{exams.length!==1?'s':''} across {byCourse.length} course{byCourse.length!==1?'s':''}</p></div>
      {byCourse.map(({ course, exams: courseExams, teacher }) => (
        <div key={course.id} style={{ marginBottom:28 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14 }}>
            <div style={{ width:32, height:32, borderRadius:9, background:'var(--purple-l)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <GraduationCap size={16} color="var(--purple)"/>
            </div>
            <div>
              <div style={{ fontFamily:'var(--fd)', fontWeight:700, fontSize:15 }}>{course.title} <span className="badge bdg-b" style={{ fontSize:11 }}>{course.code}</span></div>
              <div style={{ fontSize:12, color:'var(--text2)' }}>{teacher?.name}</div>
            </div>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {courseExams.map(ex => {
              const sub = getMySubmission(ex.id)
              const done = !!sub
              const pct = done ? Math.round((sub.score/sub.total)*100) : null
              return (
                <div key={ex.id} className="exam-card">
                  <div style={{ display:'flex', alignItems:'flex-start', gap:14 }}>
                    <div style={{ width:46, height:46, borderRadius:12, background:done?'var(--green-l)':'var(--purple-l)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                      {done ? <CheckCircle size={22} color="#047857"/> : <Clock size={22} color="var(--purple)"/>}
                    </div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontFamily:'var(--fd)', fontWeight:700, fontSize:15 }}>{ex.title}</div>
                      <div style={{ fontSize:12, color:'var(--text2)', marginTop:3 }}>{ex.questions.length} questions · {ex.duration} minutes</div>
                      {ex.description && <div style={{ fontSize:12, color:'var(--text3)', marginTop:2 }}>{ex.description}</div>}
                      {done && (
                        <div style={{ marginTop:8, display:'flex', gap:8, alignItems:'center' }}>
                          <span className="badge bdg-g">Completed</span>
                          <span style={{ fontSize:13, fontWeight:700, color:'var(--green)' }}>{pct}%</span>
                          <span style={{ fontSize:12, color:'var(--text2)' }}>{sub.score}/{sub.total} correct</span>
                        </div>
                      )}
                    </div>
                    <div style={{ flexShrink:0 }}>
                      {done ? (
                        <span className="badge bdg-g" style={{ fontSize:12, padding:'6px 14px' }}>Submitted</span>
                      ) : (
                        <button className="btn btn-teal" style={{ padding:'8px 18px' }} onClick={() => onStart(ex.id)}>
                          Start Exam
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </>
  )
}
