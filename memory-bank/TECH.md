# 🛠 TECH: ARTIVOX ADMIN (AMBER-CORE)

## 🏗 RUNTIME & STACK

- **Env:** Node v20+, npm, Vite.
- **UI:** React 18, Tailwind CSS, Shadcn/UI.
- **State:** - **Server:** TanStack Query v5 (Data fetching/caching).
- **Client:** Zustand (Auth, Sidebar, UI persistence).
- **Forms:** React Hook Form + Zod (Validation).
- **Network:** Axios (Base + Interceptors).
- **Icons:** Lucide React (Size 20).

## 📂 STRUCTURE (CORE)

- `src/api/`: Axios config & Interceptors.
- `src/components/ui/`: Shadcn primitives.
- `src/components/forms/`: Project form using Shadcn primitives .
- `src/components/`: Components re-use for project
- `src/constants/`: Constants like http code, app code,
- `src/hooks/`: Custom hooks (React Query logic).
- `src/layouts/`: Layouts, include AuthLayout and MainLayout .
- `src/pages/`: Project page, separate by function.
- `src/services/`: API endpoint calls (Raw data).
- `src/store/`: Zustand stores.
- `src/utils/`: Ultilities.
- `src/validators/`: Zod schemas.

## 🎨 THEME CONFIG

- **Light (Default):**
  - Primary: `amber-500`. Surface: `white`. Border: `slate-200`.
- **Dark:**
  - Primary: `amber-400`. Surface: `slate-900`. BG: `slate-950`. Border: `slate-800`.
- **UI:** `rounded-xl` (12px). Sans (Inter), Content (Merriweather).

## 💻 CODE RULES

- **Exports:** **Named only**. No `default`.
- **Imports:** Clean ESM. No CJS.
- **Fetching:** Component -> Hook -> Service -> Axios.

## ⚖️ DATA RULES

1. **API:** No direct Axios in components. Use `services/`.
2. **State:**
   - Fetching -> TanStack Query.
   - Global UI -> Zustand.
   - Form temporary data -> React Hook Form.

3. **Exports:** **Named Exports only** (`export const ...`). No `default`.
4. **Validation:** Zod schema for every form.

## 📝 CODE PATTERNS (ESM ONLY)

### Service

```javascript
import { axiosClient } from "@/api/axios";

export const getArticles = (params) => axiosClient.get("/articles", { params });
```

### Custom Hooks

```javascript
import { useQuery } from "@tanstack/react-query";
import { getArticles } from "@/services/articleService";

export const useArticles = (params) =>
  useQuery({
    queryKey: ["articles", params],
    queryFn: () => getArticles(params),
  });
```

### Schema

```javascript
import { z } from "zod";

export const articleSchema = z.object({
  locale: z.string().min(2),
  title: z.string().min(1),
  content: z.string().min(1),
});
```

## 🚀 PRIORITIES

**Admin Shell (Sidebar + Layout).**
**Notification.**
**Admin profile setting.**
**UI setting(sidebar toggele, theme change, ...).**
**Articles CRUD.**
**Discount CRUD.**
**Product Management (Subtype logic).**
**Customers Management.**
**Orders Management.**
**Order Flow (Approval states).**
**Customer chat (Approval states).**
