# 📚 Artivox Admin Dashboard

## 🚀 Project Overview

Internal management platform for the **Artivox 3D E-commerce** ecosystem. Built to manage 3D models, printing materials (PLA, ABS, Resin), and customer orders with a focus on speed and clean UI/UX.

- **Version:** 1.0 Internal (Sprint: UI/UX Overhaul)
- **Status:** IN-DEVELOPMENT (33/33 Core UI tasks synced)
- **Tech Stack:** React + Tailwind CSS + CommonJS (CJS)

---

## 🧠 Memory Bank Structure

All project intelligence is stored in the `/memory-bank` directory. **Read these in order to understand the current state:**

1.  `memory-bank/activeContext.md`: **Current Focus.** Summary of recent UI/Header changes and next build targets.
2.  `memory-bank/STATE.md`: **Progress Tracker.** Master list of completed vs. remaining features.
3.  `memory-bank/IMPLEMENTATION_LOG.md`: **Sprint History.** Technical log of the UI/UX overhaul (May 6, 2026).
4.  `memory-bank/ARCH.md`: **System Design.** Details on the Amber/Slate color palette, layout logic, and design system.
5.  `memory-bank/REFERENCE.md`: **Pattern Library.** Reusable code snippets for Search, Dialogs, and Table layouts.
6.  `memory-bank/RULES.md`: **Dev Standards.** Mandatory guidelines for CommonJS usage and memory management.

---

## 🛠 Detailed Key Features

### 🎨 Interface & Navigation

- **Modern Header:** Features h-14 toggle controls, 22px icons, and circular avatars with Amber-to-Orange gradients.
- **Nested Sidebar:** Grouped navigation for 3D Products (Models, Materials, Tools) with a fixed copyright footer.
- **Responsive Engine:** Mobile-first design using Tailwind grid systems and collapsible navigation.

### 📊 Data Management

- **Streamlined Tables:** Clean "straight-line" border style (no boxed cells). Bold headers (`text-slate-900`).
- **Action Patterns:** Standardized Eye (View), Pencil (Edit - Emerald), and Trash (Delete - Rose) icon set.
- **Smart Search:** 300ms debounced input with icon-based toggle to save screen real estate.
- **Status Badges:** Text-only semantic styling for high clarity and low visual noise.

### ⚡ Performance & Logic

- **Optimized Rendering:** Uses `useMemo` for filters and `useDebounce` to minimize unnecessary re-renders.
- **Interaction Hooks:** Custom `useClickOutsideClose` for standardized modal/dialog behavior (Escape key supported).

---

## ⚠️ Developer Notes

- **Language:** All code and documentation MUST be in English.
- **File Policy:** Do NOT create new `.md` files outside the `memory-bank/` directory.
- **Module System:** Project strictly uses **CommonJS** (`require`/`module.exports`).

---

**Last Updated:** May 7, 2026
**Status:** Internal Draft

---

_Attention: Do not auto creat more .md files outside the memory-bank folder._

<!--
  "Read memory-bank/RULES.md and follow the Caveman Protocol for all code and documentation. English only. No yapping."
-->
