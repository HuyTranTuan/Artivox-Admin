# TECH: Artivox Admin Frontend Setup

## Title

Artivox Admin Frontend Setup

## Content

Technical guide for the Artivox Admin Dashboard frontend.

Primary scope:
- Local development setup
- Core libraries and responsibilities
- Suggested folder structure
- Feature implementation rules
- Common patterns for state, forms, and API access

## Runtime

- Node.js: v20+
- Package Manager: npm
- App Type: SPA admin dashboard
- Build Tool: Vite

## Core Libraries

- React 18
- Tailwind CSS
- Shadcn/UI
- TanStack Query v5
- Zustand
- React Hook Form
- Zod
- Axios
- React Router DOM
- Lucide React

## Suggested Install

```bash
npm create vite@latest artivox-admin -- --template react
cd artivox-admin
npm install
```

## Suggested Dependencies

```bash
npm install axios zod zustand @tanstack/react-query react-hook-form react-router-dom lucide-react
npm install tailwindcss @tailwindcss/vite
```

## Suggested Environment

```env
VITE_API_BASE_URL=http://localhost:3000/api/v1
VITE_APP_NAME=Artivox Admin
VITE_DEFAULT_LOCALE=vi
```

## Project Structure

```text
src/
  api/
    axios.js           # Base axios instance
    interceptors.js    # Auth token + 401 handling
  components/
    ui/                # Shadcn/UI primitives
    forms/             # Feature forms
    shared/            # Sidebar, Header, Table blocks
  constants/
    roles.js
    product-types.js
    order-status.js
  hooks/
    useAuth.js
    use-orders.js
    use-products.js
  layouts/
    AuthLayout.jsx
    DashboardLayout.jsx
  pages/
    auth/
    campaigns/
    orders/
    products/
    settings/
  routes/
    index.jsx
    ProtectedRoute.jsx
  services/
    authService.js
    articleService.js
    material.service.js
    model.service.js
    orderService.js
    tool.service.js
  store/
    authStore.js
    uiStore.js
  utils/
    bigint.js
    formatDate.js
    formatPrice.js
  validators/
    auth.schema.js
    article.schema.js
    product.schema.js
```

## Data Rules

### API Layer

- `api/axios.js`: base config only
- `services/*.service.js`: endpoint calls only
- Components do not call Axios directly

### Server State

- Use TanStack Query for all fetch flows
- Use query keys per resource and filter set
- Invalidate queries after create, update, delete, restore

### UI State

- Use Zustand for auth state, sidebar state, filters that must persist across screens
- Keep transient form state inside React Hook Form

### Validation

- Use Zod for all form schemas
- Split schema by feature
- Use conditional schema branches for polymorphic products

## Feature Patterns

### Product Management

- Shared product shell
- Dynamic subtype fields for model, material, tool
- Reusable list + form pattern across product modules

### Multi-language CMS

- Store translation values by locale
- UI supports tabbed or parallel locale editing
- Separate title/content/slug fields per locale

### Orders

- Focus states: `PENDING`, `PAID`, `REFUND_PENDING`
- Approval actions must update cache immediately after mutation

### Auth

- Store JWT in local storage
- Inject token through Axios interceptor
- Redirect unauthorized users to `/login`

## Code Pattern

### Service

```javascript
const axiosClient = require("@/api/axios");

function getArticles(params) {
  return axiosClient.get("/articles", { params });
}

module.exports = {
  getArticles,
};
```

### Hook

```javascript
const { useQuery } = require("@tanstack/react-query");
const articleService = require("@/services/articleService");

function useArticles(params) {
  return useQuery({
    queryKey: ["articles", params],
    queryFn: () => articleService.getArticles(params),
  });
}

module.exports = {
  useArticles,
};
```

### Form Schema

```javascript
const { z } = require("zod");

const articleSchema = z.object({
  locale: z.string().min(2),
  title: z.string().min(1),
  content: z.string().min(1),
});

module.exports = {
  articleSchema,
};
```

## UI Rules

- Tailwind only
- Use root color variables
- Title font: Inter
- Content font: Merriweather
- Title size: 18px or 20px
- Content size: 14px
- Border radius: 8px or 12px

## Current Implementation Priority

1. Admin shell layout
2. Blog campaign management UI
3. Discount campaign list UI
4. Product CRUD screens
5. Order approval flow

## Common Risks

### Stale Backend Doc Drift

- Do not document backend-only setup here
- This file is frontend-only unless repo scope changes

### Query Key Drift

- Keep query keys centralized or consistent per feature
- Mismatched keys cause stale UI after mutation

### Dynamic Form Complexity

- Product subtype switching can leak invalid values
- Reset subtype-only fields when product type changes
