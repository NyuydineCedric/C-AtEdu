import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import initialDb from "../data/db.json";

const AppCtx = createContext(null);
export const useApp = () => useContext(AppCtx);

const DB_KEY = "catedu_db";
const USER_KEY = "catedu_user";
const PAGE_KEY = "catedu_page";

function loadDb() {
  try {
    const saved = localStorage.getItem(DB_KEY);
    if (saved) return JSON.parse(saved);
  } catch {}
  return JSON.parse(JSON.stringify(initialDb));
}

function saveDb(db) {
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(db));
  } catch {}
}

// User session is stored in sessionStorage (per-tab) so each tab has independent login
function loadUser() {
  try {
    return JSON.parse(sessionStorage.getItem(USER_KEY));
  } catch {
    return null;
  }
}

function saveUser(u) {
  try {
    if (u) sessionStorage.setItem(USER_KEY, JSON.stringify(u));
    else sessionStorage.removeItem(USER_KEY);
  } catch {}
}

export function AppProvider({ children }) {
  const [db, setDbState] = useState(() => loadDb());
  const [user, setUserState] = useState(() => loadUser());
  const [toasts, setToasts] = useState([]);
  const dbRef = useRef(db);

  // Keep dbRef in sync
  useEffect(() => {
    dbRef.current = db;
  }, [db]);

  // Sync DB changes across tabs (localStorage) but NOT user session (sessionStorage = per-tab)
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === DB_KEY && e.newValue) {
        try {
          const fresh = JSON.parse(e.newValue);
          setDbState(fresh);
          // Refresh THIS tab's user data from updated db (profile changes etc)
          const thisTabUser = loadUser();
          if (thisTabUser) {
            const refreshed = refreshUserFromDb(thisTabUser, fresh);
            if (refreshed) {
              setUserState(refreshed);
              saveUser(refreshed);
            }
          }
        } catch {}
      }
      // NOTE: USER_KEY is in sessionStorage — NOT synced across tabs by design
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  function refreshUserFromDb(u, freshDb) {
    if (!u) return null;
    if (u.role === "teacher") {
      const t = freshDb.teachers.find((t) => t.id === u.id);
      return t ? { role: "teacher", ...t } : u;
    } else {
      const s = freshDb.students.find((s) => s.id === u.id);
      return s ? { role: "student", ...s } : u;
    }
  }

  const setDb = useCallback((updater) => {
    setDbState((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      saveDb(next);
      // Refresh logged-in user's data from new db
      const currentUser = loadUser();
      if (currentUser) {
        const refreshed = refreshUserFromDb(currentUser, next);
        if (refreshed) {
          setUserState(refreshed);
          saveUser(refreshed);
        }
      }
      return next;
    });
  }, []);

  const setUser = useCallback((u) => {
    setUserState(u);
    saveUser(u);
  }, []);

  const toast = useCallback((msg, type = "ok") => {
    const id = Date.now();
    setToasts((t) => [...t, { id, msg, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3600);
  }, []);

  // ── Auth ──────────────────────────────────────────────────────────────
  const loginTeacher = (email, password) => {
    const db = loadDb();
    const t = db.teachers.find(
      (t) =>
        t.email.toLowerCase() === email.toLowerCase() &&
        t.password === password,
    );
    if (!t) return "Invalid email or password";
    setUser({ role: "teacher", ...t });
    return null;
  };

  const loginStudent = (email, matricule, password) => {
    const db = loadDb();
    const s = db.students.find(
      (s) =>
        s.email.toLowerCase() === email.toLowerCase() &&
        s.matricule === matricule.trim() &&
        s.password === password,
    );
    if (!s) return "Email, matricule or password is incorrect";
    setUser({ role: "student", ...s });
    return null;
  };

  const registerTeacher = (data) => {
    const db = loadDb();
    if (
      db.teachers.find(
        (t) => t.email.toLowerCase() === data.email.toLowerCase(),
      )
    )
      return "An account with this email already exists";
    const newTeacher = {
      id: "T" + Date.now(),
      name: data.name,
      email: data.email,
      matricule: data.matricule || "",
      phone: data.phone || "",
      password: data.password,
      institution: data.institution || "",
      department: data.department || "",
      subject: data.subject || "",
      avatar: data.name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase(),
      courses: data.assignedCourseId ? [data.assignedCourseId] : [],
      notifications: [],
    };
    let newDb = { ...db, teachers: [...db.teachers, newTeacher] };
    // If teacher selected a course, mark them as its owner
    if (data.assignedCourseId) {
      newDb = {
        ...newDb,
        courses: newDb.courses.map((c) =>
          c.id === data.assignedCourseId
            ? { ...c, teacherId: newTeacher.id }
            : c,
        ),
      };
    }
    setDb(() => newDb);
    setUser({ role: "teacher", ...newTeacher });
    toast("Welcome to C-AtEdu, " + data.name.split(" ")[0] + "!", "ok");
    return null;
  };

  const registerStudent = (data) => {
    const db = loadDb();
    if (db.students.find((s) => s.matricule === data.matricule.trim()))
      return "This matricule is already registered";
    if (
      db.students.find(
        (s) => s.email?.toLowerCase() === data.email?.toLowerCase(),
      )
    )
      return "An account with this email already exists";
    const newStudent = {
      id: "S" + Date.now(),
      name: data.name,
      email: data.email,
      phone: data.phone,
      password: data.password,
      matricule: data.matricule.trim(),
      level: data.level,
      department: data.department,
      institution: data.institution,
      enrolledCourses: data.enrolledCourses || [],
    };
    // Auto-enroll notifications for each course chosen
    let newDb = { ...db, students: [...db.students, newStudent] };
    for (const courseId of data.enrolledCourses || []) {
      const course = newDb.courses.find((c) => c.id === courseId);
      if (!course) continue;
      const notif = {
        id: "N" + Date.now() + courseId,
        type: "enrollment",
        message: `${newStudent.name} enrolled in ${course.subject}: ${course.title}`,
        studentId: newStudent.id,
        courseId,
        read: false,
        date: new Date().toISOString(),
      };
      newDb = {
        ...newDb,
        courses: newDb.courses.map((c) =>
          c.id === courseId
            ? { ...c, enrolledStudents: [...c.enrolledStudents, newStudent.id] }
            : c,
        ),
        teachers: newDb.teachers.map((t) =>
          t.id === course.teacherId
            ? { ...t, notifications: [...t.notifications, notif] }
            : t,
        ),
      };
    }
    setDb(() => newDb);
    setUser({ role: "student", ...newStudent });
    toast("Welcome to C-AtEdu, " + data.name.split(" ")[0] + "!", "ok");
    return null;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(PAGE_KEY);
  };

  // ── Courses ───────────────────────────────────────────────────────────
  const getAllCourses = () => db.courses;
  const getMyCourses = () => db.courses.filter((c) => c.teacherId === user?.id);

  const createCourse = (data) => {
    const code =
      data.subject.slice(0, 3).toUpperCase() +
      Math.floor(100 + Math.random() * 900);
    const course = {
      id: "C" + Date.now(),
      teacherId: user.id,
      ...data,
      code,
      enrolledStudents: [],
    };
    setDb((d) => ({
      ...d,
      courses: [...d.courses, course],
      teachers: d.teachers.map((t) =>
        t.id === user.id
          ? { ...t, courses: [...(t.courses || []), course.id] }
          : t,
      ),
    }));
    toast(`Course "${data.title}" created`, "ok");
    return course.id;
  };

  const deleteCourse = (id) => {
    setDb((d) => ({
      ...d,
      courses: d.courses.filter((c) => c.id !== id),
      exams: d.exams.filter((e) => e.courseId !== id),
      teachers: d.teachers.map((t) =>
        t.id === user.id
          ? { ...t, courses: (t.courses || []).filter((c) => c !== id) }
          : t,
      ),
      students: d.students.map((s) => ({
        ...s,
        enrolledCourses: (s.enrolledCourses || []).filter((cid) => cid !== id),
      })),
    }));
    toast("Course deleted", "info");
  };

  // ── Enrollment ────────────────────────────────────────────────────────
  const enrollInCourse = (courseId) => {
    const freshDb = loadDb();
    const course = freshDb.courses.find((c) => c.id === courseId);
    if (!course) return "Course not found";
    if (course.enrolledStudents.includes(user.id)) return "Already enrolled";
    const notif = {
      id: "N" + Date.now(),
      type: "enrollment",
      message: `${user.name} enrolled in ${course.subject}: ${course.title}`,
      studentId: user.id,
      courseId,
      read: false,
      date: new Date().toISOString(),
    };
    setDb((d) => ({
      ...d,
      courses: d.courses.map((c) =>
        c.id === courseId
          ? { ...c, enrolledStudents: [...c.enrolledStudents, user.id] }
          : c,
      ),
      students: d.students.map((s) =>
        s.id === user.id
          ? { ...s, enrolledCourses: [...(s.enrolledCourses || []), courseId] }
          : s,
      ),
      teachers: d.teachers.map((t) =>
        t.id === course.teacherId
          ? { ...t, notifications: [...t.notifications, notif] }
          : t,
      ),
    }));
    toast(`Enrolled in ${course.title}!`, "ok");
    return null;
  };

  const unenrollFromCourse = (courseId) => {
    setDb((d) => ({
      ...d,
      courses: d.courses.map((c) =>
        c.id === courseId
          ? {
              ...c,
              enrolledStudents: c.enrolledStudents.filter(
                (id) => id !== user.id,
              ),
            }
          : c,
      ),
      students: d.students.map((s) =>
        s.id === user.id
          ? {
              ...s,
              enrolledCourses: (s.enrolledCourses || []).filter(
                (id) => id !== courseId,
              ),
            }
          : s,
      ),
    }));
    toast("Unenrolled from course", "info");
  };

  const addStudentToCourse = (courseId, studentId) => {
    const freshDb = loadDb();
    const course = freshDb.courses.find((c) => c.id === courseId);
    const student = freshDb.students.find((s) => s.id === studentId);
    if (!course || !student) return "Not found";
    if (course.enrolledStudents.includes(studentId))
      return "Student already enrolled";
    const notif = {
      id: "N" + Date.now(),
      type: "enrollment",
      message: `${student.name} was added to ${course.subject}: ${course.title}`,
      studentId,
      courseId,
      read: false,
      date: new Date().toISOString(),
    };
    setDb((d) => ({
      ...d,
      courses: d.courses.map((c) =>
        c.id === courseId
          ? { ...c, enrolledStudents: [...c.enrolledStudents, studentId] }
          : c,
      ),
      students: d.students.map((s) =>
        s.id === studentId
          ? { ...s, enrolledCourses: [...(s.enrolledCourses || []), courseId] }
          : s,
      ),
      teachers: d.teachers.map((t) =>
        t.id === user.id
          ? { ...t, notifications: [...t.notifications, notif] }
          : t,
      ),
    }));
    toast(`${student.name} added to ${course.title}`, "ok");
    return null;
  };

  const removeStudentFromCourse = (courseId, studentId) => {
    const freshDb = loadDb();
    const student = freshDb.students.find((s) => s.id === studentId);
    setDb((d) => ({
      ...d,
      courses: d.courses.map((c) =>
        c.id === courseId
          ? {
              ...c,
              enrolledStudents: c.enrolledStudents.filter(
                (id) => id !== studentId,
              ),
            }
          : c,
      ),
      students: d.students.map((s) =>
        s.id === studentId
          ? {
              ...s,
              enrolledCourses: (s.enrolledCourses || []).filter(
                (id) => id !== courseId,
              ),
            }
          : s,
      ),
    }));
    toast(`${student?.name || "Student"} removed from course`, "info");
  };

  const deleteStudent = (studentId) => {
    setDb((d) => ({
      ...d,
      students: d.students.filter((s) => s.id !== studentId),
      courses: d.courses.map((c) => ({
        ...c,
        enrolledStudents: c.enrolledStudents.filter((id) => id !== studentId),
      })),
      submissions: d.submissions.filter((s) => s.studentId !== studentId),
    }));
    toast("Student deleted", "info");
  };

  // ── Notifications ──────────────────────────────────────────────────────
  const getMyNotifications = () => {
    const t = db.teachers.find((t) => t.id === user?.id);
    return t?.notifications || [];
  };

  const markNotificationRead = (notifId) => {
    setDb((d) => ({
      ...d,
      teachers: d.teachers.map((t) =>
        t.id === user.id
          ? {
              ...t,
              notifications: t.notifications.map((n) =>
                n.id === notifId ? { ...n, read: true } : n,
              ),
            }
          : t,
      ),
    }));
  };

  const markAllNotificationsRead = () => {
    setDb((d) => ({
      ...d,
      teachers: d.teachers.map((t) =>
        t.id === user.id
          ? {
              ...t,
              notifications: t.notifications.map((n) => ({ ...n, read: true })),
            }
          : t,
      ),
    }));
  };

  // ── Exams ──────────────────────────────────────────────────────────────
  const getMyExams = () => db.exams.filter((e) => e.teacherId === user?.id);

  const createExam = (exam) => {
    const newExam = {
      ...exam,
      id: "E" + Date.now(),
      teacherId: user.id,
      createdAt: new Date().toISOString().slice(0, 10),
      status: "draft",
    };
    setDb((d) => ({ ...d, exams: [...d.exams, newExam] }));
    toast(`"${exam.title}" saved as draft`, "ok");
    return newExam.id;
  };

  const updateExam = (id, patch) => {
    setDb((d) => ({
      ...d,
      exams: d.exams.map((e) => (e.id === id ? { ...e, ...patch } : e)),
    }));
    toast("Exam updated", "ok");
  };

  const deleteExam = (id) => {
    setDb((d) => ({
      ...d,
      exams: d.exams.filter((e) => e.id !== id),
      submissions: d.submissions.filter((s) => s.examId !== id),
    }));
    toast("Exam deleted", "info");
  };

  const publishExam = (id) => {
    setDb((d) => ({
      ...d,
      exams: d.exams.map((e) =>
        e.id === id ? { ...e, status: "published" } : e,
      ),
    }));
    toast("Exam published — enrolled students can now see it", "ok");
  };

  const getExamById = (id) => db.exams.find((e) => e.id === id);

  const getExamSubmissions = (examId) =>
    db.submissions
      .filter((s) => s.examId === examId)
      .map((s) => ({
        ...s,
        student: db.students.find((st) => st.id === s.studentId),
      }));

  const getAllStudents = () => db.students;

  // ── Student exam access ───────────────────────────────────────────────
  const getMyAssignedExams = () => {
    const enrolled = user?.enrolledCourses || [];
    return db.exams.filter(
      (e) => e.status === "published" && enrolled.includes(e.courseId),
    );
  };

  const getMySubmission = (examId) =>
    db.submissions.find(
      (s) => s.examId === examId && s.studentId === user?.id,
    ) || null;

  const submitExam = (examId, answers) => {
    const exam = db.exams.find((e) => e.id === examId);
    if (!exam) return;
    const score = answers.reduce(
      (acc, ans, i) => acc + (ans === exam.questions[i].correct ? 1 : 0),
      0,
    );
    const sub = {
      id: "SUB" + Date.now(),
      examId,
      studentId: user.id,
      answers,
      score,
      total: exam.questions.length,
      submittedAt: new Date().toISOString(),
    };
    setDb((d) => ({ ...d, submissions: [...d.submissions, sub] }));
    toast(`Submitted! You scored ${score}/${exam.questions.length}`, "ok");
    return sub;
  };

  // ── Rankings ──────────────────────────────────────────────────────────
  const getExamRankings = (examId) => {
    const subs = db.submissions.filter((s) => s.examId === examId);
    return subs
      .map((s) => ({
        ...s,
        student: db.students.find((st) => st.id === s.studentId),
        pct: Math.round((s.score / s.total) * 100),
      }))
      .sort((a, b) => b.pct - a.pct)
      .map((s, i) => ({ ...s, rank: i + 1 }));
  };

  const getCourseRankings = (courseId) => {
    const courseExams = db.exams.filter((e) => e.courseId === courseId);
    const studentMap = {};
    for (const exam of courseExams) {
      const subs = db.submissions.filter((s) => s.examId === exam.id);
      for (const sub of subs) {
        if (!studentMap[sub.studentId]) {
          studentMap[sub.studentId] = {
            studentId: sub.studentId,
            scores: [],
            total: 0,
            count: 0,
          };
        }
        const pct = Math.round((sub.score / sub.total) * 100);
        studentMap[sub.studentId].scores.push(pct);
        studentMap[sub.studentId].total += pct;
        studentMap[sub.studentId].count++;
      }
    }
    return Object.values(studentMap)
      .map((s) => ({
        ...s,
        student: db.students.find((st) => st.id === s.studentId),
        avg: Math.round(s.total / s.count),
      }))
      .sort((a, b) => b.avg - a.avg)
      .map((s, i) => ({ ...s, rank: i + 1 }));
  };

  return (
    <AppCtx.Provider
      value={{
        db,
        user,
        toasts,
        toast,
        loginTeacher,
        loginStudent,
        registerTeacher,
        registerStudent,
        logout,
        getAllCourses,
        getMyCourses,
        createCourse,
        deleteCourse,
        enrollInCourse,
        unenrollFromCourse,
        addStudentToCourse,
        removeStudentFromCourse,
        deleteStudent,
        getMyNotifications,
        markNotificationRead,
        markAllNotificationsRead,
        getMyExams,
        createExam,
        updateExam,
        deleteExam,
        publishExam,
        getExamById,
        getExamSubmissions,
        getAllStudents,
        getMyAssignedExams,
        getMySubmission,
        submitExam,
        getExamRankings,
        getCourseRankings,
      }}
    >
      {children}
    </AppCtx.Provider>
  );
}
