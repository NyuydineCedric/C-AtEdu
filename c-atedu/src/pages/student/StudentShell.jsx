import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  BookOpen,
  CheckSquare,
  GraduationCap,
  LogOut,
  BarChart3,
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import StudentDashboard from "./StudentDashboard";
import StudentExams from "./StudentExams";
import TakeExam from "./TakeExam";
import StudentResults from "./StudentResults";
import StudentCourses from "./StudentCourses";
import StudentRankings from "./StudentRankings";

const NAV = [
  { id: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { id: "courses", icon: GraduationCap, label: "My Courses" },
  { id: "exams", icon: BookOpen, label: "My Exams" },
  { id: "results", icon: CheckSquare, label: "My Results" },
  { id: "rankings", icon: BarChart3, label: "Rankings" },
];

const PAGE_KEY = "catedu_student_page";

export default function StudentShell() {
  const { user, logout } = useApp();
  const [page, setPage] = useState(() => {
    const saved = localStorage.getItem(PAGE_KEY);
    return saved && saved !== "take" ? saved : "dashboard";
  });
  const [activeExamId, setActiveExamId] = useState(null);

  useEffect(() => {
    if (page !== "take") localStorage.setItem(PAGE_KEY, page);
  }, [page]);

  const startExam = (examId) => {
    setActiveExamId(examId);
    setPage("take");
  };
  const finishExam = () => {
    setActiveExamId(null);
    setPage("results");
  };
  const navigate = (p) => setPage(p);

  const initials = user.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2);

  const renderPage = () => {
    switch (page) {
      case "dashboard":
        return <StudentDashboard onNavigate={navigate} onStart={startExam} />;
      case "courses":
        return <StudentCourses />;
      case "exams":
        return <StudentExams onStart={startExam} />;
      case "take":
        return activeExamId ? (
          <TakeExam
            examId={activeExamId}
            onFinish={finishExam}
            onCancel={() => setPage("exams")}
          />
        ) : null;
      case "results":
        return <StudentResults />;
      case "rankings":
        return <StudentRankings />;
      default:
        return <StudentDashboard onNavigate={navigate} onStart={startExam} />;
    }
  };

  return (
    <div className="shell">
      <aside className="sidebar student-mode">
        <div className="s-logo">
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
        </div>
        <nav className="s-nav">
          {NAV.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              className={`nav-btn ${page === id || (page === "take" && id === "exams") ? "on" : ""}`}
              onClick={() => page !== "take" && navigate(id)}
              data-tip={label}
            >
              <Icon size={20} />
            </button>
          ))}
        </nav>
        <div
          style={{
            padding: "0 9px",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          <button
            className="nav-btn"
            onClick={logout}
            data-tip="Sign out"
            style={{ color: "#EF476F" }}
          >
            <LogOut size={18} />
          </button>
          <div
            className="s-ava"
            style={{ background: "linear-gradient(135deg,#1D9E75,#06D6A0)" }}
            title={user.name}
          >
            {initials}
          </div>
        </div>
      </aside>
      <div className="main">
        <header className="topbar">
          <div className="brand student">
            C<span>-At</span>Edu
          </div>
          <span className="role-pill student">Student</span>
          <div style={{ flex: 1 }} />
          <div style={{ textAlign: "right", marginRight: 8 }}>
            <div style={{ fontSize: 13, fontWeight: 600 }}>{user.name}</div>
            <div style={{ fontSize: 11, color: "var(--text2)" }}>
              {user.matricule} · {user.level}
            </div>
          </div>
          <div className="ava-top student">{initials}</div>
        </header>
        <main className="page">{renderPage()}</main>
      </div>
    </div>
  );
}
