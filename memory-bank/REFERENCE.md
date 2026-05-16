# 📚 REFERENCE: PATTERNS

## 🛠 REUSABLE LOGIC

- **Search:** `useDebounce(val, 300)`.
- **Modal:** `useClickOutsideClose(() => setOpen(false))`.
- **Actions:** View (Eye/Amber), Edit (Pencil/Emerald), Delete (Trash/Rose).
- **Table:** `grid-cols-[2fr_1fr_1fr_1fr_120px]`. Border-bottom only.
- **Positive Update:** active ui fist then call api, if fail then fallback.

## 🎨 DESIGN SPEC (MODERN MINIMAL)

- **Radius:** `rounded-xl` (12px).
- **Badges:** Text-color only. No BG.
- **Date:** `DD/MM/YYYY`.
- **Paging:** 20 items/page. Max 5 page buttons.
