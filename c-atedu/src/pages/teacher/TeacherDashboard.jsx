import {
  BookOpen,
  Users,
  CheckSquare,
  TrendingUp,
  ChevronRight,
  Plus,
  GraduationCap,
  Sparkles,
  Bell,
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import ProgressRing from "../../components/ProgressRing";

function getColor(p) {
  return p >= 80 ? "var(--green)" : p >= 60 ? "var(--purple)" : "var(--red)";
}

export default function TeacherDashboard({ onNavigate }) {
  const {
    getMyExams,
    getExamSubmissions,
    getAllStudents,
    getMyCourses,
    getMyNotifications,
    user,
  } = useApp();
  const exams = getMyExams();
  const students = getAllStudents();
  const courses = getMyCourses();
  const notifs = getMyNotifications();
  const unreadNotifs = notifs.filter((n) => !n.read);
  const allSubs = exams.flatMap((e) => getExamSubmissions(e.id));
  const published = exams.filter((e) => e.status === "published").length;
  const avgScore = allSubs.length
    ? Math.round(
        allSubs.reduce((a, s) => a + (s.score / s.total) * 100, 0) /
          allSubs.length,
      )
    : 0;
  const totalEnrolled = courses.reduce(
    (a, c) => a + c.enrolledStudents.length,
    0,
  );

  const recentExams = [...exams]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 4);

  return (
    <>
      <div className="ph">
        <div className="ph-row">
          <div>
            <h1>
              Good{" "}
              {new Date().getHours() < 12
                ? "morning"
                : new Date().getHours() < 17
                  ? "afternoon"
                  : "evening"}
              , {user.name.split(" ")[0]}
            </h1>
            <p>
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn btn-s" onClick={() => onNavigate("exams")}>
              <Sparkles size={14} /> Ask Cedric AI
            </button>
            <button className="btn btn-p" onClick={() => onNavigate("exams")}>
              <Plus size={15} /> New Exam
            </button>
          </div>
        </div>
      </div>

      {/* Unread notifications */}
      {unreadNotifs.length > 0 && (
        <div
          style={{
            background: "var(--purple-l)",
            border: "1px solid var(--purple)",
            borderRadius: 12,
            padding: "12px 16px",
            marginBottom: 20,
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <Bell size={18} color="var(--purple)" />
          <div style={{ flex: 1 }}>
            <span
              style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}
            >
              {unreadNotifs.length} new enrollment
              {unreadNotifs.length !== 1 ? "s" : ""}:{" "}
            </span>
            <span style={{ fontSize: 13, color: "var(--text2)" }}>
              {unreadNotifs
                .slice(0, 2)
                .map((n) => n.message.split(" enrolled")[0])
                .join(", ")}
              {unreadNotifs.length > 2
                ? ` and ${unreadNotifs.length - 2} more`
                : ""}
            </span>
          </div>
          <button
            className="btn btn-s btn-sm"
            onClick={() => onNavigate("courses")}
          >
            View Courses
          </button>
        </div>
      )}

      <div className="stats">
        {[
          {
            lbl: "My Courses",
            val: courses.length,
            sub: `${totalEnrolled} enrolled`,
            bg: "var(--blue-l)",
            c: "var(--blue)",
            Icon: GraduationCap,
          },
          {
            lbl: "My Exams",
            val: exams.length,
            sub: `${published} published`,
            bg: "var(--purple-l)",
            c: "var(--purple)",
            Icon: BookOpen,
          },
          {
            lbl: "Submissions",
            val: allSubs.length,
            sub: "Total received",
            bg: "var(--green-l)",
            c: "#047857",
            Icon: CheckSquare,
          },
          {
            lbl: "Class Average",
            val: avgScore + "%",
            sub: "All exams",
            bg: "var(--amber-l)",
            c: "#92630a",
            Icon: TrendingUp,
          },
        ].map(({ lbl, val, sub, bg, c, Icon }) => (
          <div key={lbl} className="stat">
            <div className="stat-ico" style={{ background: bg }}>
              <Icon size={18} color={c} />
            </div>
            <div className="stat-lbl">{lbl}</div>
            <div className="stat-val" style={{ color: c }}>
              {val}
            </div>
            <div className="stat-sub">{sub}</div>
          </div>
        ))}
      </div>

      <div className="g2-1" style={{ marginBottom: 20 }}>
        <div className="card">
          <div className="ch">
            <div>
              <div className="ct">Recent Exams</div>
              <div className="cs">{exams.length} total</div>
            </div>
            <button
              className="btn btn-s btn-sm"
              onClick={() => onNavigate("exams")}
            >
              View All
            </button>
          </div>
          {recentExams.length === 0 ? (
            <div className="empty" style={{ padding: "24px" }}>
              <div className="empty-ico">
                <BookOpen size={26} />
              </div>
              <h3>No exams yet</h3>
              <button
                className="btn btn-p btn-sm"
                style={{ marginTop: 8 }}
                onClick={() => onNavigate("exams")}
              >
                <Plus size={13} /> Build Exam
              </button>
            </div>
          ) : (
            recentExams.map((ex) => {
              const subs = getExamSubmissions(ex.id);
              const avg = subs.length
                ? Math.round(
                    subs.reduce((a, s) => a + (s.score / s.total) * 100, 0) /
                      subs.length,
                  )
                : null;
              return (
                <div
                  key={ex.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "10px 0",
                    borderBottom: "1px solid var(--bg)",
                  }}
                >
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      background: ex.aiGenerated
                        ? "linear-gradient(135deg,#EEF0FF,#DDD9FF)"
                        : "var(--purple-l)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    {ex.aiGenerated ? (
                      <Sparkles size={16} color="var(--purple)" />
                    ) : (
                      <BookOpen size={16} color="var(--purple)" />
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontWeight: 600,
                        fontSize: 13,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {ex.title}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: "var(--text2)",
                        marginTop: 1,
                      }}
                    >
                      <span
                        className={`exam-status ${ex.status}`}
                        style={{ fontSize: 10 }}
                      >
                        {ex.status}
                      </span>
                      <span style={{ marginLeft: 8 }}>
                        {subs.length} submission{subs.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>
                  {avg !== null && (
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <div
                        style={{
                          fontFamily: "var(--fd)",
                          fontWeight: 800,
                          fontSize: 15,
                        }}
                      >
                        {avg}%
                      </div>
                      <div style={{ fontSize: 10, color: "var(--text3)" }}>
                        avg
                      </div>
                    </div>
                  )}
                  <button
                    className="exam-arrow"
                    style={{
                      width: 28,
                      height: 28,
                      background: "var(--purple-l)",
                      color: "var(--purple)",
                      borderRadius: 8,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                    onClick={() => onNavigate("results", ex.id)}
                  >
                    <ChevronRight size={13} />
                  </button>
                </div>
              );
            })
          )}
        </div>

        <div className="card">
          <div className="ch">
            <div>
              <div className="ct">Score Distribution</div>
              <div className="cs">All submissions</div>
            </div>
          </div>
          {allSubs.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "28px 0",
                color: "var(--text3)",
                fontSize: 13,
              }}
            >
              No submissions yet
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  marginBottom: 12,
                }}
              >
                <ProgressRing
                  pct={avgScore}
                  size={100}
                  stroke={9}
                  color={getColor(avgScore)}
                  label={`${avgScore}%`}
                  sub="Avg"
                />
              </div>
              {["A", "B", "C", "D", "F"].map((g, i) => {
                const ranges = [
                  [90, 100],
                  [80, 89],
                  [70, 79],
                  [60, 69],
                  [0, 59],
                ];
                const count = allSubs.filter((s) => {
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
                      fontSize: 12,
                      padding: "4px 0",
                    }}
                  >
                    <span
                      style={{ width: 16, fontWeight: 700, color: colors[i] }}
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
                          width: allSubs.length
                            ? `${(count / allSubs.length) * 100}%`
                            : "0%",
                          background: colors[i],
                          borderRadius: 3,
                          transition: "width 0.8s",
                        }}
                      />
                    </div>
                    <span
                      style={{
                        color: "var(--text2)",
                        minWidth: 20,
                        textAlign: "right",
                      }}
                    >
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Courses overview */}
      {courses.length > 0 && (
        <div className="card">
          <div className="ch">
            <div>
              <div className="ct">Courses Overview</div>
            </div>
            <button
              className="btn btn-s btn-sm"
              onClick={() => onNavigate("courses")}
            >
              Manage
            </button>
          </div>
          <div className="g3">
            {courses.map((c) => {
              const courseExams = exams.filter((e) => e.courseId === c.id);
              const courseSubs = courseExams.flatMap((e) =>
                getExamSubmissions(e.id),
              );
              const avg = courseSubs.length
                ? Math.round(
                    courseSubs.reduce(
                      (a, s) => a + (s.score / s.total) * 100,
                      0,
                    ) / courseSubs.length,
                  )
                : null;
              return (
                <div
                  key={c.id}
                  style={{
                    background: "var(--bg)",
                    borderRadius: 12,
                    padding: "14px",
                    border: "1px solid var(--border)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      marginBottom: 8,
                    }}
                  >
                    <GraduationCap size={16} color="var(--purple)" />
                    <span style={{ fontWeight: 700, fontSize: 13 }}>
                      {c.title}
                    </span>
                    <span className="badge bdg-b" style={{ fontSize: 10 }}>
                      {c.code}
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: 12,
                    }}
                  >
                    <span style={{ color: "var(--text2)" }}>
                      {c.enrolledStudents.length} students
                    </span>
                    <span style={{ color: "var(--text2)" }}>
                      {courseExams.length} exams
                    </span>
                    {avg !== null && (
                      <span style={{ fontWeight: 700, color: getColor(avg) }}>
                        {avg}%
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}
