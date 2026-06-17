import { useState } from "react";
import { Trophy, GraduationCap } from "lucide-react";
import { useApp } from "../../context/AppContext";

function getGrade(p) {
  return p >= 90 ? "A" : p >= 80 ? "B" : p >= 70 ? "C" : p >= 60 ? "D" : "F";
}
function getColor(p) {
  return p >= 80 ? "var(--green)" : p >= 60 ? "var(--purple)" : "var(--red)";
}

const MEDAL_BG = ["#FFD700", "#C0C0C0", "#CD7F32"];

export default function StudentRankings() {
  const { user, getMyAssignedExams, getExamRankings, getCourseRankings, db } =
    useApp();
  const exams = getMyAssignedExams();
  const enrolled = user.enrolledCourses || [];
  const enrolledCourses = db.courses.filter((c) => enrolled.includes(c.id));
  const [tab, setTab] = useState("exam");
  const [selectedExam, setSelectedExam] = useState(exams[0]?.id || "");
  const [selectedCourse, setSelectedCourse] = useState(
    enrolledCourses[0]?.id || "",
  );

  const examRankings = selectedExam ? getExamRankings(selectedExam) : [];
  const courseRankings = selectedCourse
    ? getCourseRankings(selectedCourse)
    : [];

  const myExamRank = examRankings.find((r) => r.studentId === user.id);
  const myCourseRank = courseRankings.find((r) => r.studentId === user.id);

  const RankCard = ({ rankings, myRank }) => (
    <div>
      {myRank && (
        <div
          style={{
            background: `${getColor(myRank.pct || myRank.avg)}18`,
            border: `1.5px solid ${getColor(myRank.pct || myRank.avg)}`,
            borderRadius: 12,
            padding: "14px 18px",
            marginBottom: 18,
            display: "flex",
            alignItems: "center",
            gap: 14,
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 11,
              background:
                myRank.rank <= 3 ? MEDAL_BG[myRank.rank - 1] : "var(--purple)",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "var(--fd)",
              fontWeight: 800,
              fontSize: 18,
            }}
          >
            {myRank.rank}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 14 }}>Your Position</div>
            <div style={{ fontSize: 12, color: "var(--text2)" }}>
              Rank {myRank.rank} of {rankings.length} students
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div
              style={{
                fontFamily: "var(--fd)",
                fontWeight: 800,
                fontSize: 20,
                color: getColor(myRank.pct || myRank.avg),
              }}
            >
              {myRank.pct || myRank.avg}%
            </div>
            <span
              className={`gb g${getGrade(myRank.pct || myRank.avg)}`}
              style={{ width: 26, height: 26, fontSize: 13, borderRadius: 7 }}
            >
              {getGrade(myRank.pct || myRank.avg)}
            </span>
          </div>
        </div>
      )}

      {rankings.length === 0 ? (
        <div className="empty">
          <div className="empty-ico">
            <Trophy size={28} />
          </div>
          <h3>No results yet</h3>
          <p>Rankings appear after students submit</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {rankings.map((r, i) => {
            const pct = r.pct ?? r.avg;
            const isMe = r.studentId === user.id;
            const col = getColor(pct);
            return (
              <div
                key={r.studentId}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "12px 16px",
                  background: isMe
                    ? `${col}12`
                    : i < 3
                      ? `${getColor(pct)}08`
                      : "var(--bg)",
                  borderRadius: 10,
                  border: `1.5px solid ${isMe ? col : i < 3 ? getColor(pct) : "var(--border)"}`,
                }}
              >
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 9,
                    background: i < 3 ? MEDAL_BG[i] : "var(--border)",
                    color: i < 3 ? "white" : "var(--text2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "var(--fd)",
                    fontWeight: 800,
                    fontSize: 15,
                    flexShrink: 0,
                  }}
                >
                  {r.rank}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>
                    {r.student?.name || "Unknown"}
                    {isMe && (
                      <span
                        style={{
                          marginLeft: 8,
                          fontSize: 11,
                          fontWeight: 700,
                          color: col,
                        }}
                      >
                        (You)
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text2)" }}>
                    {r.student?.matricule} · {r.student?.department}
                  </div>
                </div>
                {r.count > 0 && (
                  <div style={{ fontSize: 12, color: "var(--text2)" }}>
                    {r.count} exam{r.count !== 1 ? "s" : ""}
                  </div>
                )}
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
                  {r.score !== undefined && (
                    <div style={{ fontSize: 11, color: "var(--text2)" }}>
                      {r.score}/{r.total}
                    </div>
                  )}
                </div>
                <span
                  className={`gb g${getGrade(pct)}`}
                  style={{
                    width: 28,
                    height: 28,
                    fontSize: 13,
                    borderRadius: 8,
                  }}
                >
                  {getGrade(pct)}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  return (
    <>
      <div className="ph">
        <h1>Rankings</h1>
        <p>See how you compare with classmates</p>
      </div>

      <div className="tabs" style={{ maxWidth: 360 }}>
        <button
          className={`tab ${tab === "exam" ? "on" : ""}`}
          onClick={() => setTab("exam")}
        >
          By Exam
        </button>
        <button
          className={`tab ${tab === "course" ? "on" : ""}`}
          onClick={() => setTab("course")}
        >
          By Course
        </button>
      </div>

      {tab === "exam" && (
        <>
          <div className="fl" style={{ maxWidth: 400, marginBottom: 20 }}>
            <label className="lbl">Select Exam</label>
            {exams.length === 0 ? (
              <div
                style={{
                  fontSize: 13,
                  color: "var(--text3)",
                  padding: "10px 0",
                }}
              >
                No exams available
              </div>
            ) : (
              <select
                className="sel"
                value={selectedExam}
                onChange={(e) => setSelectedExam(e.target.value)}
              >
                {exams.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.title}
                  </option>
                ))}
              </select>
            )}
          </div>
          {selectedExam && (
            <RankCard rankings={examRankings} myRank={myExamRank} />
          )}
        </>
      )}

      {tab === "course" && (
        <>
          <div className="fl" style={{ maxWidth: 400, marginBottom: 20 }}>
            <label className="lbl">Select Course</label>
            {enrolledCourses.length === 0 ? (
              <div
                style={{
                  fontSize: 13,
                  color: "var(--text3)",
                  padding: "10px 0",
                }}
              >
                Not enrolled in any courses
              </div>
            ) : (
              <select
                className="sel"
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
              >
                {enrolledCourses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title} ({c.code})
                  </option>
                ))}
              </select>
            )}
          </div>
          {selectedCourse && (
            <RankCard rankings={courseRankings} myRank={myCourseRank} />
          )}
        </>
      )}
    </>
  );
}
