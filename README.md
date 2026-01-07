COPY:
# RollSafe — Driver Vault + Inspection Mode

RollSafe is a mobile-first web app for truck drivers, owner-operators, and small fleets.

It’s a **digital glove box** for compliance documents with a locked-down **Inspection Mode** (PIN + allowlist) and a simple **Driver Assistant** (GPS awareness).

---

## What this repo is (Phase 1)
This is the **demo/MVP UI build**:
- Premium dark “glass” UI
- Document Vault (stored in browser localStorage for demo)
- Compliance status (Good / Expiring / Expired)
- Inspection Mode (PIN unlock + allowlisted docs only + read-only)
- Assistant page (browser GPS + warning placeholders)
- Settings (set/change PIN + reset demo)

No backend yet. No paid APIs.

---

## Screens
- **Dashboard**: compliance summary + priority items + quick actions  
- **Documents**: search + upload + preview docs  
- **Inspection**: PIN gate + allowlist + officer-safe view  
- **Assistant**: GPS location + “Am I safe here?” placeholder warnings  
- **Settings**: PIN + reset demo data  

---

## Tech Stack
- Next.js (App Router) + React
- Tailwind CSS
- JavaScript
- LocalStorage (Phase 1 demo)
- Later: Supabase (auth + storage + DB)

---

## How to run locally
1) Install Node.js (LTS)
2) In a terminal:

```bash
npm install
npm run dev
