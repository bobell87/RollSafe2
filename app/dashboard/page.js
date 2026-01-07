COPY:
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

const LS_KEY = "rollsafe_docs_v1";

const SEED_DOCS = [
  { id: "cdl", title: "CDL", category: "Identity", tags: ["required", "inspection"], exp: "2026-10-12", photo: null },
  { id: "med", title: "Medical Card", category: "Medical", tags: ["required", "inspection"], exp: "2026-03-01", photo: null },
  { id: "ins", title: "Insurance / COI", category: "Insurance", tags: ["inspection"], exp: "2026-01-25", photo: null },
  { id: "reg", title: "Registration", category: "Vehicle", tags: ["inspection"], exp: "2026-08-30", photo: null },
  { id: "bol", title: "BOLs", category: "Loads", tags: ["docs"], exp: null, photo: null },
];

function loadDocs() {
  if (typeof window === "undefined") return SEED_DOCS;
  const raw = localStorage.getItem(LS_KEY);
  if (!raw) {
    localStorage.setItem(LS_KEY, JSON.stringify(SEED_DOCS));
    return SEED_DOCS;
  }
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : SEED_DOCS;
  } catch {
    localStorage.setItem(LS_KEY, JSON.stringify(SEED_DOCS));
    return SEED_DOCS;
  }
}

function saveDocs(docs) {
  localStorage.setItem(LS_KEY, JSON.stringify(docs));
}

