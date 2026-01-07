"use client";

import Link from "next/link";

export default function Home() {
  return (
    <div
      style={{
        minHeight: "100vh",
        padding: 18,
        background: "#0a0a0e",
        color: "#f5f5ff",
        fontFamily: "system-ui",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 14,
          padding: 14,
          border: "1px solid #2a2a3a",
          borderRadius: 16,
          background: "#14141c",
        }}
      >
        <div>
          <div style={{ fontSize: 24, fontWeight: 900 }}>RollSafe</div>
          <div style={{ opacity: 0.7 }}>Driver Dashboard</div>
        </div>
        <span
          style={{
            padding: "6px 10px",
            borderRadius: 999,
            background: "#0f241b",
            border: "1px solid #1f6a4f",
            color: "#b8ffe1",
            fontWeight: 800,
            fontSize: 12,
          }}
        >
          LIVE
        </span>
      </div>

      <div
        style={{
          padding: 16,
          borderRadius: 16,
          border: "1px solid #2a2a3a",
          background: "#14141c",
          marginBottom: 16,
        }}
      >
        <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 6 }}>
          Dashboard
        </div>
        <div style={{ opacity: 0.75, fontSize: 14 }}>
          This is the main landing page. If you see this, routing is fixed.
        </div>
      </div>

      <Link
        href="/documents"
        style={{
          display: "block",
          padding: 16,
          borderRadius: 18,
          border: "1px solid #2a2a3a",
          background: "#14141c",
          color: "white",
          textDecoration: "none",
          textAlign: "center",
          fontWeight: 700,
        }}
      >
        Go to Documents
      </Link>
    </div>
  );
}
