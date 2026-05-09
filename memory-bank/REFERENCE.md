# 📚 REFERENCE: ARTIVOX PATTERNS & LOGS

**Status:** BUILDING (In-Development)  
**Version:** v1.0 (UI/UX Sprint)

---

## 🛠 CORE ACHIEVEMENTS

- **Nav:** Dashboard primary. Products grouped (Models, Materials, Tools). Logo clicks home.
- **Header:** Bigger buttons. Circle avatar. Gradient background.
- **Tables:** Straight lines. Action icons (Eye, Pencil, Trash). Text-only badges.
- **Search:** Icon toggle. 300ms debounce. Suggestions live.
- **Models Page:** Full CRUD UI. Table/Grid toggle. 20 items per page.

## 🧩 REUSABLE PATTERNS

1. **Search + Debounce (300ms):** Use for all searchable lists. Prevents lag.
   ```javascript
   const debouncedSearch = useDebounce(searchValue, 300);
   ```
2. **Dialog + Click-Outside:** Auto-closes on outside click or Escape key.
   ```javascript
   const dialogRef = useClickOutsideClose(() => setOpen(false));
   ```
3. **Action Buttons (Standard Colors):**

- **View**: Ghost / Slate-600.
- **Edit**: Emerald-600.
- **Delete**: Rose-600.

4. **Table Layout:** Straight line separators only. rounded-2xl. border-slate-200
   ```javascript
   grid-cols-[2fr_1fr_1fr_1fr_120px]
   ```
5. **Pagination:** 20 items per page. Show range (e.g., 1-20 of 45).
6. **View Mode Toggle:** Switch between table and grid using icon buttons.

## 🎨 DESIGN RULES

- **Radius:** Always 16px / rounded-2xl.
- **Colors:** Slate (Neutral), Amber (Accent), Emerald (Success), Rose (Danger).
- **Badges:** Text color only. No background.

## 🚀 PERFORMANCE & QA

- **Clean:** Zero lint errors. Keyboard nav supported.
- **Fast:** useMemo for filters. useDebounce for search.
