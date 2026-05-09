# 📜 CAVEMAN RULES: PROJECT PROTOCOL

## 🛠 VIBE RULES (FE)

- **No Yap:** Code only. Minimal talk.
- **Mocking:** Use `useEffect` + hardcoded JSON to simulate API calls.
- [cite_start]**Styling:** Tailwind CSS only[cite: 4]. No external CSS.
- **Icons:** Use `lucide-react`. Fallback to Unicode if needed.
- [cite_start]**Stack:** React (Vite)[cite: 4]. Functional components + Hooks. No classes.
- **English:** Code, file names, and docs strictly English. No Vietnamese.

## 🏗 DESIGN

- **Colors:** Primary `#F59E0B`. Secondary `#64748B`. Background `#F8FAFC`.
- **Card:** Background `#FFFFFF`. Shadow `#C7C7C7FF`.
- **Radius:** 8px or 12px (`rounded-lg`).
- **Fonts:** Titles Inter. Content Merriweather.
- **Text:** Title 18-20px. Content 14px.

## 🧠 LOGIC RULES

- **Delete:** Soft delete only. Hide from UI state. No real database delete.
- **Orders:** `PENDING` -> `PAID` -> `REFUND_PENDING`.
- **i18n:** Parallel view. Side-by-side translation.

## 🔄 WORKFLOW

- [cite_start]**Before:** Check `memory-bank/`[cite: 4]. Fix `activeContext.md` first.
- [cite_start]**After:** Update `STATE.md` with progress after finishing a task[cite: 5].
- **Module:** ESM (`import`/`export`). No CommonJS.
- [cite_start]**Port:** 5173[cite: 4].

---
