import { useState } from 'react'
import { Plus, Trash2, Pencil, Send, Users, Eye, ChevronUp, ChevronDown, BookOpen, Sparkles } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import CedricAI from '../../components/CedricAI'

const LETTERS = ['A','B','C','D']
function blankQ(id) { return { id, text: '', options: ['','','',''], correct: 0, solution: '' } }

function ExamBuilder({ initial, courses, onSave, onCancel }) {
  const { toast } = useApp()
  const [title, setTitle] = useState(initial?.title || '')
  const [courseId, setCourseId] = useState(initial?.courseId || courses[0]?.id || '')
  const [desc, setDesc] = useState(initial?.description || '')
  const [duration, setDuration] = useState(initial?.duration || 30)
  const [questions, setQuestions] = useState(initial?.questions?.length ? initial.questions : [blankQ(1)])
  const [nextId, setNextId] = useState(200)
  const [mode, setMode] = useState('manual') // manual | ai

  const selectedCourse = courses.find(c => c.id === courseId)

  const addQ = () => { setQuestions(q => [...q, blankQ(nextId)]); setNextId(n => n + 1) }
  const delQ = (id) => { if (questions.length === 1) { toast('At least 1 question required','err'); return } setQuestions(q => q.filter(x => x.id !== id)) }
  const upd = (id, f, v) => setQuestions(q => q.map(x => x.id === id ? { ...x, [f]: v } : x))
  const updOpt = (id, oi, v) => setQuestions(q => q.map(x => x.id === id ? { ...x, options: x.options.map((o,i) => i===oi?v:o) } : x))
  const move = (idx, dir) => {
    const a = [...questions]; const b = idx+dir
    if (b < 0 || b >= a.length) return
    ;[a[idx],a[b]] = [a[b],a[idx]]; setQuestions(a)
  }

  const handleAIQuestions = (aiQuestions, topic, subject) => {
    setQuestions(aiQuestions)
    if (!title) setTitle(`${subject}: ${topic}`)
    setMode('manual')
    toast(`Cedric generated ${aiQuestions.length} questions — review and save`, 'ok')
  }

  const save = () => {
    if (!title.trim()) { toast('Enter exam title','err'); return }
    if (!courseId) { toast('Select a course','err'); return }
    for (let i=0; i<questions.length; i++) {
      const q = questions[i]
      if (!q.text.trim()) { toast(`Q${i+1}: question text is empty`,'err'); return }
      if (q.options.some(o => !o.trim())) { toast(`Q${i+1}: all options must be filled`,'err'); return }
      if (!q.solution.trim()) { toast(`Q${i+1}: solution/explanation is required`,'err'); return }
    }
    onSave({ title, courseId, subject: selectedCourse?.subject || 'General', description: desc, duration: Number(duration), questions, aiGenerated: mode === 'ai' })
  }

  if (mode === 'ai') return (
    <CedricAI
      courseId={courseId}
      subject={selectedCourse?.subject}
      onQuestionsReady={handleAIQuestions}
      onCancel={() => setMode('manual')}
    />
  )

  return (
    <div>
      {/* Mode selector */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        <button
          className={`btn ${mode==='manual' ? 'btn-p' : 'btn-s'}`}
          style={{ flex: 1, justifyContent: 'center', padding: '12px' }}
          onClick={() => setMode('manual')}
        >
          <Pencil size={15}/> Build Manually
        </button>
        <button
          className={`btn ${mode==='ai' ? 'btn-p' : 'btn-s'}`}
          style={{ flex: 1, justifyContent: 'center', padding: '12px', background: mode==='ai' ? 'linear-gradient(135deg,#6C63FF,#A29BFE)' : '' }}
          onClick={() => setMode('ai')}
        >
          <Sparkles size={15}/> Ask Cedric AI
        </button>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="ct" style={{ marginBottom: 16 }}>Exam Details</div>
        <div className="fl">
          <label className="lbl">Course *</label>
          <select className="sel" value={courseId} onChange={e => setCourseId(e.target.value)}>
            {courses.length === 0 ? <option value="">No courses — create one first</option> : courses.map(c => <option key={c.id} value={c.id}>{c.title} ({c.code})</option>)}
          </select>
          {selectedCourse && <span className="inp-hint">{selectedCourse.enrolledStudents.length} enrolled students will see this exam when published</span>}
        </div>
        <div className="g2" style={{ gap: 12 }}>
          <div className="fl"><label className="lbl">Exam Title *</label><input className="inp" placeholder="e.g. Mid-Semester Test" value={title} onChange={e => setTitle(e.target.value)}/></div>
          <div className="fl"><label className="lbl">Duration (min)</label><input className="inp" type="number" min={5} max={180} value={duration} onChange={e => setDuration(e.target.value)}/></div>
        </div>
        <div className="fl"><label className="lbl">Description</label><input className="inp" placeholder="Optional instructions for students" value={desc} onChange={e => setDesc(e.target.value)}/></div>
      </div>

      {questions.map((q, idx) => (
        <div key={q.id} className="q-block">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--purple)', textTransform: 'uppercase', letterSpacing: '0.5px', flex: 1 }}>Question {idx+1}</span>
            <button className="icon-btn" style={{ width: 28, height: 28, borderRadius: 7 }} onClick={() => move(idx,-1)} disabled={idx===0}><ChevronUp size={13}/></button>
            <button className="icon-btn" style={{ width: 28, height: 28, borderRadius: 7 }} onClick={() => move(idx,1)} disabled={idx===questions.length-1}><ChevronDown size={13}/></button>
            <button style={{ width: 28, height: 28, borderRadius: 7, background: 'var(--red-l)', color: 'var(--red)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => delQ(q.id)}><Trash2 size={13}/></button>
          </div>
          <div className="fl">
            <label className="lbl">Question *</label>
            <textarea className="inp" rows={2} placeholder="Type your question here..." value={q.text} onChange={e => upd(q.id,'text',e.target.value)} style={{ resize: 'vertical', lineHeight: 1.5 }}/>
          </div>
          <div className="lbl" style={{ marginBottom: 8 }}>Options — select the correct answer</div>
          {LETTERS.map((l,oi) => (
            <div key={l} className="opt-row">
              <div className={`opt-ltr-sm ${q.correct===oi?'correct':''}`}>{l}</div>
              <input className="inp" style={{ flex: 1 }} placeholder={`Option ${l}`} value={q.options[oi]} onChange={e => updOpt(q.id,oi,e.target.value)}/>
              <input type="radio" className="radio-c" name={`c-${q.id}`} checked={q.correct===oi} onChange={() => upd(q.id,'correct',oi)} title="Mark as correct"/>
              {q.correct===oi && <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--green)', whiteSpace: 'nowrap' }}>Correct</span>}
            </div>
          ))}
          <div className="fl" style={{ marginTop: 10 }}>
            <label className="lbl">Solution / Explanation * <span style={{ fontWeight: 400, color: 'var(--text3)' }}>(shown after marking)</span></label>
            <textarea className="inp" rows={2} placeholder="Explain why this answer is correct..." value={q.solution} onChange={e => upd(q.id,'solution',e.target.value)} style={{ resize: 'vertical', lineHeight: 1.5 }}/>
          </div>
        </div>
      ))}

      <div style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap' }}>
        <button className="btn btn-s" onClick={addQ}><Plus size={14}/> Add Question</button>
        <div style={{ flex: 1 }}/>
        <button className="btn btn-s" onClick={onCancel}>Cancel</button>
        <button className="btn btn-p" onClick={save}>Save Exam ({questions.length} Q)</button>
      </div>
    </div>
  )
}

export default function TeacherExams({ onNavigate }) {
  const { getMyExams, getMyCourses, createExam, updateExam, deleteExam, publishExam, getExamSubmissions, db } = useApp()
  const exams = getMyExams()
  const courses = getMyCourses()
  const [view, setView] = useState('list')
  const [editExam, setEditExam] = useState(null)
  const [confirmDel, setConfirmDel] = useState(null)

  const handleSave = (data) => {
    if (editExam) { updateExam(editExam.id, data); setEditExam(null) }
    else createExam(data)
    setView('list')
  }

  const getCourse = (id) => db.courses.find(c => c.id === id)

  if (view === 'build') return (
    <>
      <div className="ph"><h1>Build New Exam</h1><p>Create manually or let Cedric AI generate the questions</p></div>
      <ExamBuilder courses={courses} onSave={handleSave} onCancel={() => setView('list')}/>
    </>
  )
  if (view === 'edit' && editExam) return (
    <>
      <div className="ph"><h1>Edit Exam</h1><p>{editExam.title}</p></div>
      <ExamBuilder initial={editExam} courses={courses} onSave={handleSave} onCancel={() => { setEditExam(null); setView('list') }}/>
    </>
  )

  return (
    <>
      <div className="ph">
        <div className="ph-row">
          <div><h1>My Exams</h1><p>{exams.length} exam{exams.length!==1?'s':''}</p></div>
          <button className="btn btn-p" onClick={() => setView('build')}><Plus size={15}/> Build Exam</button>
        </div>
      </div>

      {courses.length === 0 && (
        <div style={{ background: 'var(--amber-l)', border: '1px solid var(--amber)', borderRadius: 12, padding: '14px 18px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12, fontSize: 13 }}>
          <BookOpen size={18} color="#92630a"/>
          <span style={{ color: '#92630a', fontWeight: 500 }}>You need a course before creating exams. <button className="btn btn-s btn-sm" style={{ marginLeft: 8 }} onClick={() => onNavigate('courses')}>Create Course</button></span>
        </div>
      )}

      {exams.length === 0 ? (
        <div className="empty" style={{ marginTop: 40 }}>
          <div className="empty-ico" style={{ width: 72, height: 72, borderRadius: 18 }}><BookOpen size={32}/></div>
          <h3>No exams yet</h3>
          <p>Build an exam manually or use Cedric AI to generate questions instantly</p>
          <button className="btn btn-p" style={{ marginTop: 8 }} onClick={() => setView('build')}><Plus size={14}/> Build Exam</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {exams.map(ex => {
            const subs = getExamSubmissions(ex.id)
            const avg = subs.length ? Math.round(subs.reduce((a,s) => a+(s.score/s.total)*100,0)/subs.length) : null
            const course = getCourse(ex.courseId)
            return (
              <div key={ex.id} className="exam-card">
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                  <div style={{ width: 46, height: 46, borderRadius: 12, background: ex.aiGenerated ? 'linear-gradient(135deg,#6C63FF22,#A29BFE33)' : 'var(--purple-l)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: ex.aiGenerated ? '1px solid var(--purple)' : 'none' }}>
                    {ex.aiGenerated ? <Sparkles size={20} color="var(--purple)"/> : <BookOpen size={20} color="var(--purple)"/>}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <span style={{ fontFamily: 'var(--fd)', fontWeight: 700, fontSize: 15 }}>{ex.title}</span>
                      <span className={`exam-status ${ex.status}`}><span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor', display: 'inline-block' }}></span> {ex.status}</span>
                      {ex.aiGenerated && <span className="badge" style={{ background: 'linear-gradient(135deg,#EEF0FF,#DDD9FF)', color: 'var(--purple)', gap: 4 }}><Sparkles size={10}/> Cedric AI</span>}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 3 }}>
                      {course ? `${course.title} (${course.code})` : ex.subject} · {ex.questions.length} questions · {ex.duration} min · {ex.createdAt}
                    </div>
                    {ex.description && <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>{ex.description}</div>}
                    <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
                      <span className="badge bdg-b"><Users size={11} style={{ marginRight: 4 }}/>{course?.enrolledStudents?.length || 0} can see</span>
                      <span className="badge bdg-g">{subs.length} submission{subs.length!==1?'s':''}</span>
                      {avg !== null && <span className="badge bdg-p">Avg: {avg}%</span>}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 7, flexShrink: 0, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                    {ex.status === 'draft' && <button className="btn btn-teal btn-sm" onClick={() => publishExam(ex.id)}><Send size={13}/> Publish</button>}
                    <button className="btn btn-s btn-sm" onClick={() => onNavigate('results', ex.id)}><Eye size={13}/> Results</button>
                    <button className="btn btn-s btn-sm" onClick={() => { setEditExam(ex); setView('edit') }}><Pencil size={13}/></button>
                    <button className="btn btn-r btn-sm" onClick={() => setConfirmDel(ex)}><Trash2 size={13}/></button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {confirmDel && (
        <div className="overlay" onClick={() => setConfirmDel(null)}>
          <div className="modal" style={{ maxWidth: 360 }} onClick={e => e.stopPropagation()}>
            <div className="mh"><div className="mt">Delete Exam?</div><button className="xbtn" onClick={() => setConfirmDel(null)}>×</button></div>
            <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 18, lineHeight: 1.6 }}>Delete <strong>"{confirmDel.title}"</strong>? All submissions will also be deleted.</p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-s" style={{ flex: 1 }} onClick={() => setConfirmDel(null)}>Cancel</button>
              <button className="btn btn-r" style={{ flex: 1 }} onClick={() => { deleteExam(confirmDel.id); setConfirmDel(null) }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
