import { useState, useEffect, useCallback } from 'react'
import { ChevronLeft, ChevronRight, Send, Clock } from 'lucide-react'
import { useApp } from '../../context/AppContext'

const LETTERS = ['A','B','C','D']

function shuffle(arr) {
  const a = [...arr]
  for (let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}
  return a
}

export default function TakeExam({ examId, onFinish, onCancel }) {
  const { getExamById, getMySubmission, submitExam } = useApp()
  const exam = getExamById(examId)
  const existing = getMySubmission(examId)
  const [questions] = useState(() => shuffle(exam?.questions||[]))
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState(Array(exam?.questions.length||0).fill(null))
  const [confirming, setConfirming] = useState(false)
  const [timeLeft, setTimeLeft] = useState((exam?.duration||30)*60)
  const [submitted, setSubmitted] = useState(false)

  const doSubmit = useCallback(() => {
    if (submitted) return
    setSubmitted(true)
    // Re-map answers back to original question order
    const originalAnswers = exam.questions.map((origQ) => {
      const shuffledIdx = questions.findIndex(q => q.id === origQ.id)
      return shuffledIdx !== -1 ? answers[shuffledIdx] : null
    })
    submitExam(examId, originalAnswers)
    setTimeout(onFinish, 800)
  }, [answers, questions, exam, examId, submitted])

  useEffect(() => {
    if (submitted || existing) return
    const t = setInterval(() => {
      setTimeLeft(s => {
        if (s<=1){clearInterval(t);doSubmit();return 0}
        return s-1
      })
    }, 1000)
    return () => clearInterval(t)
  }, [submitted, doSubmit])

  if (!exam) return <div className="empty"><h3>Exam not found</h3></div>
  if (existing) return (
    <div className="empty" style={{ marginTop:60 }}>
      <div className="empty-ico" style={{ width:72, height:72, borderRadius:18 }}><Send size={28}/></div>
      <h3>Already submitted</h3>
      <p>You've already completed this exam. View your results in My Results.</p>
      <button className="btn btn-teal" style={{ marginTop:8 }} onClick={onFinish}>View Results</button>
    </div>
  )

  const q = questions[current]
  const answered = answers.filter(a=>a!==null).length
  const total = questions.length
  const pct = Math.round((answered/total)*100)
  const mins = Math.floor(timeLeft/60)
  const secs = timeLeft%60
  const timerWarning = timeLeft<120

  return (
    <>
      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:18 }}>
        <button className="icon-btn" onClick={onCancel} title="Exit"><ChevronLeft size={16}/></button>
        <div style={{ flex:1 }}>
          <div style={{ fontFamily:'var(--fd)', fontSize:17, fontWeight:800 }}>{exam.title}</div>
          <div style={{ fontSize:12, color:'var(--text2)' }}>{exam.subject} · {total} questions · Shuffled order</div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:6, padding:'7px 14px', borderRadius:10, background:timerWarning?'var(--red-l)':'var(--bg)', border:`1px solid ${timerWarning?'var(--red)':'var(--border)'}` }}>
          <Clock size={15} color={timerWarning?'var(--red)':'var(--text2)'}/>
          <span style={{ fontFamily:'var(--fd)', fontWeight:700, fontSize:15, color:timerWarning?'var(--red)':'var(--text)', fontVariantNumeric:'tabular-nums' }}>
            {String(mins).padStart(2,'0')}:{String(secs).padStart(2,'0')}
          </span>
        </div>
      </div>

      <div style={{ marginBottom:20 }}>
        <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, color:'var(--text2)', marginBottom:6 }}>
          <span>{answered} of {total} answered</span>
          <span>{pct}%</span>
        </div>
        <div className="prog-bar"><div className="prog-fill green" style={{ width:pct+'%' }}/></div>
      </div>

      <div className="g2-1" style={{ alignItems:'start' }}>
        <div>
          <div style={{ background:'var(--card)', borderRadius:'var(--r)', border:'1px solid var(--border)', padding:'24px', boxShadow:'var(--shadow)', marginBottom:14 }}>
            <div className="qnum-label">Question {current+1} of {total}</div>
            <div className="qtext">{q.text}</div>
            <div style={{ display:'flex', flexDirection:'column', gap:9 }}>
              {q.options.map((opt,i) => (
                <button key={i} className={`opt ${answers[current]===i?'picked':''}`} onClick={() => {
                  const a=[...answers]; a[current]=i; setAnswers(a)
                }}>
                  <span className="opt-ltr">{LETTERS[i]}</span>
                  {opt}
                </button>
              ))}
            </div>
          </div>
          <div style={{ display:'flex', gap:10 }}>
            <button className="btn btn-s" onClick={() => setCurrent(c=>Math.max(0,c-1))} disabled={current===0}><ChevronLeft size={15}/> Prev</button>
            <div style={{ flex:1 }}/>
            {current<total-1
              ? <button className="btn btn-p" onClick={() => setCurrent(c=>c+1)}>Next <ChevronRight size={15}/></button>
              : <button className="btn btn-teal" style={{ flex:1 }} onClick={() => answered<total?setConfirming(true):doSubmit()} disabled={submitted}>
                  <Send size={15}/> {submitted?'Submitting...':'Submit Exam'}
                </button>
            }
          </div>
        </div>

        <div style={{ position:'sticky', top:0 }}>
          <div className="card" style={{ marginBottom:12 }}>
            <div className="ch" style={{ marginBottom:12 }}>
              <div className="ct">Questions</div>
              <span className="badge bdg-g">{answered}/{total}</span>
            </div>
            <div className="qnav">
              {questions.map((_,i) => (
                <button key={i} className={`qn ${i===current?'current':answers[i]!==null?'answered':''}`} onClick={() => setCurrent(i)}>{i+1}</button>
              ))}
            </div>
            <div style={{ marginTop:12, fontSize:11, color:'var(--text3)', lineHeight:1.6 }}>
              <span style={{ display:'inline-block', width:10, height:10, borderRadius:3, background:'var(--green)', marginRight:4 }}></span>Answered &nbsp;
              <span style={{ display:'inline-block', width:10, height:10, borderRadius:3, background:'var(--border)', marginRight:4 }}></span>Unanswered
            </div>
          </div>
          <button className="btn btn-teal" style={{ width:'100%', justifyContent:'center' }} onClick={() => answered<total?setConfirming(true):doSubmit()} disabled={submitted}>
            <Send size={14}/> Submit Exam
          </button>
        </div>
      </div>

      {confirming && (
        <div className="overlay" onClick={() => setConfirming(false)}>
          <div className="modal" style={{ maxWidth:360 }} onClick={e=>e.stopPropagation()}>
            <div className="mh"><div className="mt">Submit with unanswered?</div><button className="xbtn" onClick={() => setConfirming(false)}>×</button></div>
            <p style={{ fontSize:13, color:'var(--text2)', marginBottom:18, lineHeight:1.6 }}>
              You have <strong>{total-answered} unanswered</strong> question{total-answered!==1?'s':''}. They will be marked incorrect.
            </p>
            <div style={{ display:'flex', gap:10 }}>
              <button className="btn btn-s" style={{ flex:1 }} onClick={() => setConfirming(false)}>Go back</button>
              <button className="btn btn-p" style={{ flex:1 }} onClick={() => {setConfirming(false);doSubmit()}}>Submit anyway</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
