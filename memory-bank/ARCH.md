# ARCH: Artivox Admin Dashboard v1

## Title

Artivox Admin Dashboard v1

## Content

Admin control panel for the Artivox 3D printing ecosystem.

Primary scope:
- Manage polymorphic product catalogs: Models, Materials, Tools
- Manage order fulfillment and approval flows
- Manage multi-language CMS content
- Provide role-based admin/staff operations

## Tech Stack

- Core: React 18 + Vite
- Styling: Tailwind CSS + Shadcn/UI
- Server State: TanStack Query v5
- Global UI State: Zustand
- Forms: React Hook Form
- Validation: Zod
- API Client: Axios with JWT interceptors

## Project Structure

```text
src/
  api/          # Axios instance, interceptors, API config
  components/
    ui/         # Shadcn/UI base components
    forms/      # Feature forms: ProductForm, ArticleForm
    shared/     # Shared layout blocks: Sidebar, Header, Navbar
  constants/    # Enums and app constants
  hooks/        # Custom hooks: useAuth, useOrders, useProducts
  layouts/      # App shell layouts
  pages/        # Route-level screens
  services/     # API modules per feature
  store/        # Zustand stores
  utils/        # Helpers, formatters, guards, data transforms
  validators/   # Zod schemas
```

## Data Flow

```text
User Action
  -> Page / Component
  -> Hook
  -> Service
  -> API Client
  -> Backend
  -> React Query Cache Update
  -> UI Re-render
```

## Core Patterns

### 1. Polymorphic Products

- One product record maps to one product subtype: Model, Material, or Tool
- UI form changes by `ProductType`
- Validation changes by subtype-specific Zod schema

### 2. Multi-language CMS

- Content supports translation per locale
- Admin UI uses tabbed or side-by-side editing
- Typical locales: `vi`, `en`

### 3. Server State

- All remote reads use TanStack Query
- Mutations invalidate or refresh affected queries
- Loading, empty, and error states are handled per screen

### 4. Role-Based Access

- Admin: full access
- Staff: limited operational access
- Restricted areas: user/admin settings, destructive actions

### 5. Soft Delete

- Deleted records stay recoverable
- Default lists hide `deletedAt !== null`
- Admin UI exposes trash/archive views when needed

## Known Constraints

### BigInt Handling

- Backend may return BigInt-like values as strings
- UI must format or safely convert before numeric usage

### Auth Persistence

- JWT stored in local storage
- Axios interceptor handles unauthorized responses
- Invalid sessions redirect to `/login`

## Current Focus

- Current build target: Blog Campaign management UI
- Next target: Order approval workflow