function daysUntil(dateStr) {
  if (!dateStr) return null;
  const now = new Date();
  const d = new Date(dateStr + "T00:00:00");
  return Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function status(exp) {
  const du = daysUntil(exp);
  if (du === null) return { level: "unknown", label: "No date" };
  if (du < 0) return { level: "bad", label: "Expired" };
  if (du <= 14) return { level: "warn", label: "Expiring" };
  return { level: "good", label: "Good" };
}

function Pill({ level, text }) {
  const m = {
    good: ["#0f241b", "#1f6a4f", "#b8ffe1"],
    warn: ["#2a210c", "#7a5a1a", "#ffe6a6"],
    bad: ["#2a1010", "#7a2a2a", "#ffb4b4"],
    unknown: ["#14141c", "#2a2a3a", "#d0d0e8"],
  }[level];
  return (
    <span style={{ padding: "6px 10px", borderRadius: 999, background: m[0], border: `1px solid ${m[1]}`, color: m[2], fontSize: 12, fontWeight: 900 }}>
      {text}
    </span>
  );
}

export default function DocumentsPage() {
  const [docs, setDocs] = useState(SEED_DOCS);
  const [q, setQ] = useState("");
  const [openId, setOpenId] = useState(null);

  useEffect(() => {
    setDocs(loadDocs());
  }, []);

  function update(mut) {
    const next = mut(structuredClone(docs));
    setDocs(next);
    saveDocs(next);
  }

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return docs;
    return docs.filter((d) =>
      d.title.toLowerCase().includes(t) ||
      (d.category || "").toLowerCase().includes(t) ||
      (d.tags || []).join(" ").toLowerCase().includes(t)
    );
  }, [docs, q]);

  const active = useMemo(() => docs.find(d => d.id === openId) || null, [docs, openId]);

  function attach(id, file) {
    if (!file) return;
    if (file.size > 7 * 1024 * 1024) return alert("Photo too big for demo. Keep it under ~7MB.");
    const r = new FileReader();
    r.onload = () => {
      update((st) => {
        const d = st.find(x => x.id === id);
        if (d) d.photo = r.result;
        return st;
      });
    };
    r.readAsDataURL(file);
  }

  function clearPhoto(id) {
    update((st) => {
      const d = st.find(x => x.id === id);
      if (d) d.photo = null;
      return st;
    });
  }

  return (
    <div style={UI.page}>
      <div style={UI.top}>
        <div>
          <div style={UI.h1}>Documents</div>
          <div style={UI.sub}>Search + camera upload + preview (local demo)</div>
        </div>

        <Link href="/" style={UI.btn}>Back</Link>
      </div>

      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search title, category, tags…"
        style={UI.input}
      />

      <div style={{ display: "grid", gap: 12, marginTop: 12 }}>
        {filtered.map((d) => {
          const st = status(d.exp);
          return (
            <button key={d.id} onClick={() => setOpenId(d.id)} style={UI.cardBtn}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                <div>
                  <div style={UI.title}>{d.title}</div>
                  <div style={UI.muted}>{d.category} • {(d.tags || []).join(", ")}</div>
                  <div style={UI.muted}>Exp: {d.exp || "—"}</div>
                </div>
                <div style={{ display: "grid", gap: 8, justifyItems: "end" }}>
                  <Pill level={st.level} text={st.label} />
                  <span style={UI.pillSmall}>{d.photo ? "Photo ✅" : "No photo"}</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {active && (
        <div style={UI.modal}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
            <div>
              <div style={UI.h2}>{active.title}</div>
              <div style={UI.muted}>{active.category}</div>
            </div>
            <button onClick={() => setOpenId(null)} style={UI.btn}>Close</button>
          </div>

          <div style={{ marginTop: 12 }}>
            {active.photo ? (
              <img src={active.photo} alt="doc" style={UI.img} />
            ) : (
              <div style={UI.muted}>No photo yet. Use Camera below.</div>
            )}
          </div>

          <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
            <label style={UI.btnWide}>
              Upload File
              <input type="file" style={{ display: "none" }} onChange={(e) => attach(active.id, e.target.files?.[0])} />
            </label>

            <label style={UI.btnWidePrimary}>
              Take Photo (Camera)
              <input
                type="file"
                accept="image/*"
                capture="environment"
                style={{ display: "none" }}
                onChange={(e) => attach(active.id, e.target.files?.[0])}
              />
            </label>

            {active.photo && (
              <button onClick={() => clearPhoto(active.id)} style={UI.btnDangerWide}>
                Remove Photo
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const UI = {
  page: { padding: 18, minHeight: "100vh", background: "#0a0a0e", color: "#f5f5ff", fontFamily: "system-ui" },
  top: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 12 },
  h1: { fontSize: 34, fontWeight: 1000, letterSpacing: -0.5 },
  sub: { opacity: 0.7, marginTop: 6, fontSize: 14 },
  h2: { fontSize: 18, fontWeight: 1000 },
  input: { width: "100%", padding: 14, borderRadius: 14, border: "1px solid #2a2a3a", background: "#14141c", color: "white" },
  cardBtn: { width: "100%", textAlign: "left", padding: 14, borderRadius: 18, border: "1px solid #2a2a3a", background: "#14141c", color: "white" },
  title: { fontWeight: 1000, fontSize: 18 },
  muted: { opacity: 0.75, fontSize: 13, marginTop: 6 },
  pillSmall: { padding: "6px 10px", borderRadius: 999, background: "#1f1f2b", border: "1px solid #2a2a3a", fontSize: 12, fontWeight: 900, width: "fit-content" },
  btn: { padding: "10px 12px", borderRadius: 14, border: "1px solid #2a2a3a", background: "#1f1f2b", color: "white", fontWeight: 900, textDecoration: "none" },
  modal: { marginTop: 16, padding: 14, borderRadius: 18, border: "1px solid #2a2a3a", background: "#14141c" },
  img: { width: "100%", borderRadius: 16, border: "1px solid #2a2a3a", marginTop: 10 },
  btnWide: { width: "100%", padding: 14, borderRadius: 14, border: "1px solid #2a2a3a", background: "#1f1f2b", color: "white", fontWeight: 1000, textAlign: "center", cursor: "pointer" },
  btnWidePrimary: { width: "100%", padding: 14, borderRadius: 14, border: "1px solid #1f6a4f", background: "#0f241b", color: "#b8ffe1", fontWeight: 1000, textAlign: "center", cursor: "pointer" },
  btnDangerWide: { width: "100%", padding: 14, borderRadius: 14, border: "1px solid #7a2a2a", background: "#2a1010", color: "#ffb4b4", fontWeight: 1000 },
};
