# ARCH: ARTIVOX ADMIN V1

## 🏗 SCOPE

- Polymorphic Catalog: Models, Materials, Tools.
- Fulfillment: Order/Approval flow.
- CMS: Multi-language (VI/EN).
- Access: Role-based (Admin/Staff).

## 🛠 TECH STACK

- Core: React 18 (Vite) + ESM.
- State: TanStack Query v5 (Server) + Zustand (UI).
- Logic: Hook-based data flow.
- Validation: Zod + React Hook Form.

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

## 🧩 CORE PATTERNS

- **Soft Delete:** `deletedAt !== null`. Archive views only.
- **BigInt:** Convert string -> numeric safely for UI.
- **Polymorphism:** Dynamic forms based on `ProductType`.
