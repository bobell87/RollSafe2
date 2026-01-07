"use client";

import Link from "next/link";

export default function Dashboard() {
  return (
    <div style={styles.page}>
      <h1 style={styles.title}>RollSafe</h1>
      <p style={styles.subtitle}>
        Driver Vault + Inspection Mode
      </p>

      <div style={styles.card}>
        <h2>Compliance Status</h2>
        <ul>
          <li>CDL – ✅ Good</li>
          <li>Medical Card – ⚠️ Expiring</li>
          <li>Insurance – ❌ Expired</li>
        </ul>
      </div>

      <div style={styles.grid}>
        <Link href="/documents" style={styles.button}>Documents</Link>
        <Link href="/inspection" style={styles.button}>Inspection Mode</Link>
        <Link href="/assistant" style={styles.button}>Assistant</Link>
        <Link href="/settings" style={styles.button}>Settings</Link>
      </div>
    </div>
  );
}

const styles = {
  page: {
    padding: 20,
    fontFamily: "system-ui",
    background: "#0a0a0e",
    color: "#f5f5ff",
    minHeight: "100vh"
  },
  title: {
    fontSize: 32,
    fontWeight: 800
  },
  subtitle: {
    opacity: 0.7,
    marginBottom: 20
  },
  card: {
    background: "#14141c",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 12
  },
  button: {
    background: "#1f1f2b",
    padding: 14,
    borderRadius: 10,
    textAlign: "center",
    textDecoration: "none",
    color: "white",
    fontWeight: 600
  }
};
