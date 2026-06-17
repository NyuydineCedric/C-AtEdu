import { useState } from "react";
import {
  Sparkles,
  BookOpen,
  Loader,
  CheckCircle,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

const SUBJECTS = [
  "Biology",
  "Chemistry",
  "Mathematics",
  "Physics",
  "English",
  "History",
  "Geography",
  "Computer Science",
  "Economics",
  "Other",
];
const LEVELS = [
  "100L (Beginner)",
  "200L (Intermediate)",
  "300L (Advanced)",
  "400L (Expert)",
  "Postgraduate",
];
const DIFFICULTIES = ["Easy", "Medium", "Hard", "Mixed"];

const PROXY_URL = "http://localhost:3001/api/generate";

async function callCedric({ topic, subject, level, difficulty, numQuestions }) {
  const prompt = `You are Cedric, an expert academic MCQ exam creator.

Generate EXACTLY ${numQuestions} multiple-choice questions on the topic below.

Topic: ${topic}
Subject: ${subject}
Level: ${level}
Difficulty: ${difficulty}

IMPORTANT: Respond with ONLY a valid JSON object. No markdown, no explanation, no text before or after the JSON.

Format:
{"questions":[{"text":"Full question here?","options":["Option A","Option B","Option C","Option D"],"correct":0,"solution":"2-3 sentence explanation of why the answer is correct."}]}

Rules:
- "correct" is the 0-based index (0=A, 1=B, 2=C, 3=D)
- Exactly 4 options per question
- Make all ${numQuestions} questions — do not stop early
- Vary which option index is correct across questions
- Solutions must be clear and educational`;

  const response = await fetch(PROXY_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || `Server error ${response.status}`);
  }

  const body = await response.json();
  const { text } = body;

  let parsed = null;
  try {
    parsed = typeof text === "string" ? JSON.parse(text) : text;
  } catch {
    const clean = (text || "").replace(/```json|```/gi, "").trim();
    const start = clean.indexOf("{");
    const end = clean.lastIndexOf("}");
    if (start !== -1 && end > start) {
      try {
        parsed = JSON.parse(clean.slice(start, end + 1));
      } catch {}
    }
  }

  if (!parsed?.questions?.length)
    throw new Error("No questions returned. Try a more specific topic.");
  return parsed.questions.map((q, i) => ({ id: "AI_Q" + (i + 1), ...q }));
}

