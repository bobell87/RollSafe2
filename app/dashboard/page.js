COPY:
"use client";

import { useEffect, useMemo, useState } from "react";

const LS_KEY = "rollsafe_onefile_v1";

const SEED = {
  profile: { driverName: "VALUED DRIVER" },
  pinHash: null, // demo only
  inspectionUnlocked: false,
  allowlist: ["cdl", "med", "ins", "reg"],
  docs: [
    { id: "cdl", title: "CDL", category: "Identity", tags: ["required", "inspection"], expDate: "2026-10-12", fileDataUrl: null },
    { id: "med", title: "Medical Card", category: "Medical", tags: ["required", "inspection"], expDate: "2026-03-01", fileDataUrl: null },
    { id: "ins", title: "Insurance / COI", category: "Insurance", tags: ["inspection"], expDate: "2026-01-25", fileDataUrl: null },
    { id: "reg", title: "Registration", category: "Vehicle", tags: ["inspection"], expDate: "2026-08-30", fileDataUrl: null },
    { id: "bol", title: "BOLs", category: "Loads", tags: ["docs"], expDate: null, fileDataUrl: null },
  ],
};

function loadState() {
  if (typeof window === "undefined") return SEED;
  const raw = localStorage.getItem(LS_KEY);
  if (!raw) {
    localStorage.setItem(LS_KEY, JSON.stringify(SEED));
    return SEED;
  }
  try {
    return JSON.parse(raw);
  } catch {
    localStorage.setItem(LS_KEY, JSON.stringify(SEED));
    return SEED;
  }
}

function saveState(s) {
  localStorage.setItem(LS_KEY, JSON.stringify(s));
}

function hashPin(pin) {
  // demo-only. Phase 2: real hash + server check.
  return btoa(pin);
}

function daysUntil(dateStr) {
  if (!dateStr) return null;
  const now = new Date();
  const d = new Date(dateStr + "T00:00:00");
  return Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function statusFor(expDate) {
  const du = daysUntil(expDate);
  if (du === null) return { level: "unknown", label: "Unknown" };
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
  }[level] || ["#14141c", "#2a2a3a", "#d0d0e8"];
  return (
    <span style={{ padding: "6px 10px", borderRadius: 999, background: m[0], border: `1px solid ${m[1]}`, color: m[2], fontSize: 12, fontWeight: 800 }}>
      {text}
    </span>
  );
}

