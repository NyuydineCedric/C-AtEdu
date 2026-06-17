import { useState } from "react";
import { ChevronDown, ChevronUp, ClipboardCheck, Trophy } from "lucide-react";
import { useApp } from "../../context/AppContext";
import ProgressRing from "../../components/ProgressRing";

const LETTERS = ["A", "B", "C", "D"];
function getGrade(p) {
  return p >= 90 ? "A" : p >= 80 ? "B" : p >= 70 ? "C" : p >= 60 ? "D" : "F";
}
function getColor(p) {
  return p >= 80 ? "var(--green)" : p >= 60 ? "var(--purple)" : "var(--red)";
}

function StudentResult({ sub, exam }) {
  const [open, setOpen] = useState(false);
  const pct = Math.round((sub.score / sub.total) * 100);
  const g = getGrade(pct);
  const col = getColor(pct);
  const initials =
    sub.student?.name
      ?.split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2) || "?";
  return (
    <div
      style={{
        border: "1px solid var(--border)",
        borderRadius: 12,
        marginBottom: 10,
        overflow: "hidden",
      }}
    >
      <button
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: 14,
          padding: "13px 16px",
          background: "white",
          cursor: "pointer",
          border: "none",
          font: "inherit",
          textAlign: "left",
        }}
        onClick={() => setOpen((o) => !o)}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: "var(--purple-l)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "var(--fd)",
            fontWeight: 800,
            fontSize: 13,
            color: "var(--purple)",
            flexShrink: 0,
          }}
        >
          {initials}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, fontSize: 13 }}>
            {sub.student?.name || "Unknown"}
          </div>
          <div style={{ fontSize: 11, color: "var(--text2)" }}>
            {sub.student?.matricule} ·{" "}
            {new Date(sub.submittedAt).toLocaleString()}
          </div>
        </div>
        <div style={{ textAlign: "right", marginRight: 8 }}>
          <div
            style={{
              fontFamily: "var(--fd)",
              fontWeight: 800,
              fontSize: 16,
              color: col,
            }}
          >
            {pct}%
          </div>
          <div style={{ fontSize: 11, color: "var(--text2)" }}>
            {sub.score}/{sub.total}
          </div>
        </div>
        <span
          className={`gb g${g}`}
          style={{
            width: 32,
            height: 32,
            fontSize: 15,
            borderRadius: 9,
            flexShrink: 0,
          }}
        >
          {g}
        </span>
        {open ? (
          <ChevronUp size={15} color="var(--text3)" />
        ) : (
          <ChevronDown size={15} color="var(--text3)" />
        )}
      </button>
      {open && (
        <div
          style={{
            padding: "14px 16px",
            borderTop: "1px solid var(--border)",
            background: "var(--bg)",
          }}
        >
          <div
            style={{
              fontWeight: 600,
              fontSize: 12,
              color: "var(--text2)",
              marginBottom: 10,
              textTransform: "uppercase",
              letterSpacing: "0.4px",
            }}
          >
            Question breakdown
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {exam.questions.map((q, i) => {
              const ans = sub.answers[i];
              const correct = ans === q.correct;
              return (
                <div
                  key={q.id}
                  style={{
                    background: "white",
                    borderRadius: 9,
                    padding: "10px 14px",
                    border: `1px solid ${correct ? "var(--green)" : "var(--red)"}`,
                  }}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 10 }}
                  >
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: "var(--text2)",
                        minWidth: 20,
                      }}
                    >
                      Q{i + 1}
                    </span>
                    <span
                      style={{ flex: 1, fontSize: 12, color: "var(--text)" }}
                    >
                      {q.text}
                    </span>
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: correct ? "#047857" : "var(--red)",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {correct
                        ? `Correct (${LETTERS[ans] || "—"})`
                        : `${ans !== null ? LETTERS[ans] : "—"} → ${LETTERS[q.correct]}`}
                    </span>
                  </div>
                  {!correct && (
                    <div
                      style={{
                        marginTop: 8,
                        padding: "8px 10px",
                        background: "var(--green-l)",
                        borderRadius: 7,
                        fontSize: 12,
                        color: "var(--text)",
                        borderLeft: "2px solid var(--green)",
                      }}
                    >
                      <strong style={{ color: "#047857" }}>Solution: </strong>
                      {q.solution}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function PendingList({ exam, subs }) {
  const { getAllStudents, db } = useApp();
  const students = getAllStudents();
  const course = db.courses.find((c) => c.id === exam.courseId);
  const pending = (course?.enrolledStudents || [])
    .filter((id) => !subs.find((s) => s.studentId === id))
    .map((id) => students.find((s) => s.id === id))
    .filter(Boolean);
  if (!pending.length) return null;
  return (
    <div className="card" style={{ marginTop: 16 }}>
      <div className="ct" style={{ marginBottom: 10, color: "var(--red)" }}>
        Not Submitted ({pending.length})
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {pending.map((s) => (
          <div
            key={s.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "9px 12px",
              background: "var(--bg)",
              borderRadius: 9,
            }}
          >
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: 8,
                background: "var(--red-l)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 11,
                fontWeight: 700,
                color: "var(--red)",
                flexShrink: 0,
              }}
            >
              {s.name
                .split(" ")
                .map((w) => w[0])
                .join("")
                .slice(0, 2)}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 13 }}>{s.name}</div>
              <div style={{ fontSize: 11, color: "var(--text2)" }}>
                {s.matricule}
              </div>
            </div>
            <span className="badge bdg-r">Pending</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Rankings({ exam, subs }) {
  const rankings = [...subs].sort(
    (a, b) => b.score / b.total - a.score / a.total,
  );
  const medals = ["", "", ""];
  return (
    <div>
      <div
        style={{
          fontFamily: "var(--fd)",
          fontWeight: 700,
          fontSize: 15,
          marginBottom: 14,
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <Trophy size={18} color="#FFB800" /> Student Rankings
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {rankings.map((sub, i) => {
          const pct = Math.round((sub.score / sub.total) * 100);
          const col = getColor(pct);
          const g = getGrade(pct);
          return (
            <div
              key={sub.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "12px 16px",
                background: i < 3 ? `${col}10` : "var(--bg)",
                borderRadius: 10,
                border: `1px solid ${i < 3 ? col : "var(--border)"}`,
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 9,
                  background:
                    i === 0
                      ? "#FFD700"
                      : i === 1
                        ? "#C0C0C0"
                        : i === 2
                          ? "#CD7F32"
                          : "var(--border)",
                  color: i < 3 ? "white" : "var(--text2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: "var(--fd)",
                  fontWeight: 800,
                  fontSize: 14,
                  flexShrink: 0,
                }}
              >
                {i + 1}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 13 }}>
                  {sub.student?.name || "Unknown"}
                </div>
                <div style={{ fontSize: 11, color: "var(--text2)" }}>
                  {sub.student?.matricule}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div
                  style={{
                    fontFamily: "var(--fd)",
                    fontWeight: 800,
                    fontSize: 16,
                    color: col,
                  }}
                >
                  {pct}%
                </div>
                <div style={{ fontSize: 11, color: "var(--text2)" }}>
                  {sub.score}/{sub.total}
                </div>
              </div>
              <span
                className={`gb g${g}`}
                style={{ width: 28, height: 28, fontSize: 13, borderRadius: 8 }}
              >
                {g}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function TeacherResults({ examId }) {
  const { getMyExams, getExamSubmissions, db } = useApp();
  const exams = getMyExams();
  const [selectedId, setSelectedId] = useState(examId || exams[0]?.id || null);
  const [tab, setTab] = useState("submissions");
  const exam = exams.find((e) => e.id === selectedId);
  const subs = exam ? getExamSubmissions(exam.id) : [];
  const avg = subs.length
    ? Math.round(
        subs.reduce((a, s) => a + (s.score / s.total) * 100, 0) / subs.length,
      )
    : 0;
  const passed = subs.filter((s) => (s.score / s.total) * 100 >= 60).length;
  const course = exam ? db.courses.find((c) => c.id === exam.courseId) : null;

  return (
    <>
      <div className="ph">
        <h1>Results</h1>
        <p>View student submissions and rankings per exam</p>
      </div>
      <div className="fl" style={{ maxWidth: 420, marginBottom: 22 }}>
        <label className="lbl">Select Exam</label>
        <select
          className="sel"
          value={selectedId || ""}
          onChange={(e) => setSelectedId(e.target.value)}
        >
          {exams.length === 0 ? (
            <option>No exams yet</option>
          ) : (
            exams.map((e) => (
              <option key={e.id} value={e.id}>
                {e.title}
              </option>
            ))
          )}
        </select>
      </div>

      {!exam ? (
        <div className="empty">
          <div className="empty-ico">
            <ClipboardCheck size={32} />
          </div>
          <h3>No exam selected</h3>
        </div>
      ) : (
        <>
          <div className="g3" style={{ marginBottom: 20 }}>
            <div
              className="card"
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
              }}
            >
              <ProgressRing
                pct={avg}
                size={110}
                stroke={10}
                color={getColor(avg)}
                label={`${avg}%`}
                sub="Class avg"
              />
              <div
                style={{
                  textAlign: "center",
                  fontSize: 12,
                  color: "var(--text2)",
                }}
              >
                {subs.length} submission{subs.length !== 1 ? "s" : ""}
              </div>
            </div>
            <div className="card">
              <div className="ct" style={{ marginBottom: 12 }}>
                Exam Summary
              </div>
              {[
                ["Exam", exam.title],
                ["Course", course ? `${course.title} (${course.code})` : "—"],
                ["Questions", exam.questions.length],
                [
                  "Enrolled",
                  (course?.enrolledStudents?.length || 0) + " students",
                ],
                [
                  "Submitted",
                  `${subs.length} / ${course?.enrolledStudents?.length || 0}`,
                ],
                [
                  "Pass rate",
                  subs.length
                    ? Math.round((passed / subs.length) * 100) + "%"
                    : "—",
                ],
              ].map(([k, v]) => (
                <div key={k} className="info-row">
                  <span className="k">{k}</span>
                  <span className="v">{v}</span>
                </div>
              ))}
            </div>
            <div className="card">
              <div className="ct" style={{ marginBottom: 12 }}>
                Grade Breakdown
              </div>
              {["A", "B", "C", "D", "F"].map((g, i) => {
                const ranges = [
                  [90, 100],
                  [80, 89],
                  [70, 79],
                  [60, 69],
                  [0, 59],
                ];
                const count = subs.filter((s) => {
                  const p = (s.score / s.total) * 100;
                  return p >= ranges[i][0] && p <= ranges[i][1];
                }).length;
                const colors = [
                  "var(--green)",
                  "var(--purple)",
                  "#FFB800",
                  "#FF8C00",
                  "var(--red)",
                ];
                return (
                  <div
                    key={g}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      marginBottom: 8,
                      fontSize: 12,
                    }}
                  >
                    <span
                      style={{ width: 18, fontWeight: 700, color: colors[i] }}
                    >
                      {g}
                    </span>
                    <div
                      style={{
                        flex: 1,
                        height: 6,
                        background: "var(--border)",
                        borderRadius: 3,
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          width: subs.length
                            ? `${(count / subs.length) * 100}%`
                            : "0%",
                          background: colors[i],
                          borderRadius: 3,
                        }}
                      />
                    </div>
                    <span
                      style={{
                        color: "var(--text2)",
                        minWidth: 16,
                        textAlign: "right",
                      }}
                    >
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Difficulty bar */}
          {subs.length > 0 && (
            <div className="card" style={{ marginBottom: 20 }}>
              <div className="ch">
                <div className="ct">Question Difficulty</div>
                <div className="cs">% correct per question</div>
              </div>
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  alignItems: "flex-end",
                  height: 80,
                }}
              >
                {exam.questions.map((q, i) => {
                  const correct = subs.filter(
                    (s) => s.answers[i] === q.correct,
                  ).length;
                  const pct = Math.round((correct / subs.length) * 100);
                  const col =
                    pct >= 70
                      ? "var(--green)"
                      : pct >= 40
                        ? "var(--amber)"
                        : "var(--red)";
                  return (
                    <div
                      key={i}
                      style={{
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 4,
                        height: "100%",
                        justifyContent: "flex-end",
                      }}
                      title={q.text}
                    >
                      <span
                        style={{ fontSize: 10, fontWeight: 700, color: col }}
                      >
                        {pct}%
                      </span>
                      <div
                        style={{
                          width: "100%",
                          height: `${pct}%`,
                          background: col,
                          borderRadius: "4px 4px 0 0",
                          minHeight: 3,
                        }}
                      />
                      <span style={{ fontSize: 10, color: "var(--text3)" }}>
                        Q{i + 1}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="tabs" style={{ maxWidth: 400 }}>
            <button
              className={`tab ${tab === "submissions" ? "on" : ""}`}
              onClick={() => setTab("submissions")}
            >
              Submissions ({subs.length})
            </button>
            <button
              className={`tab ${tab === "rankings" ? "on" : ""}`}
              onClick={() => setTab("rankings")}
            >
              Rankings
            </button>
          </div>

          {tab === "submissions" && (
            <>
              {subs.length === 0 ? (
                <div className="empty">
                  <div className="empty-ico">
                    <ClipboardCheck size={32} />
                  </div>
                  <h3>No submissions yet</h3>
                </div>
              ) : (
                subs.map((s) => (
                  <StudentResult key={s.id} sub={s} exam={exam} />
                ))
              )}
              <PendingList exam={exam} subs={subs} />
            </>
          )}

          {tab === "rankings" &&
            (subs.length === 0 ? (
              <div className="empty">
                <div className="empty-ico">
                  <Trophy size={32} />
                </div>
                <h3>No submissions yet</h3>
                <p>Rankings will appear once students submit</p>
              </div>
            ) : (
              <Rankings exam={exam} subs={subs} />
            ))}
        </>
      )}
    </>
  );
}
