import { useState } from 'react'
import { CheckCircle, XCircle, ChevronDown, ChevronUp, ClipboardCheck } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import ProgressRing from '../../components/ProgressRing'

const LETTERS = ['A','B','C','D']
function getGrade(p){return p>=90?'A':p>=80?'B':p>=70?'C':p>=60?'D':'F'}
function getColor(p){return p>=80?'var(--green)':p>=60?'var(--purple)':'var(--red)'}

function QuestionReview({ q, answer, idx }) {
  const [open, setOpen] = useState(false)
  const correct = answer===q.correct
  return (
    <div style={{ border:`1.5px solid ${correct?'var(--green)':'var(--red)'}`, borderRadius:12, marginBottom:10, overflow:'hidden' }}>
      <button style={{ width:'100%', display:'flex', alignItems:'center', gap:12, padding:'13px 16px', background:correct?'var(--green-l)':'var(--red-l)', cursor:'pointer', border:'none', font:'inherit', textAlign:'left' }}
        onClick={() => setOpen(o=>!o)}>
        <div style={{ width:26, height:26, borderRadius:8, flexShrink:0, background:correct?'var(--green)':'var(--red)', display:'flex', alignItems:'center', justifyContent:'center' }}>
          {correct ? <CheckCircle size={14} color="white"/> : <XCircle size={14} color="white"/>}
        </div>
        <span style={{ flex:1, fontSize:13, fontWeight:600, color:'var(--text)' }}>Q{idx+1}. {q.text}</span>
        <span style={{ fontSize:11, fontWeight:700, color:correct?'#047857':'var(--red)', whiteSpace:'nowrap', marginRight:8 }}>
          {correct ? 'Correct' : `Your: ${answer!==null?LETTERS[answer]:'—'} · Correct: ${LETTERS[q.correct]}`}
        </span>
        {open?<ChevronUp size={14} color="var(--text3)"/>:<ChevronDown size={14} color="var(--text3)"/>}
      </button>
      {open && (
        <div style={{ padding:'14px 16px', background:'white' }}>
          <div style={{ display:'flex', flexDirection:'column', gap:7, marginBottom:12 }}>
            {q.options.map((opt,i) => {
              const isCorrect = i===q.correct
              const isSelected = i===answer
              let cls = 'opt'
              if (isCorrect) cls += ' show-right'
              else if (isSelected) cls += ' wrong'
              return (
                <div key={i} className={cls} style={{ cursor:'default' }}>
                  <span className="opt-ltr">{LETTERS[i]}</span>
                  <span style={{ flex:1 }}>{opt}</span>
                  {isCorrect && <span style={{ fontSize:11, fontWeight:700, color:'#047857' }}>Correct answer</span>}
                  {isSelected && !isCorrect && <span style={{ fontSize:11, fontWeight:700, color:'var(--red)' }}>Your answer</span>}
                </div>
              )
            })}
          </div>
          <div className={`sol-box ${!correct?'wrong':''}`}>
            <div className="sol-title">{correct?'Solution':'Explanation'}</div>
            <div className="sol-text">{q.solution}</div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function StudentResults() {
  const { getMyAssignedExams, getMySubmission, getExamById } = useApp()
  const exams = getMyAssignedExams()
  const done = exams.filter(e => getMySubmission(e.id))
  const [selectedId, setSelectedId] = useState(done[0]?.id||null)
  const [tab, setTab] = useState('overview')

  const exam = selectedId ? getExamById(selectedId) : null
  const sub = selectedId ? getMySubmission(selectedId) : null
  const pct = sub ? Math.round((sub.score/sub.total)*100) : 0
  const g = exam&&sub ? getGrade(pct) : null
  const col = getColor(pct)
  const wrong = sub ? sub.answers.filter((a,i)=>a!==exam?.questions[i]?.correct).length : 0
  const skipped = sub ? sub.answers.filter(a=>a===null).length : 0

  return (
    <>
      <div className="ph"><h1>My Results</h1><p>{done.length} exam{done.length!==1?'s':''} completed</p></div>
      {done.length===0 ? (
        <div className="empty" style={{ marginTop:40 }}>
          <div className="empty-ico"><ClipboardCheck size={32}/></div>
          <h3>No results yet</h3>
          <p>Complete an exam to see your score, solutions and feedback here</p>
        </div>
      ) : (
        <>
          <div className="fl" style={{ maxWidth:400, marginBottom:22 }}>
            <label className="lbl">Select Exam</label>
            <select className="sel" value={selectedId||''} onChange={e => { setSelectedId(e.target.value); setTab('overview') }}>
              {done.map(e => {
                const s=getMySubmission(e.id)
                const p=Math.round((s.score/s.total)*100)
                return <option key={e.id} value={e.id}>{e.title} — {p}%</option>
              })}
            </select>
          </div>

          {exam && sub && (
            <>
              <div className="tabs" style={{ maxWidth:440 }}>
                {['overview','review','solutions'].map(t => (
                  <button key={t} className={`tab ${tab===t?'on':''}`} onClick={() => setTab(t)}>
                    {t==='overview'?'Overview':t==='review'?'Answer Review':'All Solutions'}
                  </button>
                ))}
              </div>

              {tab==='overview' && (
                <div className="g2" style={{ maxWidth:700, marginBottom:20 }}>
                  <div className="card" style={{ display:'flex', gap:18, alignItems:'center' }}>
                    <ProgressRing pct={pct} size={120} stroke={11} color={col} label={`${pct}%`} sub="Score"/>
                    <div>
                      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
                        <span className={`gb g${g}`} style={{ width:44, height:44, fontSize:20, borderRadius:12 }}>{g}</span>
                        <div>
                          <div style={{ fontFamily:'var(--fd)', fontSize:18, fontWeight:800, color:col }}>
                            {pct>=90?'Excellent!':pct>=80?'Great job!':pct>=70?'Good effort':pct>=60?'Just passing':'Needs work'}
                          </div>
                          <div style={{ fontSize:12, color:'var(--text2)' }}>{sub.score} of {sub.total} correct</div>
                        </div>
                      </div>
                      <div style={{ fontSize:13, color:'var(--text2)', lineHeight:1.6, padding:'10px 14px', background:`${col}14`, borderRadius:9, borderLeft:`3px solid ${col}` }}>
                        {pct>=90?'Outstanding! You have mastered this topic.':pct>=80?'Great performance. Review the few missed questions.':pct>=70?'Good work. Focus on incorrect answers and their solutions.':pct>=60?'Passing grade. Review all missed questions carefully.':'Revisit the material. Read all solutions and try again.'}
                      </div>
                    </div>
                  </div>
                  <div className="card">
                    <div className="ct" style={{ marginBottom:14 }}>Breakdown</div>
                    {[
                      { lbl:'Correct', val:sub.score, col:'var(--green)' },
                      { lbl:'Wrong', val:wrong-skipped, col:'var(--red)' },
                      { lbl:'Unanswered', val:skipped, col:'var(--text3)' },
                    ].map(({ lbl,val,col:c }) => (
                      <div key={lbl} style={{ marginBottom:12 }}>
                        <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, marginBottom:4 }}>
                          <span style={{ color:'var(--text2)', fontWeight:500 }}>{lbl}</span>
                          <span style={{ fontWeight:700, color:c }}>{val}</span>
                        </div>
                        <div className="prog-bar"><div className="prog-fill" style={{ width:`${Math.round((val/sub.total)*100)}%`, background:c, transition:'width 0.8s' }}/></div>
                      </div>
                    ))}
                    <div className="divider"/>
                    <div style={{ display:'flex', gap:8, marginTop:12 }}>
                      <button className="btn btn-s btn-sm" onClick={() => setTab('review')}>Review Answers</button>
                      <button className="btn btn-teal btn-sm" onClick={() => setTab('solutions')}>See Solutions</button>
                    </div>
                  </div>
                </div>
              )}

              {tab==='review' && (
                <div style={{ maxWidth:700 }}>
                  <div style={{ display:'flex', gap:8, marginBottom:14 }}>
                    <span className="badge bdg-g">{sub.score} correct</span>
                    <span className="badge bdg-r">{wrong} wrong/skipped</span>
                  </div>
                  <p style={{ fontSize:12, color:'var(--text2)', marginBottom:16 }}>Click any question to expand and see the correct answer and explanation.</p>
                  {exam.questions.map((q,i) => <QuestionReview key={q.id} q={q} answer={sub.answers[i]} idx={i}/>)}
                </div>
              )}

              {tab==='solutions' && (
                <div style={{ maxWidth:700 }}>
                  <p style={{ fontSize:12, color:'var(--text2)', marginBottom:16 }}>All questions with correct answers highlighted and full solutions.</p>
                  {exam.questions.map((q,i) => (
                    <div key={q.id} className="card" style={{ marginBottom:14 }}>
                      <div className="qnum-label" style={{ marginBottom:6 }}>Question {i+1}</div>
                      <div className="qtext" style={{ fontSize:14 }}>{q.text}</div>
                      <div style={{ display:'flex', flexDirection:'column', gap:7, marginBottom:14 }}>
                        {q.options.map((opt,oi) => (
                          <div key={oi} className={`opt ${oi===q.correct?'show-right':oi===sub.answers[i]&&oi!==q.correct?'wrong':''}`} style={{ cursor:'default' }}>
                            <span className="opt-ltr">{LETTERS[oi]}</span>
                            <span style={{ flex:1 }}>{opt}</span>
                            {oi===q.correct && <span style={{ fontSize:11, fontWeight:700, color:'#047857' }}>Correct answer</span>}
                            {oi===sub.answers[i] && oi!==q.correct && <span style={{ fontSize:11, fontWeight:700, color:'var(--red)' }}>Your answer</span>}
                          </div>
                        ))}
                      </div>
                      <div className="sol-box">
                        <div className="sol-title">Solution</div>
                        <div className="sol-text">{q.solution}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </>
      )}
    </>
  )
}