export default function RollSafeOneFile() {
  const [tab, setTab] = useState("dashboard"); // dashboard | docs | inspection | assistant | settings
  const [s, setS] = useState(SEED);

  // Docs UI
  const [q, setQ] = useState("");
  const [activeDocId, setActiveDocId] = useState(null);

  // PIN UI
  const [pin, setPin] = useState("");

  // GPS UI
  const [pos, setPos] = useState(null);
  const [gpsErr, setGpsErr] = useState(null);

  useEffect(() => {
    setS(loadState());
  }, []);

  function update(mut) {
    const next = mut(structuredClone(s));
    setS(next);
    saveState(next);
  }

  const docs = useMemo(() => s.docs || [], [s.docs]);

  const filteredDocs = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return docs;
    return docs.filter((d) =>
      (d.title || "").toLowerCase().includes(t) ||
      (d.category || "").toLowerCase().includes(t) ||
      (d.tags || []).join(" ").toLowerCase().includes(t)
    );
  }, [docs, q]);

  const activeDoc = useMemo(() => docs.find(d => d.id === activeDocId) || null, [docs, activeDocId]);

  const counts = useMemo(() => {
    return docs.reduce((acc, d) => {
      const st = statusFor(d.expDate).level;
      acc[st] = (acc[st] || 0) + 1;
      return acc;
    }, {});
  }, [docs]);

  const priority = useMemo(() => {
    const sorted = [...docs].sort((a, b) => {
      const da = daysUntil(a.expDate) ?? 99999;
      const db = daysUntil(b.expDate) ?? 99999;
      return da - db;
    });
    return sorted.slice(0, 3);
  }, [docs]);

  async function attachFile(docId, file) {
    if (!file) return;
    if (file.size > 7 * 1024 * 1024) {
      alert("File too big for demo (keep it under ~7MB).");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      update((st) => {
        const d = st.docs.find(x => x.id === docId);
        if (d) d.fileDataUrl = reader.result;
        return st;
      });
    };
    reader.readAsDataURL(file);
  }

  function refreshGPS() {
    setGpsErr(null);
    setPos(null);
    if (!navigator.geolocation) {
      setGpsErr("GPS not supported.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setPos({
          lat: p.coords.latitude,
          lon: p.coords.longitude,
          accuracy: Math.round(p.coords.accuracy),
        });
      },
      (e) => setGpsErr(e.message || "GPS error"),
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 4000 }
    );
  }

  function savePin() {
    if (pin.length < 4) return alert("Use at least 4 digits (6 recommended).");
    update((st) => {
      st.pinHash = hashPin(pin);
      st.inspectionUnlocked = false;
      return st;
    });
    setPin("");
    alert("PIN saved.");
  }

  function unlockInspection() {
    if (!s.pinHash) return alert("Set a PIN in Settings first.");
    if (hashPin(pin) !== s.pinHash) {
      setPin("");
      return alert("Wrong PIN.");
    }
    update((st) => { st.inspectionUnlocked = true; return st; });
    setPin("");
  }

  function exitInspection() {
    const attempt = prompt("Enter PIN to exit inspection:");
    if (!attempt) return;
    if (!s.pinHash) return;
    if (hashPin(attempt) !== s.pinHash) return alert("Wrong PIN.");
    update((st) => { st.inspectionUnlocked = false; return st; });
  }

  function toggleAllow(id) {
    update((st) => {
      const set = new Set(st.allowlist || []);
      if (set.has(id)) set.delete(id);
      else set.add(id);
      st.allowlist = [...set];
      return st;
    });
  }

  function resetDemo() {
    if (!confirm("Reset demo data?")) return;
    localStorage.removeItem(LS_KEY);
    const fresh = loadState();
    setS(fresh);
    setTab("dashboard");
    setQ("");
    setActiveDocId(null);
    setPin("");
    setPos(null);
    setGpsErr(null);
  }

  const container = (
    <div style={UI.page}>
      <div style={UI.header}>
        <div>
          <div style={UI.brand}>RollSafe</div>
          <div style={UI.sub}>Driver Vault + Inspection + Assistant</div>
        </div>
        <Pill level="unknown" text="ONE-FILE DEMO" />
      </div>

      {tab === "dashboard" && (
        <div style={{ display: "grid", gap: 12 }}>
          <div style={UI.card}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
              <div>
                <div style={UI.h2}>Compliance Summary</div>
                <div style={UI.muted}>Green / Yellow / Red at a glance</div>
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
                <Pill level="good" text={`Good ${counts.good || 0}`} />
                <Pill level="warn" text={`Soon ${counts.warn || 0}`} />
                <Pill level="bad" text={`Bad ${counts.bad || 0}`} />
              </div>
            </div>
          </div>

          <div style={UI.card}>
            <div style={UI.h2}>Priority Items</div>
            <div style={UI.muted}>Most urgent expirations</div>
            <div style={{ marginTop: 10, display: "grid", gap: 10 }}>
              {priority.map((d) => {
                const st = statusFor(d.expDate);
                const du = daysUntil(d.expDate);
                return (
                  <div key={d.id} style={UI.row}>
                    <div>
                      <div style={{ fontWeight: 900 }}>{d.title}</div>
                      <div style={UI.muted}>Exp: {d.expDate || "—"} {du !== null ? `(${du}d)` : ""}</div>
                    </div>
                    <Pill level={st.level} text={st.label} />
                  </div>
                );
              })}
            </div>
          </div>

          <div style={UI.card}>
            <div style={UI.h2}>Quick Actions</div>
            <div style={UI.muted}>Tap a tab below (Docs / Inspection / Assistant)</div>
          </div>
        </div>
      )}

      {tab === "docs" && (
        <div style={{ display: "grid", gap: 12 }}>
          <div style={UI.card}>
            <div style={UI.h2}>Documents</div>
            <div style={UI.muted}>Take a photo or upload a file (stored locally for demo)</div>
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search title, category, tags…" style={UI.input} />
          </div>

          <div style={{ display: "grid", gap: 10 }}>
            {filteredDocs.map((d) => {
              const st = statusFor(d.expDate);
              return (
                <button key={d.id} onClick={() => setActiveDocId(d.id)} style={UI.cardBtn}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                    <div>
                      <div style={{ fontWeight: 900 }}>{d.title}</div>
                      <div style={UI.muted}>{d.category} • {(d.tags || []).join(", ")}</div>
                      <div style={UI.muted}>Exp: {d.expDate || "—"}</div>
                    </div>
                    <div style={{ display: "grid", gap: 8, justifyItems: "end" }}>
                      <Pill level={st.level} text={st.label} />
                      <span style={UI.pillSmall}>{d.fileDataUrl ? "Photo ✅" : "No photo"}</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {activeDoc && (
            <div style={UI.card}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                <div>
                  <div style={UI.h2}>{activeDoc.title}</div>
                  <div style={UI.muted}>{activeDoc.category}</div>
                </div>
                <button onClick={() => setActiveDocId(null)} style={UI.btn}>Close</button>
              </div>

              <div style={{ marginTop: 10 }}>
                {activeDoc.fileDataUrl ? (
                  <img src={activeDoc.fileDataUrl} alt="doc" style={UI.img} />
                ) : (
                  <div style={UI.muted}>No photo yet. Use Camera below.</div>
                )}
              </div>

              <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
                <label style={UI.btnWide}>
                  Upload File
                  <input type="file" style={{ display: "none" }} onChange={(e) => attachFile(activeDoc.id, e.target.files?.[0])} />
                </label>

                <label style={UI.btnWidePrimary}>
                  Take Photo (Camera)
                  <input type="file" accept="image/*" capture="environment" style={{ display: "none" }} onChange={(e) => attachFile(activeDoc.id, e.target.files?.[0])} />
                </label>
              </div>
            </div>
          )}
        </div>
      )}

      {tab === "inspection" && (
        <div style={{ display: "grid", gap: 12 }}>
          {!s.pinHash && (
            <div style={UI.card}>
              <div style={UI.h2}>Set a PIN first</div>
              <div style={UI.muted}>Go to Settings tab → save a PIN.</div>
            </div>
          )}

          {s.pinHash && !s.inspectionUnlocked && (
            <div style={UI.card}>
              <div style={UI.h2}>Unlock Inspection Mode</div>
              <div style={UI.muted}>Officer-safe view (allowlisted docs only)</div>
              <input value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))} placeholder="Enter PIN" style={UI.input} />
              <button onClick={unlockInspection} style={UI.btnWidePrimary}>Unlock</button>
            </div>
          )}

          {s.pinHash && s.inspectionUnlocked && (
            <>
              <div style={UI.banner}>
                <div>
                  <div style={{ fontWeight: 1000 }}>INSPECTION VIEW (READ-ONLY)</div>
                  <div style={{ opacity: 0.8, fontSize: 13 }}>Only allowlisted docs show here. Exit requires PIN.</div>
                </div>
                <button onClick={exitInspection} style={UI.btnDanger}>Exit (PIN)</button>
              </div>

              <div style={UI.card}>
                <div style={UI.h2}>Allowlisted Docs</div>
                <div style={UI.muted}>Tap a doc in Docs tab to add a photo</div>

                <div style={{ marginTop: 10, display: "grid", gap: 10 }}>
                  {docs.filter(d => (s.allowlist || []).includes(d.id)).map((d) => (
                    <div key={d.id} style={UI.rowBlock}>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
                        <div>
                          <div style={{ fontWeight: 900 }}>{d.title}</div>
                          <div style={UI.muted}>Exp: {d.expDate || "—"}</div>
                        </div>
                        <span style={UI.pillSmall}>{d.fileDataUrl ? "Preview ✅" : "No photo"}</span>
                      </div>
                      {d.fileDataUrl ? <img src={d.fileDataUrl} alt="doc" style={UI.img} /> : null}
                    </div>
                  ))}
                </div>
              </div>

              <div style={UI.card}>
                <div style={UI.h2}>Allowlist Admin</div>
                <div style={UI.muted}>Choose what officers can see</div>
                <div style={{ marginTop: 10, display: "grid", gap: 10 }}>
                  {docs.map((d) => {
                    const on = (s.allowlist || []).includes(d.id);
                    return (
                      <button key={d.id} onClick={() => toggleAllow(d.id)} style={UI.toggle}>
                        <div>
                          <div style={{ fontWeight: 900 }}>{d.title}</div>
                          <div style={UI.muted}>{d.category}</div>
                        </div>
                        <span style={on ? UI.on : UI.off}>{on ? "ON" : "OFF"}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {tab === "assistant" && (
        <div style={{ display: "grid", gap: 12 }}>
          <div style={UI.card}>
            <div style={UI.h2}>Assistant (GPS)</div>
            <div style={UI.muted}>This is the free GPS start. Safety datasets come later.</div>
            <button onClick={refreshGPS} style={UI.btnWidePrimary}>Refresh GPS</button>

            {gpsErr ? <div style={{ marginTop: 10, color: "#ffb4b4" }}>Error: {gpsErr}</div> : null}

            {pos ? (
              <div style={{ marginTop: 10, display: "grid", gap: 6 }}>
                <div>Lat: <b>{pos.lat.toFixed(6)}</b></div>
                <div>Lon: <b>{pos.lon.toFixed(6)}</b></div>
                <div>Accuracy: <b>{pos.accuracy}m</b></div>
              </div>
            ) : (
              <div style={{ marginTop: 10, opacity: 0.75 }}>Tap Refresh GPS to pull your location.</div>
            )}
          </div>

          <div style={UI.card}>
            <div style={UI.h2}>Trip Safety (Shell)</div>
            <div style={UI.muted}>
              These are placeholders until we wire open datasets. Label this advisory.
            </div>

            <div style={{ marginTop: 10, display: "grid", gap: 10 }}>
              {[
                "Truck-restricted roads",
                "Low bridges",
                "Weight limits",
                "No-truck zones",
                "Parking risk / dead-end risk",
              ].map((x) => (
                <div key={x} style={UI.rowBlock}>
                  <div style={{ fontWeight: 900 }}>{x}</div>
                  <div style={UI.muted}>Data integration later</div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 10, opacity: 0.75, fontSize: 12 }}>
              Advisory only. Not guaranteed routing safety.
            </div>
          </div>
        </div>
      )}

      {tab === "settings" && (
        <div style={{ display: "grid", gap: 12 }}>
          <div style={UI.card}>
            <div style={UI.h2}>Settings</div>
            <div style={UI.muted}>Set PIN for Inspection Mode + reset demo</div>

            <div style={{ marginTop: 10 }}>
              <div style={{ fontWeight: 900 }}>Inspection PIN</div>
              <div style={UI.muted}>{s.pinHash ? "PIN is set (you can change it)." : "No PIN set yet."}</div>
              <input value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))} placeholder="New PIN (numbers only)" style={UI.input} />
              <button onClick={savePin} style={UI.btnWidePrimary}>Save PIN</button>
            </div>

            <div style={{ marginTop: 12 }}>
              <button onClick={resetDemo} style={UI.btnDangerWide}>Reset Demo Data</button>
            </div>
          </div>
        </div>
      )}

      <div style={UI.nav}>
        <NavBtn label="Dashboard" active={tab === "dashboard"} onClick={() => setTab("dashboard")} />
        <NavBtn label="Docs" active={tab === "docs"} onClick={() => setTab("docs")} />
        <NavBtn label="Inspection" active={tab === "inspection"} onClick={() => setTab("inspection")} />
        <NavBtn label="Assistant" active={tab === "assistant"} onClick={() => setTab("assistant")} />
        <NavBtn label="Settings" active={tab === "settings"} onClick={() => setTab("settings")} />
      </div>
    </div>
  );

  return container;
}

function NavBtn({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "10px 10px",
        borderRadius: 12,
        border: "1px solid #2a2a3a",
        background: active ? "#1f1f2b" : "transparent",
        color: "white",
        fontWeight: 900,
        fontSize: 12,
      }}
    >
      {label}
    </button>
  );
}

const UI = {
  page: {
    padding: 18,
    paddingBottom: 90,
    background: "#0a0a0e",
    color: "#f5f5ff",
    minHeight: "100vh",
    fontFamily: "system-ui",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    gap: 10,
    alignItems: "center",
    marginBottom: 14,
    border: "1px solid #2a2a3a",
    background: "#14141c",
    borderRadius: 16,
    padding: 14,
  },
  brand: { fontSize: 22, fontWeight: 1000, letterSpacing: -0.3 },
  sub: { opacity: 0.7, marginTop: 4, fontSize: 13 },
  h2: { fontSize: 16, fontWeight: 1000 },
  muted: { opacity: 0.75, fontSize: 13, marginTop: 6 },
  card: { padding: 14, borderRadius: 16, border: "1px solid #2a2a3a", background: "#14141c" },
  cardBtn: { width: "100%", textAlign: "left", padding: 14, borderRadius: 16, border: "1px solid #2a2a3a", background: "#14141c", color: "white" },
  row: { display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center", border: "1px solid #2a2a3a", background: "#0f0f16", borderRadius: 14, padding: 12, marginTop: 10 },
  rowBlock: { border: "1px solid #2a2a3a", background: "#0f0f16", borderRadius: 14, padding: 12 },
  input: { width: "100%", padding: 12, borderRadius: 12, border: "1px solid #2a2a3a", background: "#0f0f16", color: "white", marginTop: 10 },
  btn: { padding: "10px 12px", borderRadius: 12, border: "1px solid #2a2a3a", background: "#1f1f2b", color: "white", fontWeight: 900 },
  btnWide: { width: "100%", padding: 14, borderRadius: 12, border: "1px solid #2a2a3a", background: "#1f1f2b", color: "white", fontWeight: 1000, textAlign: "center", cursor: "pointer" },
  btnWidePrimary: { width: "100%", padding: 14, borderRadius: 12, border: "1px solid #1f6a4f", background: "#0f241b", color: "#b8ffe1", fontWeight: 1000, textAlign: "center", cursor: "pointer", marginTop: 10 },
  btnDanger: { padding: "10px 12px", borderRadius: 12, border: "1px solid #7a2a2a", background: "#2a1010", color: "#ffb4b4", fontWeight: 1000 },
  btnDangerWide: { width: "100%", padding: 14, borderRadius: 12, border: "1px solid #7a2a2a", background: "#2a1010", color: "#ffb4b4", fontWeight: 1000 },
  pillSmall: { padding: "6px 10px", borderRadius: 999, background: "#1f1f2b", border: "1px solid #2a2a3a", fontSize: 12, fontWeight: 900, width: "fit-content" },
  img: { width: "100%", borderRadius: 14, border: "1px solid #2a2a3a", marginTop: 10 },
  toggle: { width: "100%", textAlign: "left", padding: 12, borderRadius: 14, border: "1px solid #2a2a3a", background: "#0f0f16", color: "white", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 },
  on: { padding: "8px 12px", borderRadius: 999, border: "1px solid #1f6a4f", background: "#0f241b", color: "#b8ffe1", fontWeight: 1000, fontSize: 12 },
  off: { padding: "8px 12px", borderRadius: 999, border: "1px solid #2a2a3a", background: "#14141c", color: "#d0d0e8", fontWeight: 1000, fontSize: 12 },
  banner: { padding: 14, borderRadius: 16, border: "1px solid #1f6a4f", background: "#0f241b", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 },
  nav: {
    position: "fixed",
    left: 16,
    right: 16,
    bottom: 16,
    display: "grid",
    gridTemplateColumns: "repeat(5, 1fr)",
    gap: 8,
    padding: 10,
    borderRadius: 18,
    border: "1px solid #2a2a3a",
    background: "rgba(20,20,28,0.92)",
    backdropFilter: "blur(10px)",
  },
};
