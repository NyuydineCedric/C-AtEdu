import { useState } from "react";
import { useApp } from "../context/AppContext";
import { ArrowLeft, Eye, EyeOff, UserPlus, Check } from "lucide-react";
import logo from "../assets/logo.jpg";

export default function RegisterPage({ initialRole = "student", onBack }) {
  const { registerStudent, registerTeacher, getAllCourses } = useApp();
  const allCourses = getAllCourses();

  const [role, setRole] = useState(initialRole);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [showPw2, setShowPw2] = useState(false);

  // Student fields
  const [sName, setSName] = useState("");
  const [sEmail, setSEmail] = useState("");
  const [sMatricule, setSMatricule] = useState("");
  const [sPassword, setSPassword] = useState("");
  const [sPassword2, setSPassword2] = useState("");

  // Teacher fields
  const [tName, setTName] = useState("");
  const [tEmail, setTEmail] = useState("");
  const [tMatricule, setTMatricule] = useState("");
  const [tCourseId, setTCourseId] = useState(allCourses[0]?.id || "");
  const [tPassword, setTPassword] = useState("");
  const [tPassword2, setTPassword2] = useState("");

  const switchRole = (r) => {
    setRole(r);
    setErr("");
  };

  const submitStudent = (e) => {
    e.preventDefault();
    if (!sName.trim()) return setErr("Name is required");
    if (!sEmail.trim() || !sEmail.includes("@"))
      return setErr("Valid email is required");
    if (!sMatricule.trim()) return setErr("Matricule is required");
    if (!sPassword) return setErr("Password is required");
    if (sPassword.length < 6)
      return setErr("Password must be at least 6 characters");
    if (sPassword !== sPassword2) return setErr("Passwords do not match");
    setErr("");
    setLoading(true);
    setTimeout(() => {
      const error = registerStudent({
        name: sName,
        email: sEmail,
        matricule: sMatricule,
        password: sPassword,
        phone: "",
        institution: "",
        level: "",
        department: "",
        enrolledCourses: [],
      });
      if (error) {
        setErr(error);
        setLoading(false);
      }
    }, 500);
  };

  const submitTeacher = (e) => {
    e.preventDefault();
    if (!tName.trim()) return setErr("Name is required");
    if (!tEmail.trim() || !tEmail.includes("@"))
      return setErr("Valid email is required");
    if (!tMatricule.trim()) return setErr("Staff ID / Matricule is required");
    if (!tPassword) return setErr("Password is required");
    if (tPassword.length < 6)
      return setErr("Password must be at least 6 characters");
    if (tPassword !== tPassword2) return setErr("Passwords do not match");
    setErr("");
    setLoading(true);
    // Find course details
    const course = allCourses.find((c) => c.id === tCourseId);
    setTimeout(() => {
      const error = registerTeacher({
        name: tName,
        email: tEmail,
        matricule: tMatricule,
        password: tPassword,
        phone: "",
        institution: "",
        department: "",
        subject: course?.subject || "",
        assignedCourseId: tCourseId || null,
      });
      if (error) {
        setErr(error);
        setLoading(false);
      }
    }, 500);
  };

  return (
    <div className="login-page">
      <div className="login-card" style={{ maxWidth: 440 }}>
        <button
          onClick={onBack}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            color: "var(--text2)",
            fontSize: 13,
            marginBottom: 18,
            background: "none",
            border: "none",
            cursor: "pointer",
          }}
        >
          <ArrowLeft size={15} /> Back to login
        </button>

        <div
          className="login-logo"
          style={{
            background: role === "teacher" ? "var(--purple)" : "#1D9E75",
          }}
        ></div>
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
        <div className="login-title">Create Account</div>
        <div className="login-sub">Register as a {role} on C-AtEdu</div>

        <div className="role-toggle" style={{ marginBottom: 24 }}>
          <button
            type="button"
            className={`role-tab ${role === "student" ? "on" : ""}`}
            onClick={() => switchRole("student")}
          >
            Student
          </button>
          <button
            type="button"
            className={`role-tab ${role === "teacher" ? "on" : ""}`}
            onClick={() => switchRole("teacher")}
          >
            Teacher
          </button>
        </div>

        {err && <div className="login-err">{err}</div>}

        {role === "student" ? (
          <form onSubmit={submitStudent}>
            <div className="fl">
              <label className="lbl">Full Name *</label>
              <input
                className="inp"
                placeholder="e.g. Alice Mbah"
                value={sName}
                onChange={(e) => setSName(e.target.value)}
                autoFocus
              />
            </div>
            <div className="fl">
              <label className="lbl">Email Address *</label>
              <input
                className="inp"
                type="email"
                placeholder="your@email.com"
                value={sEmail}
                onChange={(e) => setSEmail(e.target.value)}
              />
            </div>
            <div className="fl">
              <label className="lbl">Matricule Number *</label>
              <input
                className="inp"
                placeholder="e.g. UBa24PB180"
                value={sMatricule}
                onChange={(e) => setSMatricule(e.target.value)}
                spellCheck={false}
              />
            </div>
            <div className="fl">
              <label className="lbl">Password *</label>
              <div style={{ position: "relative" }}>
                <input
                  className="inp"
                  type={showPw ? "text" : "password"}
                  placeholder="Min. 6 characters"
                  value={sPassword}
                  onChange={(e) => setSPassword(e.target.value)}
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
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
            <div className="fl">
              <label className="lbl">Confirm Password *</label>
              <div style={{ position: "relative" }}>
                <input
                  className="inp"
                  type={showPw2 ? "text" : "password"}
                  placeholder="Repeat password"
                  value={sPassword2}
                  onChange={(e) => setSPassword2(e.target.value)}
                  style={{ paddingRight: 40 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPw2((v) => !v)}
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
                  {showPw2 ? <EyeOff size={15} /> : <Eye size={15} />}
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
                background: "#1D9E75",
              }}
              disabled={loading}
            >
              {loading ? <span className="spin" /> : <UserPlus size={15} />}
              {loading ? "Creating account..." : "Register as Student"}
            </button>
          </form>
        ) : (
          <form onSubmit={submitTeacher}>
            <div className="fl">
              <label className="lbl">Full Name *</label>
              <input
                className="inp"
                placeholder="e.g. Dr. Paul Fontem"
                value={tName}
                onChange={(e) => setTName(e.target.value)}
                autoFocus
              />
            </div>
            <div className="fl">
              <label className="lbl">Email Address *</label>
              <input
                className="inp"
                type="email"
                placeholder="your@email.com"
                value={tEmail}
                onChange={(e) => setTEmail(e.target.value)}
              />
            </div>
            <div className="fl">
              <label className="lbl">Staff ID / Matricule *</label>
              <input
                className="inp"
                placeholder="e.g. STAFF2024001"
                value={tMatricule}
                onChange={(e) => setTMatricule(e.target.value)}
                spellCheck={false}
              />
            </div>
            <div className="fl">
              <label className="lbl">Course to Teach</label>
              {allCourses.length === 0 ? (
                <div
                  style={{
                    padding: "10px 14px",
                    background: "var(--bg)",
                    borderRadius: 9,
                    fontSize: 13,
                    color: "var(--text3)",
                  }}
                >
                  No courses exist yet — you can create courses after
                  registering
                </div>
              ) : (
                <select
                  className="sel"
                  value={tCourseId}
                  onChange={(e) => setTCourseId(e.target.value)}
                >
                  <option value="">None / Create my own later </option>
                  {allCourses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title} ({c.code}) — {c.subject}
                    </option>
                  ))}
                </select>
              )}
            </div>
            <div className="fl">
              <label className="lbl">Password *</label>
              <div style={{ position: "relative" }}>
                <input
                  className="inp"
                  type={showPw ? "text" : "password"}
                  placeholder="Min. 6 characters"
                  value={tPassword}
                  onChange={(e) => setTPassword(e.target.value)}
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
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
            <div className="fl">
              <label className="lbl">Confirm Password *</label>
              <div style={{ position: "relative" }}>
                <input
                  className="inp"
                  type={showPw2 ? "text" : "password"}
                  placeholder="Repeat password"
                  value={tPassword2}
                  onChange={(e) => setTPassword2(e.target.value)}
                  style={{ paddingRight: 40 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPw2((v) => !v)}
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
                  {showPw2 ? <EyeOff size={15} /> : <Eye size={15} />}
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
              }}
              disabled={loading}
            >
              {loading ? <span className="spin" /> : <UserPlus size={15} />}
              {loading ? "Creating account..." : "Register as Teacher"}
            </button>
          </form>
        )}

        <div className="login-hint">
          Already have an account?{" "}
          <button
            onClick={onBack}
            style={{
              background: "none",
              border: "none",
              color: "var(--purple)",
              fontWeight: 600,
              cursor: "pointer",
              fontSize: 11,
            }}
          >
            Sign in here
          </button>
        </div>
      </div>
    </div>
  );
}
