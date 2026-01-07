"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

const KEY = "rollsafe_docs_v1";

const seedDocs = [
  { id: "cdl", title: "CDL", category: "Identity", tags: ["required", "inspection"], expDate: "2026-10-12", fileDataUrl: null },
  { id: "med", title: "Medical Card", category: "Medical", tags: ["required", "inspection"], expDate: "2026-03-01", fileDataUrl: null },
  { id: "ins", title: "Insurance / COI", category: "Insurance", tags: ["inspection"], expDate: "2026-01-25", fileDataUrl: null },
  { id: "reg", title: "Registration", category: "Vehicle", tags: ["inspection"], expDate: "2026-08-30", fileDataUrl: null }
];

function loadDocs() {
  if (typeof window === "undefined") return seedDocs;
  const raw = localStorage.getItem(KEY);
  if (!raw) {
    localStorage.setItem(KEY, JSON.stringify(seedDocs));
    return seedDocs;
  }
  return JSON.parse(raw);
}

function saveDocs(docs) {
  localStorage.setItem(KEY, JSON.stringify(docs));
}

export default function DocumentsPage() {
  const [docs, setDocs] = useState([]);
  const [q, setQ] = useState("");
  const [activeId, setActiveId] = useState(null);

  useEffect(() => {
    setDocs(loadDocs());
  }, []);

  const activeDoc = useMemo(() => docs.find(d => d.id === activeId), [docs, activeId]);

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return docs;
    return docs.filter(d =>
      d.title.toLowerCase().includes(t) ||
      d.category.toLowerCase().includes(t) ||
      (d.tags || []).join(" ").toLowerCase().includes(t)
    );
  }, [docs, q]);

  async function attachFile(docId, file) {
    if (!file) return;

    // guard: keep local demo from exploding on huge files
    if (file.size > 6 * 1024 * 1024) {
      alert("File too big for demo (max ~6MB).");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const next = docs.map(d => d.id === docId ? { ...d, fileDataUrl: reader.result } : d);
      setDocs(next);
      saveDocs(next);
      alert("Saved (demo stores locally).");
    };
    reader.readAsDataURL(file);
  }

  return (
    <div style={S.page}>
      <header style={S.header}>
        <div>
          <div style={S.title}>Documents</div>
          <div style={S.sub}>Search + upload + preview (demo)</div>
        </div>
        <Link href="/dashboard" style={S.btn}>Back</Link>
      </header>

      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search title, category, tags…"
        style={S.input}
      />

      <div style={{ display: "grid", gap: 12 }}>
        {filtered.map((d) => (
          <button key={d.id} onClick={() => setActiveId(d.id)} style={S.card}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              <div>
                <div style={{ fontWeight: 800 }}>{d.title}</div>
                <div style={S.muted}>{d.category} • {(d.tags || []).join(", ")}</div>
                <div style={S.muted}>Exp: {d.expDate || "—"}</div>
              </div>
              <div style={S.pill}>{d.fileDataUrl ? "File ✅" : "No file"}</div>
            </div>
          </button>
        ))}
      </div>

      {activeDoc ? (
        <div style={{ marginTop: 16 }}>
          <div style={S.card}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
              <div>
                <div style={{ fontWeight: 900, fontSize: 18 }}>{activeDoc.title}</div>
                <div style={S.muted}>{activeDoc.category}</div>
              </div>
              <button onClick={() => setActiveId(null)} style={S.btn}>Close</button>
            </div>

            <div style={{ marginTop: 12 }}>
              {activeDoc.fileDataUrl ? (
                <img src={activeDoc.fileDataUrl} alt="doc" style={S.img} />
              ) : (
                <div style={S.muted}>No file yet. Upload a photo/PDF to attach.</div>
              )}
            </div>

            <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
              <label style={S.btnWide}>
                Choose File
                <input
                  type="file"
                  style={{ display: "none" }}
                  onChange={(e) => attachFile(activeDoc.id, e.target.files?.[0])}
                />
              </label>

              <label style={S.btnWide}>
                Camera (mobile)
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  style={{ display: "none" }}
                  onChange={(e) => attachFile(activeDoc.id, e.target.files?.[0])}
                />
              </label>
            </div>

          </div>
        </div>
      ) : null}
    </div>
  );
}

const S = {
  page: { padding: 20, background: "#0a0a0e", color: "#f5f5ff", minHeight: "100vh", fontFamily: "system-ui" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 14 },
  title: { fontSize: 26, fontWeight: 900 },
  sub: { opacity: 0.7, marginTop: 4 },
  input: { width: "100%", padding: 12, borderRadius: 10, border: "1px solid #2a2a3a", background: "#14141c", color: "white", marginBottom: 14 },
  card: { width: "100%", textAlign: "left", padding: 14, borderRadius: 12, border: "1px solid #2a2a3a", background: "#14141c", color: "white" },
  btn: { padding: "10px 12px", borderRadius: 10, background: "#1f1f2b", color: "white", textDecoration: "none", border: "1px solid #2a2a3a", fontWeight: 700 },
  btnWide: { padding: 14, borderRadius: 10, background: "#1f1f2b", color: "white", border: "1px solid #2a2a3a", fontWeight: 800, textAlign: "center", cursor: "pointer" },
  muted: { opacity: 0.75, fontSize: 13, marginTop: 4 },
  pill: { padding: "6px 10px", borderRadius: 999, background: "#1f1f2b", border: "1px solid #2a2a3a", fontSize: 12, height: "fit-content" },
  img: { width: "100%", borderRadius: 12, border: "1px solid #2a2a3a" }
};
