import { BookOpen, CheckSquare, TrendingUp, Clock, GraduationCap, ChevronRight } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import ProgressRing from '../../components/ProgressRing'

function getGrade(p){return p>=90?'A':p>=80?'B':p>=70?'C':p>=60?'D':'F'}
function getColor(p){return p>=80?'var(--green)':p>=60?'var(--purple)':'var(--red)'}

export default function StudentDashboard({ onNavigate, onStart }) {
  const { user, getMyAssignedExams, getMySubmission, db } = useApp()
  const exams = getMyAssignedExams()
  const pending = exams.filter(e => !getMySubmission(e.id))
  const done = exams.filter(e => getMySubmission(e.id))
  const subs = done.map(e => getMySubmission(e.id))
  const avg = subs.length ? Math.round(subs.reduce((a,s) => a+(s.score/s.total)*100,0)/subs.length) : 0
  const enrolled = user.enrolledCourses||[]
  const enrolledCourses = db.courses.filter(c => enrolled.includes(c.id))

  return (
    <>
      <div className="ph">
        <h1>Hello, {user.name.split(' ')[0]}</h1>
        <p>{user.matricule} · {user.department} · {user.level}</p>
      </div>

      <div className="stats" style={{ gridTemplateColumns:'repeat(4,1fr)' }}>
        {[
          { lbl:'Courses', val:enrolledCourses.length, sub:'Enrolled', bg:'var(--blue-l)', c:'var(--blue)', Icon:GraduationCap },
          { lbl:'Pending Exams', val:pending.length, sub:'To complete', bg:'var(--purple-l)', c:'var(--purple)', Icon:Clock },
          { lbl:'Completed', val:done.length, sub:'Submitted', bg:'var(--green-l)', c:'#047857', Icon:CheckSquare },
          { lbl:'Average Score', val:avg+'%', sub:'All exams', bg:'var(--amber-l)', c:'#92630a', Icon:TrendingUp },
        ].map(({ lbl,val,sub,bg,c,Icon }) => (
          <div key={lbl} className="stat">
            <div className="stat-ico" style={{ background:bg }}><Icon size={18} color={c}/></div>
            <div className="stat-lbl">{lbl}</div>
            <div className="stat-val" style={{ color:c }}>{val}</div>
            <div className="stat-sub">{sub}</div>
          </div>
        ))}
      </div>

      <div className="g2" style={{ marginBottom:20 }}>
        <div className="wcard student-wcard">
          <h2>Welcome back,<br/>{user.name.split(' ')[0]}!</h2>
          <div className="tag green">Auto-Marked · Solutions · Instant Results</div>
        </div>

        <div className="card">
          <div className="ch">
            <div><div className="ct">Pending Exams</div><div className="cs">{pending.length} to complete</div></div>
            <button className="btn btn-teal btn-sm" onClick={() => onNavigate('exams')}>View All</button>
          </div>
          {pending.length===0 ? (
            <div style={{ textAlign:'center', padding:'20px 0', color:'var(--text3)', fontSize:13 }}>All caught up! No pending exams.</div>
          ) : pending.slice(0,3).map(ex => {
            const course = db.courses.find(c => c.id===ex.courseId)
            return (
              <div key={ex.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 0', borderBottom:'1px solid var(--bg)' }}>
                <div style={{ width:36, height:36, borderRadius:10, background:'var(--green-l)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <Clock size={16} color="#047857"/>
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontWeight:600, fontSize:13, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{ex.title}</div>
                  <div style={{ fontSize:11, color:'var(--text2)' }}>{course?.title||ex.subject} · {ex.questions.length} Q · {ex.duration} min</div>
                </div>
                <button className="btn btn-teal btn-sm" onClick={() => onStart(ex.id)}>Start</button>
              </div>
            )
          })}
        </div>
      </div>

      <div className="g2">
        {/* My courses */}
        <div className="card">
          <div className="ch">
            <div><div className="ct">My Courses</div><div className="cs">{enrolledCourses.length} enrolled</div></div>
            <button className="btn btn-s btn-sm" onClick={() => onNavigate('courses')}>Browse</button>
          </div>
          {enrolledCourses.length===0 ? (
            <div style={{ textAlign:'center', padding:'20px 0', color:'var(--text3)', fontSize:13 }}>
              No courses yet. <button className="btn btn-teal btn-sm" style={{ marginLeft:8 }} onClick={() => onNavigate('courses')}>Browse courses</button>
            </div>
          ) : enrolledCourses.map(c => {
            const teacher = db.teachers.find(t => t.id===c.teacherId)
            const courseExams = exams.filter(e => e.courseId===c.id)
            const coursePending = courseExams.filter(e => !getMySubmission(e.id))
            return (
              <div key={c.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 0', borderBottom:'1px solid var(--bg)' }}>
                <div style={{ width:36, height:36, borderRadius:10, background:'var(--purple-l)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <GraduationCap size={16} color="var(--purple)"/>
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:600, fontSize:13 }}>{c.title} <span className="badge bdg-b" style={{ fontSize:10 }}>{c.code}</span></div>
                  <div style={{ fontSize:11, color:'var(--text2)' }}>{teacher?.name} · {courseExams.length} exam{courseExams.length!==1?'s':''}</div>
                </div>
                {coursePending.length>0 && <span className="badge bdg-r">{coursePending.length} pending</span>}
              </div>
            )
          })}
        </div>

        {/* Recent results */}
        <div className="card">
          <div className="ch">
            <div><div className="ct">Recent Results</div></div>
            <button className="btn btn-s btn-sm" onClick={() => onNavigate('results')}>View All</button>
          </div>
          {done.length===0 ? (
            <div style={{ textAlign:'center', padding:'20px 0', color:'var(--text3)', fontSize:13 }}>No results yet. Complete an exam!</div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {done.slice(0,4).map(ex => {
                const sub = getMySubmission(ex.id)
                const pct = Math.round((sub.score/sub.total)*100)
                const g = getGrade(pct)
                const col = getColor(pct)
                return (
                  <div key={ex.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'8px 0', borderBottom:'1px solid var(--bg)' }}>
                    <ProgressRing pct={pct} size={44} stroke={4} color={col}/>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontWeight:600, fontSize:13, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{ex.title}</div>
                      <div style={{ fontSize:11, color:'var(--text2)' }}>{sub.score}/{sub.total} correct</div>
                    </div>
                    <span className={`gb g${g}`} style={{ width:28, height:28, fontSize:13, borderRadius:8 }}>{g}</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
