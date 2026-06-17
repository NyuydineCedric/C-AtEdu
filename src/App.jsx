import { useApp } from "./context/AppContext";
import LoginPage from "./pages/LoginPage";
import TeacherShell from "./pages/teacher/TeacherShell";
import StudentShell from "./pages/student/StudentShell";
import Toast from "./components/Toast";

export default function App() {
  const { user, toasts } = useApp();
  return (
    <>
      {!user && <LoginPage />}
      {user?.role === "teacher" && <TeacherShell />}
      {user?.role === "student" && <StudentShell />}
      <Toast toasts={toasts} />
    </>
  );
}
