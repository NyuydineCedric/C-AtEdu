import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  BarChart3,
  LogOut,
  Bell,
  GraduationCap,
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import TeacherDashboard from "./TeacherDashboard";
import TeacherExams from "./TeacherExams";
import TeacherStudents from "./TeacherStudents";
import TeacherResults from "./TeacherResults";
import TeacherCourses from "./TeacherCourses";
import NotificationPanel from "./NotificationPanel";

const NAV = [
  { id: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { id: "courses", icon: GraduationCap, label: "Courses" },
  { id: "exams", icon: BookOpen, label: "Exams" },
  { id: "students", icon: Users, label: "Students" },
  { id: "results", icon: BarChart3, label: "Results" },
];

const PAGE_KEY = "catedu_teacher_page";

export default function TeacherShell() {
  const { user, logout, getMyNotifications } = useApp();
  const [page, setPage] = useState(
    () => localStorage.getItem(PAGE_KEY) || "dashboard",
  );
  const [examContext, setExamContext] = useState(null);
  const [showNotifs, setShowNotifs] = useState(false);
  const notifs = getMyNotifications();
  const unread = notifs.filter((n) => !n.read).length;

  const navigate = (p, ctx = null) => {
    setExamContext(ctx);
    setPage(p);
    localStorage.setItem(PAGE_KEY, p);
    setShowNotifs(false);
  };

  // Keep page in sync with localStorage on popstate (browser back)
  useEffect(() => {
    const saved = localStorage.getItem(PAGE_KEY);
    if (saved && saved !== page) setPage(saved);
  }, []);

  const renderPage = () => {
    switch (page) {
      case "dashboard":
        return <TeacherDashboard onNavigate={navigate} />;
      case "courses":
        return <TeacherCourses onNavigate={navigate} />;
      case "exams":
        return <TeacherExams onNavigate={navigate} />;
      case "students":
        return <TeacherStudents onNavigate={navigate} />;
      case "results":
        return <TeacherResults examId={examContext} />;
      default:
        return <TeacherDashboard onNavigate={navigate} />;
    }
  };

  return (
    <div className="shell">
      <aside className="sidebar">
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
              className={`nav-btn ${page === id ? "on" : ""}`}
              onClick={() => navigate(id)}
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
          <div className="s-ava" title={user.name}>
            {user.avatar}
          </div>
        </div>
      </aside>

      <div className="main">
        <header className="topbar">
          <div className="brand">
            C<span>-At</span>Edu
          </div>
          <span className="role-pill teacher">Teacher</span>
          <div style={{ flex: 1 }} />
          <div
            style={{
              display: "flex",
              gap: 8,
              alignItems: "center",
              position: "relative",
            }}
          >
            <button
              className="icon-btn"
              style={{ position: "relative" }}
              onClick={() => setShowNotifs((v) => !v)}
            >
              <Bell size={15} />
              {unread > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: -4,
                    right: -4,
                    width: 16,
                    height: 16,
                    borderRadius: "50%",
                    background: "var(--red)",
                    color: "white",
                    fontSize: 9,
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {unread > 9 ? "9+" : unread}
                </span>
              )}
            </button>
            {showNotifs && (
              <NotificationPanel onClose={() => setShowNotifs(false)} />
            )}
            <div style={{ textAlign: "right", marginRight: 6 }}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{user.name}</div>
              <div style={{ fontSize: 11, color: "var(--text2)" }}>
                {user.subject} · {user.department}
              </div>
            </div>
            <div className="ava-top">{user.avatar}</div>
          </div>
        </header>
        <main className="page">{renderPage()}</main>
      </div>
    </div>
  );
}