export default function CedricAI({
  subject: defaultSubject,
  onQuestionsReady,
  onCancel,
}) {
  const [topic, setTopic] = useState("");
  const [subject, setSubject] = useState(defaultSubject || "Biology");
  const [level, setLevel] = useState("200L (Intermediate)");
  const [difficulty, setDifficulty] = useState("Medium");
  const [numQuestions, setNumQuestions] = useState(5);
  const [status, setStatus] = useState("idle");
  const [errMsg, setErrMsg] = useState("");
  const [questions, setQuestions] = useState([]);

  const generate = async () => {
    if (!topic.trim()) {
      setErrMsg("Please enter a topic first");
      return;
    }
    setErrMsg("");
    setStatus("loading");
    try {
      const qs = await callCedric({
        topic,
        subject,
        level,
        difficulty,
        numQuestions,
      });
      setQuestions(qs);
      setStatus("done");
    } catch (e) {
      setStatus("error");
      const msg = e.message || "";
      if (
        msg.includes("fetch") ||
        msg.toLowerCase().includes("failed to fetch") ||
        msg.includes("NetworkError")
      ) {
        setErrMsg(
          'Cannot reach the proxy. Make sure you started with "npm start".',
        );
      } else {
        setErrMsg(msg || "Something went wrong. Please try again.");
      }
    }
  };

  return (
    <div>
      {/* Header */}
      <div
        style={{
          background: "linear-gradient(135deg,#1B1A2E 0%,#2D2A5E 100%)",
          borderRadius: "var(--r)",
          padding: "20px 24px",
          marginBottom: 20,
          color: "white",
          display: "flex",
          alignItems: "center",
          gap: 16,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            right: -20,
            top: -20,
            width: 120,
            height: 120,
            background:
              "radial-gradient(circle,rgba(108,99,255,0.4) 0%,transparent 70%)",
            borderRadius: "50%",
          }}
        />
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 14,
            background: "var(--purple)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            zIndex: 1,
          }}
        >
          <Sparkles size={24} color="white" />
        </div>
        <div style={{ zIndex: 1 }}>
          <div
            style={{ fontFamily: "var(--fd)", fontSize: 18, fontWeight: 800 }}
          >
            Cedric AI
          </div>
          <div style={{ fontSize: 13, opacity: 0.8, marginTop: 2 }}>
            Powered by Google Gemini — Free to use
          </div>
        </div>
      </div>

      {status !== "done" && (
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="ct" style={{ marginBottom: 16 }}>
            What should Cedric generate?
          </div>
          <div className="fl">
            <label className="lbl">Topic / Chapter *</label>
            <input
              className="inp"
              placeholder="e.g. Mitosis and Meiosis, Binary Search Trees, French Revolution..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              autoFocus
            />
            <span className="inp-hint">
              Be specific for best quality questions
            </span>
          </div>
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
          >
            <div className="fl">
              <label className="lbl">Subject</label>
              <select
                className="sel"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              >
                {SUBJECTS.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className="fl">
              <label className="lbl">Student Level</label>
              <select
                className="sel"
                value={level}
                onChange={(e) => setLevel(e.target.value)}
              >
                {LEVELS.map((l) => (
                  <option key={l}>{l}</option>
                ))}
              </select>
            </div>
            <div className="fl">
              <label className="lbl">Difficulty</label>
              <select
                className="sel"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
              >
                {DIFFICULTIES.map((d) => (
                  <option key={d}>{d}</option>
                ))}
              </select>
            </div>
            <div className="fl">
              <label className="lbl">Number of Questions</label>
              <select
                className="sel"
                value={numQuestions}
                onChange={(e) => setNumQuestions(Number(e.target.value))}
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 10, 12, 15, 20].map((n) => (
                  <option key={n} value={n}>
                    {n} question{n !== 1 ? "s" : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {(errMsg || status === "error") && (
            <div
              style={{
                display: "flex",
                gap: 10,
                alignItems: "flex-start",
                background: "var(--red-l)",
                border: "1px solid var(--red)",
                borderRadius: 9,
                padding: "10px 14px",
                marginBottom: 14,
                marginTop: 4,
              }}
            >
              <AlertCircle
                size={15}
                color="var(--red)"
                style={{ flexShrink: 0, marginTop: 1 }}
              />
              <span
                style={{ fontSize: 13, color: "var(--red)", fontWeight: 500 }}
              >
                {errMsg}
              </span>
            </div>
          )}

          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn btn-s" onClick={onCancel}>
              Cancel
            </button>
            <button
              className="btn btn-p"
              style={{ flex: 1, justifyContent: "center" }}
              onClick={generate}
              disabled={status === "loading"}
            >
              {status === "loading" ? (
                <>
                  <Loader
                    size={15}
                    style={{ animation: "sp 1s linear infinite" }}
                  />{" "}
                  Cedric is thinking...
                </>
              ) : (
                <>
                  <Sparkles size={15} /> Generate {numQuestions} Question
                  {numQuestions !== 1 ? "s" : ""}
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {status === "done" && questions.length > 0 && (
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 16,
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 9,
                background: "var(--green-l)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CheckCircle size={18} color="var(--green)" />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14 }}>
                Cedric generated {questions.length} question
                {questions.length !== 1 ? "s" : ""}
              </div>
              <div style={{ fontSize: 12, color: "var(--text2)" }}>
                Review below then use them in your exam
              </div>
            </div>
            <button
              className="btn btn-s btn-sm"
              style={{ marginLeft: "auto" }}
              onClick={() => {
                setStatus("idle");
                setQuestions([]);
              }}
            >
              <RefreshCw size={13} /> Regenerate
            </button>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 10,
              marginBottom: 18,
            }}
          >
            {questions.map((q, i) => (
              <div
                key={q.id}
                style={{
                  background: "var(--card)",
                  borderRadius: 12,
                  border: "1px solid var(--border)",
                  padding: "16px",
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: "var(--purple)",
                    textTransform: "uppercase",
                    letterSpacing: "0.4px",
                    marginBottom: 6,
                  }}
                >
                  Question {i + 1}
                </div>
                <div
                  style={{
                    fontWeight: 600,
                    fontSize: 14,
                    marginBottom: 10,
                    color: "var(--text)",
                  }}
                >
                  {q.text}
                </div>
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 6,
                    marginBottom: 10,
                  }}
                >
                  {(q.options || []).map((opt, oi) => (
                    <span
                      key={oi}
                      style={{
                        padding: "4px 12px",
                        borderRadius: 7,
                        fontSize: 12,
                        fontWeight: 500,
                        background:
                          oi === q.correct ? "var(--green-l)" : "var(--bg)",
                        color: oi === q.correct ? "#047857" : "var(--text2)",
                        border: `1px solid ${oi === q.correct ? "var(--green)" : "var(--border)"}`,
                      }}
                    >
                      {["A", "B", "C", "D"][oi]}. {opt}
                      {oi === q.correct ? " (correct)" : ""}
                    </span>
                  ))}
                </div>
                <div
                  style={{
                    padding: "9px 12px",
                    background: "var(--purple-l)",
                    borderRadius: 8,
                    fontSize: 12,
                    color: "var(--text)",
                    borderLeft: "3px solid var(--purple)",
                  }}
                >
                  <strong style={{ color: "var(--purple)" }}>Solution: </strong>
                  {q.solution}
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn btn-s" onClick={onCancel}>
              Cancel
            </button>
            <button
              className="btn btn-p"
              style={{ flex: 1, justifyContent: "center" }}
              onClick={() => onQuestionsReady(questions, topic, subject)}
            >
              <BookOpen size={15} /> Use These Questions
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
