import { useState, useEffect, useRef, useCallback } from "react";

// ─── THEME & GLOBAL STYLES ────────────────────────────────────────────────────
const GlobalStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&family=Fraunces:ital,wght@0,300;0,600;0,900;1,300&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --bg: #07080f;
      --surface: #0f1120;
      --surface2: #161928;
      --border: #1e2235;
      --accent: #6c63ff;
      --accent2: #00d9b8;
      --accent3: #ff6b6b;
      --accent4: #ffd166;
      --text: #e8eaf6;
      --muted: #6b7280;
      --font: 'Sora', sans-serif;
      --mono: 'JetBrains Mono', monospace;
      --serif: 'Fraunces', serif;
      --radius: 16px;
      --glow: 0 0 30px rgba(108,99,255,0.25);
      --glow2: 0 0 30px rgba(0,217,184,0.2);
    }

    html, body, #root { height: 100%; font-family: var(--font); background: var(--bg); color: var(--text); }

    ::-webkit-scrollbar { width: 4px; }
    ::-webkit-scrollbar-track { background: var(--bg); }
    ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }

    @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
    @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
    @keyframes spin { to { transform:rotate(360deg); } }
    @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
    @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
    @keyframes floatOrb { 0%,100%{transform:translateY(0) scale(1)} 50%{transform:translateY(-20px) scale(1.05)} }
    @keyframes gradMove { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
    @keyframes slideIn { from{opacity:0;transform:translateX(-12px)} to{opacity:1;transform:translateX(0)} }
    @keyframes bounceIn { 0%{transform:scale(0.8);opacity:0} 70%{transform:scale(1.05)} 100%{transform:scale(1);opacity:1} }

    .fade-up { animation: fadeUp 0.4s ease both; }
    .bounce-in { animation: bounceIn 0.35s ease both; }

    button { cursor: pointer; font-family: var(--font); border: none; outline: none; }
    input, textarea, select { font-family: var(--font); outline: none; }

    .orb {
      position: fixed; border-radius: 50%; pointer-events: none; z-index: 0; filter: blur(80px); opacity: 0.18;
      animation: floatOrb 8s ease-in-out infinite;
    }
  `}</style>
);

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const ROLES = ["student", "teacher", "parent"];

const SUBJECTS = [
  { id: "math", label: "Mathematics", icon: "📐", color: "#6c63ff" },
  { id: "science", label: "Science", icon: "🔬", color: "#00d9b8" },
  { id: "english", label: "English", icon: "📚", color: "#ffd166" },
  { id: "history", label: "History", icon: "🏛️", color: "#ff6b6b" },
  { id: "coding", label: "Coding", icon: "💻", color: "#a78bfa" },
  { id: "physics", label: "Physics", icon: "⚛️", color: "#38bdf8" },
];

const SAMPLE_NOTES = [
  { id: 1, subject: "math", title: "Quadratic Equations", preview: "ax² + bx + c = 0 solved using the quadratic formula...", grade: "Grade 10", date: "Apr 25", tags: ["algebra","formulas"] },
  { id: 2, subject: "science", title: "Photosynthesis Process", preview: "Plants convert sunlight + CO₂ + H₂O into glucose...", grade: "Grade 8", date: "Apr 24", tags: ["biology","plants"] },
  { id: 3, subject: "physics", title: "Newton's Laws of Motion", preview: "First law: An object at rest stays at rest unless...", grade: "Grade 11", date: "Apr 23", tags: ["mechanics","forces"] },
  { id: 4, subject: "coding", title: "JavaScript Promises", preview: "Async operations handled elegantly with .then()...", grade: "Grade 12", date: "Apr 22", tags: ["async","ES6"] },
  { id: 5, subject: "english", title: "Shakespeare's Macbeth", preview: "Themes of ambition, guilt, and the supernatural...", grade: "Grade 11", date: "Apr 21", tags: ["literature","themes"] },
  { id: 6, subject: "history", title: "World War II Timeline", preview: "1939–1945: Major events, battles, and turning points...", grade: "Grade 10", date: "Apr 20", tags: ["warfare","modern"] },
];

const EXAM_QUESTIONS = {
  math: [
    { q: "Solve: 2x² - 8x + 6 = 0", options: ["x = 1, 3", "x = 2, 4", "x = -1, -3", "x = 0, 4"], correct: 0, explanation: "Using the quadratic formula: x = (8 ± √(64-48))/4 = (8 ± 4)/4, giving x=3 and x=1." },
    { q: "What is the derivative of f(x) = x³ + 2x?", options: ["3x² + 2", "3x² - 2", "x² + 2", "3x + 2"], correct: 0, explanation: "Power rule: d/dx(xⁿ) = nxⁿ⁻¹. So d/dx(x³) = 3x² and d/dx(2x) = 2." },
    { q: "What is log₂(64)?", options: ["4", "6", "8", "5"], correct: 1, explanation: "2⁶ = 64, so log₂(64) = 6." },
    { q: "Find the area of a circle with radius 7cm (π≈3.14)", options: ["153.86 cm²", "43.96 cm²", "21.98 cm²", "49 cm²"], correct: 0, explanation: "Area = πr² = 3.14 × 7² = 3.14 × 49 = 153.86 cm²." },
    { q: "Simplify: (x² + 5x + 6)/(x + 2)", options: ["x + 3", "x + 2", "x - 3", "x² + 3"], correct: 0, explanation: "Factor numerator: (x+2)(x+3). Cancel (x+2) to get (x+3)." },
  ],
  science: [
    { q: "What gas do plants absorb during photosynthesis?", options: ["Oxygen", "Nitrogen", "Carbon Dioxide", "Hydrogen"], correct: 2, explanation: "Plants absorb CO₂ and water, using sunlight to produce glucose and oxygen." },
    { q: "What is the atomic number of Carbon?", options: ["12", "6", "8", "14"], correct: 1, explanation: "Carbon has 6 protons, so its atomic number is 6. The mass number 12 is different." },
    { q: "Which organelle is the powerhouse of the cell?", options: ["Nucleus", "Ribosome", "Golgi Body", "Mitochondria"], correct: 3, explanation: "Mitochondria produce ATP through cellular respiration — the cell's energy currency." },
    { q: "Newton's 2nd law: F = ?", options: ["ma", "mv", "m/a", "m+a"], correct: 0, explanation: "Force equals mass times acceleration: F = ma." },
    { q: "Water's chemical formula is:", options: ["H₂O₂", "H₂O", "HO", "H₃O"], correct: 1, explanation: "Water consists of 2 hydrogen atoms bonded to 1 oxygen atom: H₂O." },
  ],
};

// ─── HELPER: CALL ANTHROPIC API ───────────────────────────────────────────────
async function callBkaZi(messages, systemPrompt) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      system: systemPrompt,
      messages,
    }),
  });
  const data = await res.json();
  return data.content?.[0]?.text || "I couldn't generate a response. Please try again.";
}

// ─── COMPONENTS ──────────────────────────────────────────────────────────────

// Spinner
const Spinner = ({ size = 20, color = "var(--accent)" }) => (
  <div style={{ width: size, height: size, border: `2px solid ${color}22`, borderTop: `2px solid ${color}`, borderRadius: "50%", animation: "spin 0.7s linear infinite", display: "inline-block" }} />
);

// Badge
const Badge = ({ children, color = "var(--accent)" }) => (
  <span style={{ background: `${color}22`, color, border: `1px solid ${color}44`, borderRadius: 999, padding: "2px 10px", fontSize: 11, fontWeight: 600, letterSpacing: "0.04em" }}>{children}</span>
);

// Pill Button
const Pill = ({ children, active, onClick, color = "var(--accent)" }) => (
  <button onClick={onClick} style={{
    background: active ? color : "transparent",
    color: active ? "#fff" : "var(--muted)",
    border: `1px solid ${active ? color : "var(--border)"}`,
    borderRadius: 999, padding: "6px 18px", fontSize: 13, fontWeight: 600,
    transition: "all 0.2s",
  }}>{children}</button>
);

// Card
const Card = ({ children, style = {}, onClick, glow }) => (
  <div onClick={onClick} style={{
    background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)",
    padding: 20, transition: "all 0.25s", cursor: onClick ? "pointer" : "default",
    boxShadow: glow ? "var(--glow)" : "none",
    ...style,
  }}
    onMouseEnter={e => { if (onClick) { e.currentTarget.style.borderColor = "var(--accent)44"; e.currentTarget.style.transform = "translateY(-2px)"; } }}
    onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.transform = "translateY(0)"; }}
  >{children}</div>
);

// Avatar
const Avatar = ({ role }) => {
  const map = { student: { icon: "🎓", color: "#6c63ff" }, teacher: { icon: "📖", color: "#00d9b8" }, parent: { icon: "🏠", color: "#ffd166" } };
  const { icon, color } = map[role] || map.student;
  return <div style={{ width: 38, height: 38, borderRadius: "50%", background: `${color}22`, border: `2px solid ${color}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>{icon}</div>;
};

