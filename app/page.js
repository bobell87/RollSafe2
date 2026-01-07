COPY:
"use client";

import Link from "next/link";

export default function Home() {
  return (
    <div style={UI.page}>
      <div style={UI.header}>
        <div>
          <div style={UI.brand}>RollSafe</div>
          <div style={UI.sub}>Driver Vault + Inspection + Assistant (demo)</div>
        </div>
        <span style={UI.badge}>LIVE</span>
      </div>

      <div style={UI.card}>
        <div style={UI.h2}>Dashboard</div>
        <div style={UI.muted}>
          Start here. Then go to Documents to take pics, Assistant for GPS, Inspection for PIN mode.
        </div>
      </div>

      <div style={{ display: "grid", gap: 12, marginTop: 12 }}>
        <Link href="/documents" style={UI.bigBtn}>
          Documents (Take Photo)
          <div style={UI.btnSub}>Camera upload + preview</div>
        </Link>

        <Link href="/assistant" style={UI.bigBtn}>
          Assistant (GPS)
          <div style={UI.btnSub}>Location + safety placeholders</div>
        </Link>

        <Link href="/inspection" style={UI.bigBtn}>
          Inspection Mode
          <div style={UI.btnSub}>PIN gate + allowlist (next)</div>
        </Link>
      </div>

      <div style={UI.footerNote}>
        If you still keep landing on the doc screen, you’re on <b>/documents</b>. Home is <b>/</b>.
      </div>
    </div>
  );
}

const UI = {
  page: {
    padding: 18,
    minHeight: "100vh",
    background: "#0a0a0e",
    color: "#f5f5ff",
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
  brand: { fontSize: 24, fontWeight: 1000, letterSpacing: -0.3 },
  sub: { opacity: 0.7, marginTop: 4, fontSize: 13 },
  badge: {
    padding: "6px 10px",
    borderRadius: 999,
    background: "#0f241b",
    border: "1px solid #1f6a4f",
    color: "#b8ffe1",
    fontWeight: 1000,
    fontSize: 12,
  },
  card: { padding: 14, borderRadius: 16, border: "1px solid #2a2a3a", background: "#14141c" },
  h2: { fontSize: 16, fontWeight: 1000 },
  muted: { opacity: 0.75, fontSize: 13, marginTop: 6 },
  bigBtn: {
    display: "block",
    padding: 16,
    borderRadius: 18,
    border: "1px solid #2a2a3a",
    background: "#14141c",
    color: "white",
    textDecoration: "none",
    fontWeight: 1000,
    fontSize: 16,
  },
  btnSub: { opacity: 0.75, fontSize: 13, marginTop: 6, fontWeight: 600 },
  footerNote: { marginTop: 18, opacity: 0.7, fontSize: 12 },
};

