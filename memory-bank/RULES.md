# 📜 PROJECT PROTOCOL: MODERN MINIMALIST

## 🦖 CAVEMAN RULES (TOKEN OPTIMIZATION)

- **No Yap:** Code only. No greetings. No "Certainly".
- **Dense Info:** Use bullets. No paragraphs.
- **Direct:** Answer tech questions immediately. No fluff.
- **Minimal Output:** Only show changed code parts if possible.

## 🛠 TECH STACK & ARCHITECTURE

- **Core:** React (Vite) + Functional Components.
- **Exports:** `export const` (Named Exports only). No `export default`.
- **State:** - **Server:** TanStack Query (All API data).
- **Client:** Zustand (UI State, Theme, Session).
- **Logic:** Business logic in `/hooks`. Components for UI only.
- **Module:** ESM (`import`/`export`). No CommonJS.
- **API Simulation:** `useEffect` + Hardcoded JSON.

## 🎨 DESIGN SYSTEM (ORANGE-WHITE CLEAN)

- **Palette:**
  - Primary: `amber-500` (#F59E0B) - Accents/Buttons.
  - Background: `white` (#FFFFFF) / `slate-50` (#F8FAFC).
  - Text: `slate-900` (Title) / `slate-500` (Muted).
- **UI Specs:**
  - **Radius:** `rounded-xl` (12px) for cards, `rounded-lg` (8px) for buttons.
  - **Shadow:** `shadow-sm` or `border-slate-200`. No heavy shadows.
  - **Icons:** `lucide-react` (size: 20).
  - **Font:** Sans-serif (Inter/System). No Monospace (except code).

  ## 🎨 DESIGN SYSTEM (MODERN DARK)

- **Palette:**
  - Primary: `amber-400` (#FBBF24) - Brighter for dark contrast.
  - Background: `slate-950` (#020617) - Deep dark.
  - Surface (Card): `slate-900` (#0F172A).
  - Border: `slate-800` (#1E293B).
  - Text: `slate-50` (Title) / `slate-400` (Muted).
- **UI Specs:**
  - **Radius:** `rounded-xl` (12px) / `rounded-lg` (8px).
  - **Shadow:** `none` (Use subtle borders instead).
  - **Glow:** Optional `shadow-amber-500/10` for active buttons.

## 🧠 LOGIC RULES

- **Delete:** Soft delete only (`isDeleted: true`).
- **Data Flow:** Unidirectional. Props -> Component.
- **Language:** English for code, files, and docs. Vietnamese for chat if requested.

## 🔄 WORKFLOW (MEMORY BANK)

- **Pre-flight:** Read `memory-bank/` before action.
- **Update:** - Sync `activeContext.md` (Current Task).
  - Sync `STATE.md` (Checklist).
  - Sync `IMPLEMENTATION_LOG.md` (What changed).
- **Port:** 5173.

---

_Note: Follow these rules strictly to maintain system integrity and token efficiency._