// ─── LOGIN SCREEN ─────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }) {
  const [role, setRole] = useState("student");
  const [name, setName] = useState("");

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>
      <div className="orb" style={{ width: 400, height: 400, background: "var(--accent)", top: -100, left: -100 }} />
      <div className="orb" style={{ width: 350, height: 350, background: "var(--accent2)", bottom: -80, right: -80, animationDelay: "3s" }} />

      <div className="fade-up" style={{ width: "100%", maxWidth: 440, padding: 16, position: "relative", zIndex: 1 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: "linear-gradient(135deg, var(--accent), var(--accent2))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, boxShadow: "var(--glow)" }}>✦</div>
            <span style={{ fontSize: 28, fontWeight: 800, background: "linear-gradient(90deg, var(--accent), var(--accent2))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>BkaZi</span>
          </div>
          <p style={{ fontFamily: "var(--serif)", fontStyle: "italic", color: "var(--muted)", fontSize: 15 }}>The AI-Powered Education Universe</p>
        </div>

        <Card glow>
          <div style={{ marginBottom: 24 }}>
            <label style={{ fontSize: 12, color: "var(--muted)", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", display: "block", marginBottom: 8 }}>I am a</label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
              {ROLES.map(r => (
                <button key={r} onClick={() => setRole(r)} style={{
                  padding: "12px 0", borderRadius: 10,
                  background: role === r ? "linear-gradient(135deg,var(--accent),var(--accent2))" : "var(--surface2)",
                  border: `1px solid ${role === r ? "transparent" : "var(--border)"}`,
                  color: role === r ? "#fff" : "var(--muted)", fontSize: 13, fontWeight: 600,
                  transition: "all 0.2s",
                }}>
                  {r === "student" ? "🎓" : r === "teacher" ? "📖" : "🏠"}<br />
                  <span style={{ fontSize: 11, marginTop: 2, display: "block" }}>{r.charAt(0).toUpperCase() + r.slice(1)}</span>
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 12, color: "var(--muted)", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", display: "block", marginBottom: 8 }}>Your Name</label>
            <input
              value={name} onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === "Enter" && name.trim() && onLogin({ name, role })}
              placeholder={`Enter your name...`}
              style={{ width: "100%", background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 10, padding: "12px 14px", color: "var(--text)", fontSize: 14 }}
            />
          </div>

          <button
            onClick={() => name.trim() && onLogin({ name, role })}
            disabled={!name.trim()}
            style={{
              width: "100%", padding: 14, borderRadius: 12, fontSize: 15, fontWeight: 700,
              background: name.trim() ? "linear-gradient(135deg,var(--accent),var(--accent2))" : "var(--surface2)",
              color: name.trim() ? "#fff" : "var(--muted)",
              boxShadow: name.trim() ? "var(--glow)" : "none", transition: "all 0.2s",
            }}
          >Enter BkaZi →</button>
        </Card>

        <p style={{ textAlign: "center", marginTop: 16, fontSize: 12, color: "var(--muted)" }}>
          Powered by Claude AI · Built for the future of learning
        </p>
      </div>
    </div>
  );
}

// ─── SIDEBAR ──────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { id: "home", icon: "⬡", label: "Dashboard" },
  { id: "notes", icon: "📄", label: "Study Notes" },
  { id: "chat", icon: "✦", label: "AI BkaZi" },
  { id: "exam", icon: "📝", label: "Exam Zone" },
  { id: "flashcards", icon: "🃏", label: "Flashcards" },
  { id: "progress", icon: "📊", label: "Progress" },
  { id: "schedule", icon: "📅", label: "Schedule" },
];

function Sidebar({ active, setActive, user }) {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <div style={{
      width: collapsed ? 64 : 220, flexShrink: 0, background: "var(--surface)", borderRight: "1px solid var(--border)",
      display: "flex", flexDirection: "column", transition: "width 0.25s", overflow: "hidden",
    }}>
      {/* Logo */}
      <div style={{ padding: collapsed ? "20px 0" : "20px 16px", display: "flex", alignItems: "center", gap: 10, justifyContent: collapsed ? "center" : "flex-start", borderBottom: "1px solid var(--border)" }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,var(--accent),var(--accent2))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0, boxShadow: "var(--glow)" }}>✦</div>
        {!collapsed && <span style={{ fontSize: 20, fontWeight: 800, background: "linear-gradient(90deg,var(--accent),var(--accent2))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", whiteSpace: "nowrap" }}>BkaZi</span>}
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "12px 8px", display: "flex", flexDirection: "column", gap: 2 }}>
        {NAV_ITEMS.map(item => (
          <button key={item.id} onClick={() => setActive(item.id)} style={{
            display: "flex", alignItems: "center", gap: 10, padding: collapsed ? "10px 0" : "10px 12px",
            borderRadius: 10, background: active === item.id ? "var(--accent)22" : "transparent",
            border: `1px solid ${active === item.id ? "var(--accent)44" : "transparent"}`,
            color: active === item.id ? "var(--accent)" : "var(--muted)", fontSize: 13, fontWeight: 600,
            justifyContent: collapsed ? "center" : "flex-start", transition: "all 0.15s", width: "100%",
          }}>
            <span style={{ fontSize: 16, flexShrink: 0 }}>{item.icon}</span>
            {!collapsed && <span style={{ whiteSpace: "nowrap" }}>{item.label}</span>}
          </button>
        ))}
      </nav>

      {/* User */}
      <div style={{ padding: collapsed ? "12px 4px" : "12px", borderTop: "1px solid var(--border)" }}>
        <button onClick={() => setCollapsed(!collapsed)} style={{
          width: "100%", display: "flex", alignItems: "center", gap: 10, justifyContent: collapsed ? "center" : "flex-start",
          background: "transparent", color: "var(--muted)", padding: 8, borderRadius: 8, border: "none", marginBottom: 6, fontSize: 12,
        }}>
          {collapsed ? "→" : "← Collapse"}
        </button>
        {!collapsed && (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Avatar role={user.role} />
            <div style={{ overflow: "hidden" }}>
              <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user.name}</div>
              <div style={{ fontSize: 11, color: "var(--muted)", textTransform: "capitalize" }}>{user.role}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
function Dashboard({ user, setPage }) {
  const stats = [
    { label: "Notes Read", val: "24", icon: "📄", color: "var(--accent)" },
    { label: "Exams Taken", val: "8", icon: "📝", color: "var(--accent2)" },
    { label: "Avg Score", val: "87%", icon: "🏆", color: "var(--accent4)" },
    { label: "Study Streak", val: "12d", icon: "🔥", color: "var(--accent3)" },
  ];

  return (
    <div style={{ padding: 28, maxWidth: 1100 }} className="fade-up">
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <span style={{ fontSize: 12, color: "var(--accent)", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>Good Morning</span>
          <span style={{ fontSize: 18 }}>☀️</span>
        </div>
        <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 4 }}>Welcome back, {user.name}</h1>
        <p style={{ color: "var(--muted)", fontSize: 15 }}>Let's continue your learning journey today.</p>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 24 }}>
        {stats.map(s => (
          <Card key={s.label} style={{ textAlign: "center", padding: 18 }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>{s.icon}</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: s.color, marginBottom: 2 }}>{s.val}</div>
            <div style={{ fontSize: 12, color: "var(--muted)" }}>{s.label}</div>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
        <Card style={{ background: "linear-gradient(135deg, #6c63ff22, #00d9b822)", border: "1px solid var(--accent)33", cursor: "pointer" }} onClick={() => setPage("chat")}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: "linear-gradient(135deg,var(--accent),var(--accent2))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, boxShadow: "var(--glow)", flexShrink: 0 }}>✦</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>Chat with AI BkaZi</div>
              <div style={{ fontSize: 13, color: "var(--muted)" }}>Ask anything — get instant intelligent answers</div>
            </div>
          </div>
        </Card>
        <Card style={{ background: "linear-gradient(135deg, #ff6b6b22, #ffd16622)", border: "1px solid #ff6b6b33", cursor: "pointer" }} onClick={() => setPage("exam")}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: "linear-gradient(135deg,#ff6b6b,#ffd166)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 }}>📝</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>Take an Exam</div>
              <div style={{ fontSize: 13, color: "var(--muted)" }}>Test your knowledge with instant AI feedback</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Subjects */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 14 }}>Your Subjects</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 10 }}>
          {SUBJECTS.map(s => (
            <Card key={s.id} onClick={() => setPage("notes")} style={{ textAlign: "center", padding: 16 }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>{s.icon}</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: s.color }}>{s.label}</div>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent Notes */}
      <div>
        <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 14 }}>Recent Study Notes</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
          {SAMPLE_NOTES.slice(0, 3).map(note => {
            const sub = SUBJECTS.find(s => s.id === note.subject);
            return (
              <Card key={note.id} onClick={() => setPage("notes")}>
                <div style={{ display: "flex", align: "center", gap: 8, marginBottom: 10 }}>
                  <span style={{ fontSize: 18 }}>{sub?.icon}</span>
                  <Badge color={sub?.color}>{sub?.label}</Badge>
                </div>
                <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 6 }}>{note.title}</div>
                <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 10, lineHeight: 1.5 }}>{note.preview}</div>
                <div style={{ display: "flex", gap: 6 }}>{note.tags.map(t => <Badge key={t}>#{t}</Badge>)}</div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── NOTES BROWSER ────────────────────────────────────────────────────────────
function NotesPage({ user }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState(null);
  const [aiSummary, setAiSummary] = useState("");
  const [loadingSummary, setLoadingSummary] = useState(false);

  const filtered = SAMPLE_NOTES.filter(n =>
    (filter === "all" || n.subject === filter) &&
    (n.title.toLowerCase().includes(search.toLowerCase()) || n.preview.toLowerCase().includes(search.toLowerCase()))
  );

  const getSummary = async (note) => {
    setLoadingSummary(true);
    setAiSummary("");
    try {
      const text = await callBkaZi(
        [{ role: "user", content: `Give me a concise, helpful study summary of this note in 3-4 bullet points:\n\nTitle: ${note.title}\n${note.preview}\n\nFormat with bullet points (•) and include a key takeaway at the end.` }],
        "You are BkaZi, an expert educational AI. Give clear, student-friendly explanations and summaries. Be concise but thorough."
      );
      setAiSummary(text);
    } catch { setAiSummary("Couldn't load summary. Please try again."); }
    setLoadingSummary(false);
  };

  return (
    <div style={{ display: "flex", height: "100%", overflow: "hidden" }}>
      {/* List */}
      <div style={{ width: 360, flexShrink: 0, borderRight: "1px solid var(--border)", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ padding: "20px 16px", borderBottom: "1px solid var(--border)" }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 12 }}>📄 Study Notes</h2>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search notes..." style={{ width: "100%", background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 10, padding: "10px 14px", color: "var(--text)", fontSize: 13, marginBottom: 10 }} />
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            <Pill active={filter === "all"} onClick={() => setFilter("all")}>All</Pill>
            {SUBJECTS.map(s => <Pill key={s.id} active={filter === s.id} onClick={() => setFilter(s.id)} color={s.color}>{s.icon}</Pill>)}
          </div>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: 10 }}>
          {filtered.map(note => {
            const sub = SUBJECTS.find(s => s.id === note.subject);
            return (
              <div key={note.id} onClick={() => { setSelected(note); getSummary(note); }} style={{
                padding: 14, borderRadius: 10, marginBottom: 6, cursor: "pointer",
                background: selected?.id === note.id ? "var(--accent)18" : "transparent",
                border: `1px solid ${selected?.id === note.id ? "var(--accent)44" : "transparent"}`,
                transition: "all 0.15s",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                  <span>{sub?.icon}</span>
                  <Badge color={sub?.color}>{sub?.label}</Badge>
                  <span style={{ marginLeft: "auto", fontSize: 11, color: "var(--muted)" }}>{note.date}</span>
                </div>
                <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>{note.title}</div>
                <div style={{ fontSize: 11, color: "var(--muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{note.preview}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detail */}
      <div style={{ flex: 1, overflowY: "auto", padding: 28 }}>
        {selected ? (
          <div className="fade-up">
            {(() => { const sub = SUBJECTS.find(s => s.id === selected.subject); return (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                  <span style={{ fontSize: 30 }}>{sub?.icon}</span>
                  <div>
                    <Badge color={sub?.color}>{sub?.label}</Badge>
                    <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>{selected.grade} · {selected.date}</div>
                  </div>
                </div>
                <h2 style={{ fontSize: 26, fontWeight: 800, marginBottom: 12 }}>{selected.title}</h2>
                <div style={{ display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap" }}>
                  {selected.tags.map(t => <Badge key={t}>#{t}</Badge>)}
                </div>
                <Card style={{ marginBottom: 20 }}>
                  <p style={{ lineHeight: 1.8, color: "var(--text)", fontSize: 15 }}>{selected.preview} Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Nam et dui condimentum, porttitor ante vitae, cursus augue. Nullam pretium augue vel ipsum volutpat pharetra.</p>
                </Card>

                {/* AI Summary */}
                <Card style={{ background: "linear-gradient(135deg,var(--accent)0a,var(--accent2)0a)", border: "1px solid var(--accent)33" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 8, background: "linear-gradient(135deg,var(--accent),var(--accent2))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>✦</div>
                    <span style={{ fontWeight: 700, fontSize: 14 }}>AI BkaZi Summary</span>
                    {loadingSummary && <Spinner size={14} />}
                  </div>
                  {loadingSummary ? (
                    <div style={{ color: "var(--muted)", fontSize: 13 }}>Generating intelligent summary...</div>
                  ) : aiSummary ? (
                    <div style={{ whiteSpace: "pre-wrap", fontSize: 14, lineHeight: 1.8, color: "var(--text)" }}>{aiSummary}</div>
                  ) : null}
                </Card>
              </>
            ); })()}
          </div>
        ) : (
          <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12 }}>
            <div style={{ fontSize: 48 }}>📄</div>
            <div style={{ color: "var(--muted)", fontSize: 15 }}>Select a note to read and get AI insights</div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── AI CHAT ──────────────────────────────────────────────────────────────────
function ChatPage({ user }) {
  const [messages, setMessages] = useState([
    { role: "assistant", content: `Hi ${user.name}! 👋 I'm **BkaZi**, your personal AI tutor. I can help you understand any subject, explain concepts, solve problems, create study plans, and much more. What would you like to learn today?` }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestions] = useState(["Explain photosynthesis", "Solve a quadratic equation", "Help me understand Newton's laws", "Create a study plan for exams"]);
  const bottomRef = useRef();

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const send = useCallback(async (text) => {
    const msg = text || input.trim();
    if (!msg || loading) return;
    setInput("");
    const updated = [...messages, { role: "user", content: msg }];
    setMessages(updated);
    setLoading(true);
    const apiMsgs = updated.map(m => ({ role: m.role, content: m.content }));
    try {
      const reply = await callBkaZi(apiMsgs,
        `You are BkaZi, an expert, friendly AI educational tutor for ${user.role} named ${user.name}. You help with all academic subjects — math, science, history, english, coding, and more. Give clear, structured, and engaging explanations. Use examples, analogies, and step-by-step breakdowns. Format your responses clearly with spacing. Adapt your language to be appropriate for the user's role (${user.role}). Be encouraging and supportive.`
      );
      setMessages(prev => [...prev, { role: "assistant", content: reply }]);
    } catch { setMessages(prev => [...prev, { role: "assistant", content: "Sorry, I had trouble responding. Please try again!" }]); }
    setLoading(false);
  }, [input, messages, loading, user]);

  const formatMsg = (text) => {
    return text.split('\n').map((line, i) => {
      if (line.startsWith('**') && line.endsWith('**')) return <div key={i} style={{ fontWeight: 700, marginBottom: 4 }}>{line.slice(2, -2)}</div>;
      if (line.startsWith('• ') || line.startsWith('- ')) return <div key={i} style={{ display: "flex", gap: 8, marginBottom: 3 }}><span style={{ color: "var(--accent)", flexShrink: 0 }}>•</span><span>{line.slice(2)}</span></div>;
      if (line.match(/^\d+\./)) return <div key={i} style={{ marginBottom: 3 }}>{line}</div>;
      return <div key={i} style={{ marginBottom: line ? 4 : 8 }}>{line}</div>;
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", maxWidth: 820, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 42, height: 42, borderRadius: 12, background: "linear-gradient(135deg,var(--accent),var(--accent2))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, boxShadow: "var(--glow)" }}>✦</div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 16 }}>AI BkaZi Agent</div>
          <div style={{ fontSize: 12, color: "var(--accent2)", display: "flex", alignItems: "center", gap: 4 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent2)", animation: "pulse 2s infinite" }} />
            Online · Ready to teach
          </div>
        </div>
        <div style={{ marginLeft: "auto" }}>
          <Badge color="var(--accent2)">Claude Powered</Badge>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
        {messages.map((m, i) => (
          <div key={i} className="fade-up" style={{ display: "flex", gap: 10, flexDirection: m.role === "user" ? "row-reverse" : "row" }}>
            {m.role === "assistant" ? (
              <div style={{ width: 34, height: 34, borderRadius: 10, background: "linear-gradient(135deg,var(--accent),var(--accent2))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>✦</div>
            ) : (
              <Avatar role={user.role} />
            )}
            <div style={{
              maxWidth: "75%", padding: "12px 16px", borderRadius: m.role === "user" ? "16px 4px 16px 16px" : "4px 16px 16px 16px",
              background: m.role === "user" ? "linear-gradient(135deg,var(--accent),var(--accent2))" : "var(--surface2)",
              border: m.role === "user" ? "none" : "1px solid var(--border)",
              fontSize: 14, lineHeight: 1.7, color: m.role === "user" ? "#fff" : "var(--text)",
            }}>
              {formatMsg(m.content)}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: "linear-gradient(135deg,var(--accent),var(--accent2))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>✦</div>
            <div style={{ padding: "12px 16px", borderRadius: "4px 16px 16px 16px", background: "var(--surface2)", border: "1px solid var(--border)", display: "flex", gap: 6, alignItems: "center" }}>
              {[0, 1, 2].map(j => <div key={j} style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent)", animation: `pulse 1.2s ${j * 0.2}s infinite` }} />)}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggestions */}
      {messages.length === 1 && (
        <div style={{ padding: "0 24px 12px", display: "flex", gap: 8, flexWrap: "wrap" }}>
          {suggestions.map(s => (
            <button key={s} onClick={() => send(s)} style={{ padding: "8px 14px", borderRadius: 20, background: "var(--surface2)", border: "1px solid var(--border)", color: "var(--muted)", fontSize: 12, fontWeight: 500, transition: "all 0.15s" }}>{s}</button>
          ))}
        </div>
      )}

      {/* Input */}
      <div style={{ padding: "12px 24px 20px", borderTop: "1px solid var(--border)", display: "flex", gap: 10 }}>
        <input
          value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && !e.shiftKey && send()}
          placeholder="Ask BkaZi anything..."
          style={{ flex: 1, background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 12, padding: "12px 16px", color: "var(--text)", fontSize: 14 }}
        />
        <button onClick={() => send()} disabled={!input.trim() || loading} style={{
          padding: "12px 20px", borderRadius: 12, background: input.trim() && !loading ? "linear-gradient(135deg,var(--accent),var(--accent2))" : "var(--surface2)",
          color: input.trim() && !loading ? "#fff" : "var(--muted)", fontWeight: 700, fontSize: 14,
          boxShadow: input.trim() && !loading ? "var(--glow)" : "none", transition: "all 0.2s",
        }}>{loading ? <Spinner size={16} color="#fff" /> : "Send"}</button>
      </div>
    </div>
  );
}

// ─── EXAM ZONE ────────────────────────────────────────────────────────────────
function ExamPage({ user }) {
  const [phase, setPhase] = useState("select"); // select | exam | result
  const [subject, setSubject] = useState(null);
  const [answers, setAnswers] = useState({});
  const [current, setCurrent] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [result, setResult] = useState(null);
  const [aiFeedback, setAiFeedback] = useState("");
  const [loadingFeedback, setLoadingFeedback] = useState(false);

  const availableSubjects = Object.keys(EXAM_QUESTIONS);

  useEffect(() => {
    if (phase !== "exam") return;
    setTimeLeft(EXAM_QUESTIONS[subject].length * 45);
    const t = setInterval(() => setTimeLeft(p => { if (p <= 1) { clearInterval(t); submitExam(); return 0; } return p - 1; }), 1000);
    return () => clearInterval(t);
  }, [phase]);

  const startExam = (sub) => {
    setSubject(sub);
    setAnswers({});
    setCurrent(0);
    setPhase("exam");
  };

  const submitExam = async () => {
    const qs = EXAM_QUESTIONS[subject];
    let correct = 0;
    qs.forEach((q, i) => { if (answers[i] === q.correct) correct++; });
    const score = Math.round((correct / qs.length) * 100);
    setResult({ correct, total: qs.length, score, questions: qs, answers });
    setPhase("result");
    setLoadingFeedback(true);
    try {
      const wrongOnes = qs.filter((_, i) => answers[i] !== _.correct).map(q => q.q).join(", ");
      const fb = await callBkaZi(
        [{ role: "user", content: `Student ${user.name} just completed a ${subject} exam and scored ${score}% (${correct}/${qs.length}). ${wrongOnes ? `They got these questions wrong: ${wrongOnes}.` : "They got everything correct!"} Give a warm, personalized 3-4 sentence feedback with specific suggestions to improve on weak areas. End with encouragement.` }],
        "You are BkaZi, a supportive AI tutor giving exam feedback. Be specific, encouraging, and practical. Keep it under 100 words."
      );
      setAiFeedback(fb);
    } catch { setAiFeedback("Great effort! Keep practicing to improve your scores."); }
    setLoadingFeedback(false);
  };

  if (phase === "select") return (
    <div style={{ padding: 28, maxWidth: 800 }} className="fade-up">
      <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 6 }}>📝 Exam Zone</h2>
      <p style={{ color: "var(--muted)", marginBottom: 24 }}>Choose a subject and test your knowledge with AI-powered instant feedback.</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 14 }}>
        {availableSubjects.map(sub => {
          const s = SUBJECTS.find(x => x.id === sub);
          if (!s) return null;
          const qs = EXAM_QUESTIONS[sub];
          return (
            <Card key={sub} onClick={() => startExam(sub)} style={{ cursor: "pointer" }}>
              <div style={{ display: "flex", align: "center", gap: 14 }}>
                <div style={{ width: 50, height: 50, borderRadius: 12, background: `${s.color}22`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 }}>{s.icon}</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{s.label} Quiz</div>
                  <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 6 }}>{qs.length} Questions · ~{qs.length * 45}s</div>
                  <Badge color={s.color}>Start Exam →</Badge>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );

  if (phase === "exam") {
    const qs = EXAM_QUESTIONS[subject];
    const q = qs[current];
    const mins = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;
    return (
      <div style={{ padding: 28, maxWidth: 720 }} className="fade-up">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <Badge color={SUBJECTS.find(s => s.id === subject)?.color}>{SUBJECTS.find(s => s.id === subject)?.label} Exam</Badge>
          <div style={{ fontFamily: "var(--mono)", fontSize: 20, fontWeight: 700, color: timeLeft < 60 ? "var(--accent3)" : "var(--accent2)" }}>
            {mins}:{secs.toString().padStart(2, "0")}
          </div>
        </div>

        {/* Progress */}
        <div style={{ background: "var(--surface2)", borderRadius: 99, height: 6, marginBottom: 24, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${((current + 1) / qs.length) * 100}%`, background: "linear-gradient(90deg,var(--accent),var(--accent2))", transition: "width 0.3s", borderRadius: 99 }} />
        </div>

        <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 6, fontWeight: 600 }}>Question {current + 1} of {qs.length}</div>
        <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 22, lineHeight: 1.5 }}>{q.q}</h3>

        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
          {q.options.map((opt, oi) => (
            <button key={oi} onClick={() => setAnswers(prev => ({ ...prev, [current]: oi }))} style={{
              padding: "14px 18px", borderRadius: 12, textAlign: "left", fontSize: 14, fontWeight: 500, transition: "all 0.15s",
              background: answers[current] === oi ? "var(--accent)22" : "var(--surface2)",
              border: `1.5px solid ${answers[current] === oi ? "var(--accent)" : "var(--border)"}`,
              color: answers[current] === oi ? "var(--accent)" : "var(--text)",
            }}>
              <span style={{ fontWeight: 700, marginRight: 10, color: "var(--muted)" }}>{String.fromCharCode(65 + oi)}.</span>{opt}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          {current > 0 && <button onClick={() => setCurrent(p => p - 1)} style={{ padding: "12px 20px", borderRadius: 10, background: "var(--surface2)", border: "1px solid var(--border)", color: "var(--text)", fontWeight: 600 }}>← Back</button>}
          {current < qs.length - 1 ? (
            <button onClick={() => setCurrent(p => p + 1)} style={{ padding: "12px 24px", borderRadius: 10, background: "linear-gradient(135deg,var(--accent),var(--accent2))", color: "#fff", fontWeight: 700, boxShadow: "var(--glow)" }}>Next →</button>
          ) : (
            <button onClick={submitExam} style={{ padding: "12px 24px", borderRadius: 10, background: "linear-gradient(135deg,#ff6b6b,#ffd166)", color: "#fff", fontWeight: 700 }}>Submit Exam ✓</button>
          )}
          <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
            {qs.map((_, i) => (
              <button key={i} onClick={() => setCurrent(i)} style={{
                width: 28, height: 28, borderRadius: 6, fontSize: 11, fontWeight: 600,
                background: i === current ? "var(--accent)" : answers[i] !== undefined ? "var(--accent2)44" : "var(--surface2)",
                border: `1px solid ${i === current ? "var(--accent)" : "var(--border)"}`,
                color: i === current ? "#fff" : "var(--text)",
              }}>{i + 1}</button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (phase === "result" && result) {
    const grade = result.score >= 90 ? { label: "Excellent! 🏆", color: "var(--accent2)" } : result.score >= 70 ? { label: "Good Job! 👍", color: "var(--accent4)" } : { label: "Keep Practicing! 💪", color: "var(--accent3)" };
    return (
      <div style={{ padding: 28, maxWidth: 760 }} className="fade-up">
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontSize: 64, marginBottom: 12 }}>{result.score >= 90 ? "🏆" : result.score >= 70 ? "🌟" : "💪"}</div>
          <div style={{ fontSize: 52, fontWeight: 900, color: grade.color, marginBottom: 6 }}>{result.score}%</div>
          <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>{grade.label}</div>
          <div style={{ color: "var(--muted)" }}>{result.correct} of {result.total} questions correct</div>
        </div>

        {/* AI Feedback */}
        <Card style={{ background: "linear-gradient(135deg,var(--accent)0a,var(--accent2)0a)", border: "1px solid var(--accent)33", marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: "linear-gradient(135deg,var(--accent),var(--accent2))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>✦</div>
            <span style={{ fontWeight: 700 }}>BkaZi AI Feedback</span>
            {loadingFeedback && <Spinner size={14} />}
          </div>
          {loadingFeedback ? <div style={{ color: "var(--muted)", fontSize: 13 }}>Generating personalized feedback...</div> : <div style={{ fontSize: 14, lineHeight: 1.8 }}>{aiFeedback}</div>}
        </Card>

        {/* Answers review */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
          {result.questions.map((q, i) => {
            const correct = result.answers[i] === q.correct;
            return (
              <Card key={i} style={{ borderColor: correct ? "var(--accent2)44" : "var(--accent3)44", background: correct ? "var(--accent2)08" : "var(--accent3)08" }}>
                <div style={{ display: "flex", gap: 10, marginBottom: 8 }}>
                  <span style={{ fontSize: 18 }}>{correct ? "✅" : "❌"}</span>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{q.q}</div>
                </div>
                {!correct && (
                  <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 4 }}>
                    Your answer: <span style={{ color: "var(--accent3)" }}>{q.options[result.answers[i]] || "Not answered"}</span> · Correct: <span style={{ color: "var(--accent2)" }}>{q.options[q.correct]}</span>
                  </div>
                )}
                <div style={{ fontSize: 12, color: "var(--muted)", background: "var(--surface2)", borderRadius: 8, padding: "8px 12px" }}>💡 {q.explanation}</div>
              </Card>
            );
          })}
        </div>

        <button onClick={() => setPhase("select")} style={{ padding: "14px 28px", borderRadius: 12, background: "linear-gradient(135deg,var(--accent),var(--accent2))", color: "#fff", fontWeight: 700, fontSize: 15, boxShadow: "var(--glow)" }}>Take Another Exam →</button>
      </div>
    );
  }
}

// ─── FLASHCARDS ───────────────────────────────────────────────────────────────
function FlashcardsPage({ user }) {
  const [topic, setTopic] = useState("");
  const [cards, setCards] = useState([]);
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [loading, setLoading] = useState(false);
  const [known, setKnown] = useState(new Set());

  const generate = async () => {
    if (!topic.trim() || loading) return;
    setLoading(true);
    setCards([]);
    setIdx(0);
    setFlipped(false);
    setKnown(new Set());
    try {
      const text = await callBkaZi(
        [{ role: "user", content: `Create 6 flashcards for studying: "${topic}". Return ONLY a JSON array with objects having "front" (question/term) and "back" (answer/definition) keys. No markdown, no extra text, just the JSON array.` }],
        "You are BkaZi, an educational AI. Generate clear, concise flashcards for studying. Return only valid JSON."
      );
      const clean = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      setCards(parsed);
    } catch { setCards([{ front: "Error generating cards", back: "Please try again with a different topic." }]); }
    setLoading(false);
  };

  const card = cards[idx];

  return (
    <div style={{ padding: 28, maxWidth: 700 }} className="fade-up">
      <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 6 }}>🃏 AI Flashcard Generator</h2>
      <p style={{ color: "var(--muted)", marginBottom: 24 }}>Enter any topic and BkaZi will create smart flashcards for you instantly.</p>

      <div style={{ display: "flex", gap: 10, marginBottom: 28 }}>
        <input value={topic} onChange={e => setTopic(e.target.value)} onKeyDown={e => e.key === "Enter" && generate()}
          placeholder="e.g. French Revolution, Calculus Derivatives, DNA Replication..."
          style={{ flex: 1, background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 12, padding: "12px 16px", color: "var(--text)", fontSize: 14 }} />
        <button onClick={generate} disabled={!topic.trim() || loading} style={{ padding: "12px 20px", borderRadius: 12, background: "linear-gradient(135deg,var(--accent),var(--accent2))", color: "#fff", fontWeight: 700, boxShadow: "var(--glow)" }}>
          {loading ? <Spinner size={16} color="#fff" /> : "Generate ✦"}
        </button>
      </div>

      {cards.length > 0 && (
        <>
          {/* Progress */}
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10, fontSize: 13, color: "var(--muted)" }}>
            <span>Card {idx + 1} of {cards.length}</span>
            <span style={{ color: "var(--accent2)" }}>Known: {known.size}/{cards.length}</span>
          </div>
          <div style={{ background: "var(--surface2)", borderRadius: 99, height: 4, marginBottom: 20, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${((idx + 1) / cards.length) * 100}%`, background: "linear-gradient(90deg,var(--accent),var(--accent2))", borderRadius: 99, transition: "width 0.3s" }} />
          </div>

          {/* Card */}
          <div onClick={() => setFlipped(f => !f)} style={{ cursor: "pointer", marginBottom: 20 }}>
            <div style={{
              minHeight: 220, borderRadius: 16, border: `2px solid ${flipped ? "var(--accent2)" : "var(--accent)"}44`,
              background: flipped ? "linear-gradient(135deg,var(--accent2)12,var(--accent2)08)" : "linear-gradient(135deg,var(--accent)12,var(--accent)08)",
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 32, textAlign: "center",
              transition: "all 0.3s", boxShadow: flipped ? "var(--glow2)" : "var(--glow)",
            }}>
              <div style={{ fontSize: 11, color: "var(--muted)", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 16 }}>
                {flipped ? "↩ Answer" : "Question →"}
              </div>
              <div style={{ fontSize: 20, fontWeight: 700, lineHeight: 1.5 }}>{flipped ? card.back : card.front}</div>
              <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 16 }}>Tap to {flipped ? "see question" : "reveal answer"}</div>
            </div>
          </div>

          {/* Controls */}
          <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
            {idx > 0 && <button onClick={() => { setIdx(p => p - 1); setFlipped(false); }} style={{ padding: "10px 20px", borderRadius: 10, background: "var(--surface2)", border: "1px solid var(--border)", color: "var(--text)", fontWeight: 600 }}>← Prev</button>}
            <button onClick={() => { setKnown(k => new Set([...k, idx])); if (idx < cards.length - 1) { setIdx(p => p + 1); setFlipped(false); } }} style={{ padding: "10px 20px", borderRadius: 10, background: "var(--accent2)22", border: "1px solid var(--accent2)44", color: "var(--accent2)", fontWeight: 600 }}>✓ Got It</button>
            <button onClick={() => { const n = new Set(known); n.delete(idx); setKnown(n); if (idx < cards.length - 1) { setIdx(p => p + 1); setFlipped(false); } }} style={{ padding: "10px 20px", borderRadius: 10, background: "var(--accent3)22", border: "1px solid var(--accent3)44", color: "var(--accent3)", fontWeight: 600 }}>✗ Review</button>
            {idx < cards.length - 1 && <button onClick={() => { setIdx(p => p + 1); setFlipped(false); }} style={{ padding: "10px 20px", borderRadius: 10, background: "var(--surface2)", border: "1px solid var(--border)", color: "var(--text)", fontWeight: 600 }}>Next →</button>}
          </div>
        </>
      )}

      {loading && (
        <div style={{ textAlign: "center", padding: 40 }}>
          <Spinner size={32} />
          <div style={{ color: "var(--muted)", marginTop: 12 }}>BkaZi is creating your flashcards...</div>
        </div>
      )}
    </div>
  );
}

// ─── PROGRESS ─────────────────────────────────────────────────────────────────
function ProgressPage({ user }) {
  const subjectData = [
    { sub: "Mathematics", score: 87, exams: 4, color: "#6c63ff" },
    { sub: "Science", score: 92, exams: 3, color: "#00d9b8" },
    { sub: "Physics", score: 74, exams: 2, color: "#38bdf8" },
    { sub: "English", score: 88, exams: 3, color: "#ffd166" },
    { sub: "History", score: 78, exams: 2, color: "#ff6b6b" },
    { sub: "Coding", score: 95, exams: 2, color: "#a78bfa" },
  ];

  const weekData = [
    { day: "Mon", mins: 45 }, { day: "Tue", mins: 90 }, { day: "Wed", mins: 30 },
    { day: "Thu", mins: 75 }, { day: "Fri", mins: 60 }, { day: "Sat", mins: 120 }, { day: "Sun", mins: 50 },
  ];
  const maxMins = Math.max(...weekData.map(d => d.mins));

  return (
    <div style={{ padding: 28, maxWidth: 900 }} className="fade-up">
      <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 6 }}>📊 Learning Progress</h2>
      <p style={{ color: "var(--muted)", marginBottom: 24 }}>Track your academic journey across all subjects.</p>

      {/* Weekly Activity */}
      <Card style={{ marginBottom: 24 }}>
        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}>📅 Weekly Study Activity</div>
        <div style={{ display: "flex", align: "flex-end", gap: 8, height: 120 }}>
          {weekData.map(d => (
            <div key={d.day} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              <div style={{ flex: 1, width: "100%", display: "flex", alignItems: "flex-end" }}>
                <div style={{ width: "100%", height: `${(d.mins / maxMins) * 100}%`, background: "linear-gradient(0deg,var(--accent),var(--accent2))", borderRadius: "4px 4px 0 0", minHeight: 4, transition: "height 0.5s" }} />
              </div>
              <div style={{ fontSize: 11, color: "var(--muted)" }}>{d.day}</div>
              <div style={{ fontSize: 10, color: "var(--accent2)", fontWeight: 600 }}>{d.mins}m</div>
            </div>
          ))}
        </div>
      </Card>

      {/* Subject Scores */}
      <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 14 }}>📈 Subject Performance</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
        {subjectData.map(s => (
          <Card key={s.sub}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontWeight: 600, fontSize: 14 }}>{s.sub}</span>
                  <span style={{ fontWeight: 800, color: s.color, fontSize: 15 }}>{s.score}%</span>
                </div>
                <div style={{ background: "var(--surface2)", borderRadius: 99, height: 8, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${s.score}%`, background: s.color, borderRadius: 99, transition: "width 1s" }} />
                </div>
                <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>{s.exams} exams taken</div>
              </div>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: `${s.color}22`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, color: s.color, fontSize: 14 }}>{s.score >= 90 ? "A" : s.score >= 80 ? "B" : s.score >= 70 ? "C" : "D"}</div>
            </div>
          </Card>
        ))}
      </div>

      {/* Achievements */}
      <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 14 }}>🏆 Achievements</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
        {[
          { icon: "🔥", title: "12-Day Streak", desc: "Consistent daily learner", color: "#ff6b6b" },
          { icon: "⚡", title: "Speed Learner", desc: "Completed 3 exams in one day", color: "#ffd166" },
          { icon: "🌟", title: "Top Scorer", desc: "95% in Coding exam", color: "#a78bfa" },
          { icon: "📚", title: "Bookworm", desc: "Read 24 study notes", color: "#00d9b8" },
          { icon: "🎯", title: "Sharpshooter", desc: "Perfect score in Science", color: "#38bdf8" },
          { icon: "🤖", title: "AI Explorer", desc: "50+ BkaZi conversations", color: "#6c63ff" },
        ].map(a => (
          <Card key={a.title} style={{ textAlign: "center", padding: 16 }}>
            <div style={{ fontSize: 30, marginBottom: 8 }}>{a.icon}</div>
            <div style={{ fontWeight: 700, fontSize: 13, color: a.color, marginBottom: 4 }}>{a.title}</div>
            <div style={{ fontSize: 11, color: "var(--muted)" }}>{a.desc}</div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ─── SCHEDULE ────────────────────────────────────────────────────────────────
function SchedulePage({ user }) {
  const [topic, setTopic] = useState("");
  const [plan, setPlan] = useState("");
  const [loading, setLoading] = useState(false);
  const [days, setDays] = useState(7);

  const generate = async () => {
    if (!topic.trim() || loading) return;
    setLoading(true);
    setPlan("");
    try {
      const text = await callBkaZi(
        [{ role: "user", content: `Create a detailed ${days}-day study schedule for a ${user.role} studying: "${topic}". Include daily topics, time allocations, revision days, and tips. Format it clearly with days as headers.` }],
        "You are BkaZi, an expert educational planner. Create realistic, structured study schedules. Use day headers (Day 1:, Day 2: etc), bullet points for activities, and include estimated times."
      );
      setPlan(text);
    } catch { setPlan("Couldn't generate schedule. Please try again."); }
    setLoading(false);
  };

  const todaySchedule = [
    { time: "09:00", subject: "Mathematics", topic: "Quadratic Equations", duration: "45m", color: "#6c63ff" },
    { time: "10:00", subject: "Science", topic: "Photosynthesis Review", duration: "30m", color: "#00d9b8" },
    { time: "14:00", subject: "Physics", topic: "Newton's Laws", duration: "60m", color: "#38bdf8" },
    { time: "16:30", subject: "Coding", topic: "JavaScript Promises", duration: "45m", color: "#a78bfa" },
  ];

  return (
    <div style={{ padding: 28, maxWidth: 900, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }} className="fade-up">
      <div>
        <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 6 }}>📅 Today's Schedule</h2>
        <p style={{ color: "var(--muted)", marginBottom: 20, fontSize: 13 }}>April 28, 2026</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {todaySchedule.map((s, i) => (
            <Card key={i} style={{ display: "flex", gap: 14, alignItems: "center" }}>
              <div style={{ textAlign: "center", minWidth: 50 }}>
                <div style={{ fontFamily: "var(--mono)", fontSize: 13, fontWeight: 700, color: s.color }}>{s.time}</div>
              </div>
              <div style={{ width: 3, alignSelf: "stretch", background: s.color, borderRadius: 2 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{s.topic}</div>
                <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>{s.subject} · {s.duration}</div>
              </div>
              <Badge color={s.color}>{s.duration}</Badge>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 6 }}>✦ AI Study Planner</h2>
        <p style={{ color: "var(--muted)", marginBottom: 20, fontSize: 13 }}>Generate a personalized study plan for any topic.</p>

        <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
          <input value={topic} onChange={e => setTopic(e.target.value)} onKeyDown={e => e.key === "Enter" && generate()}
            placeholder="Topic to study..." style={{ flex: 1, background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 10, padding: "10px 14px", color: "var(--text)", fontSize: 13 }} />
          <select value={days} onChange={e => setDays(Number(e.target.value))} style={{ background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 10, padding: "10px 12px", color: "var(--text)", fontSize: 13 }}>
            {[3, 5, 7, 14, 30].map(d => <option key={d} value={d}>{d}d</option>)}
          </select>
          <button onClick={generate} disabled={!topic.trim() || loading} style={{ padding: "10px 16px", borderRadius: 10, background: "linear-gradient(135deg,var(--accent),var(--accent2))", color: "#fff", fontWeight: 700, fontSize: 13, boxShadow: "var(--glow)" }}>
            {loading ? <Spinner size={14} color="#fff" /> : "Plan ✦"}
          </button>
        </div>

        {plan && (
          <Card style={{ maxHeight: 380, overflowY: "auto", fontSize: 13, lineHeight: 1.8 }}>
            <div style={{ whiteSpace: "pre-wrap", color: "var(--text)" }}>{plan}</div>
          </Card>
        )}
        {loading && <div style={{ textAlign: "center", padding: 24 }}><Spinner size={24} /><div style={{ color: "var(--muted)", marginTop: 10, fontSize: 13 }}>Crafting your personalized plan...</div></div>}
        {!plan && !loading && (
          <Card style={{ textAlign: "center", padding: 30, color: "var(--muted)", fontSize: 13 }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>📅</div>
            Enter a topic and generate your AI-powered study plan
          </Card>
        )}
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState("home");

  if (!user) return (
    <>
      <GlobalStyle />
      <LoginScreen onLogin={setUser} />
    </>
  );

  const pages = {
    home: <Dashboard user={user} setPage={setPage} />,
    notes: <NotesPage user={user} />,
    chat: <ChatPage user={user} />,
    exam: <ExamPage user={user} />,
    flashcards: <FlashcardsPage user={user} />,
    progress: <ProgressPage user={user} />,
    schedule: <SchedulePage user={user} />,
  };

  return (
    <>
      <GlobalStyle />
      <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
        <Sidebar active={page} setActive={setPage} user={user} />
        <main style={{ flex: 1, overflowY: "auto", background: "var(--bg)", position: "relative" }}>
          <div className="orb" style={{ width: 500, height: 500, background: "var(--accent)", top: -200, right: -200, opacity: 0.08 }} />
          <div className="orb" style={{ width: 400, height: 400, background: "var(--accent2)", bottom: -150, left: -150, opacity: 0.06, animationDelay: "4s" }} />
          <div style={{ position: "relative", zIndex: 1, minHeight: "100%", display: page === "chat" ? "flex" : "block", flexDirection: "column" }}>
            {pages[page]}
          </div>
        </main>
      </div>
    </>
  );
}
