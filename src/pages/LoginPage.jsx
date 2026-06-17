import { useState } from "react";
import { useApp } from "../context/AppContext";
import { LogIn, Eye, EyeOff, UserPlus } from "lucide-react";
import RegisterPage from "./RegisterPage";
import logo from "../assets/logo.jpg";

export default function LoginPage() {
  const { loginTeacher, loginStudent } = useApp();
  const [role, setRole] = useState("student");
  const [email, setEmail] = useState("");
  const [matricule, setMatricule] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [regRole, setRegRole] = useState("student");

  if (showRegister)
    return (
      <RegisterPage
        initialRole={regRole}
        onBack={() => setShowRegister(false)}
      />
    );

  const submit = (e) => {
    e.preventDefault();
    setErr("");
    if (!email.trim()) {
      setErr("Email is required");
      return;
    }
    if (!password.trim()) {
      setErr("Password is required");
      return;
    }
    if (role === "student" && !matricule.trim()) {
      setErr("Matricule is required");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      const error =
        role === "teacher"
          ? loginTeacher(email, password)
          : loginStudent(email, matricule, password);
      if (error) setErr(error);
      setLoading(false);
    }, 500);
  };

  return (
    <div className="login-page">
      <div className="login-card">
        {/* Logo */}
        <div
          className="login-logo"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",

            width: "100%",
          }}
        >
          <img
            src={logo}
            alt="logo"
            style={{
              width: "60px",
              height: "60px",
              borderRadius: "50%",
            }}
          />
        </div>
        <div className="login-title">C-AtEdu</div>
        <div className="login-sub">Automated Question Marking Platform</div>

        {/* Role toggle */}
        <div className="role-toggle">
          <button
            type="button"
            className={`role-tab ${role === "student" ? "on" : ""}`}
            onClick={() => {
              setRole("student");
              setErr("");
            }}
          >
            Student
          </button>
          <button
            type="button"
            className={`role-tab ${role === "teacher" ? "on" : ""}`}
            onClick={() => {
              setRole("teacher");
              setErr("");
            }}
          >
            Teacher
          </button>
        </div>

        {err && <div className="login-err">{err}</div>}

        <form onSubmit={submit}>
          <div className="fl">
            <label className="lbl">Email Address</label>
            <input
              className="inp"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoFocus
            />
          </div>

          {role === "student" && (
            <div className="fl">
              <label className="lbl">Matricule Number</label>
              <input
                className="inp"
                placeholder="e.g. UBa24PB180"
                value={matricule}
                onChange={(e) => setMatricule(e.target.value)}
                spellCheck={false}
              />
            </div>
          )}

          <div className="fl">
            <label className="lbl">Password</label>
            <div style={{ position: "relative" }}>
              <input
                className="inp"
                type={showPw ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingRight: 40 }}
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                style={{
                  position: "absolute",
                  right: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--text3)",
                  display: "flex",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-p"
            style={{
              width: "100%",
              justifyContent: "center",
              padding: "12px",
              marginTop: 4,
            }}
            disabled={loading}
          >
            {loading ? <span className="spin" /> : <LogIn size={16} />}
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
          <button
            className="btn btn-s"
            style={{ flex: 1, justifyContent: "center" }}
            onClick={() => {
              setRegRole("student");
              setShowRegister(true);
            }}
          >
            <UserPlus size={14} /> Student Sign Up
          </button>
          <button
            className="btn btn-s"
            style={{ flex: 1, justifyContent: "center" }}
            onClick={() => {
              setRegRole("teacher");
              setShowRegister(true);
            }}
          >
            <UserPlus size={14} /> Teacher Sign Up
          </button>
        </div>
      </div>
    </div>
  );
}
