# ARCH: Artivox Admin Dashboard v1

## Title

Artivox Admin Dashboard v1

## Content

Admin control panel for the Artivox 3D printing ecosystem.

Primary scope:

- Manage polymorphic product catalogs: Models, Materials, Tools
- Manage order fulfillment and approval flows
- Manage customers, customer support
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
  hooks/        # Custom hooks: useAuth, useOrders, useProducts, useClickOutsideClose, useDebounce
  layouts/      # App shell layouts
  pages/        # Route-level screens
  services/     # API modules per feature
  store/        # Zustand stores
  utils/        # Helpers, formatters, guards, data transforms
  validators/   # Zod schemas
memory-bank/
  ├── activeContext.md       # Current state (Đã cập nhật UI/UX)
  ├── STATE.md               # Process (33/33 tasks hoàn thành)
  ├── ARCH.md                # Architecture & Design System (Amber-500, Slate-900)
  ├── TECH.md                # Stack & Patterns (CJS, Debounce, Dialogs)
  ├── RULES.md               # Rules of code (Module Import, Memory Bank rules)
  ├── IMPLEMENTATION_LOG.md  # (Gom từ IMPLEMENTATION_SUMMARY & VERIFICATION)
  └── REFERENCE.md           # (Gom từ QUICK_REFERENCE & TEAM_SUMMARY)
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

## Recent UI/UX Patterns Established

### Search with Debounce

- Search button toggles input visibility
- useDebounce hook debounces input for 300ms before filtering
- Commonly used in tables and list pages
- Pattern: Icon button → Click → Input shows → Type → useDebounce fires

### Filter Panel

- Filter icon opens/closes dropdown panel
- useClickOutsideClose hook closes panel when clicking outside
- Checkbox-based filtering with multiple categories and statuses
- Clear Filters button resets all filters

### Action Buttons in Tables

- Three icon buttons per row: View (eye), Edit (pencil green), Delete (trash red)
- Buttons trigger dialogs using useClickOutsideClose for modal behavior
- Icons from lucide-react library
- Dialogs: View shows data, Edit shows placeholder, Delete shows confirmation

### Table Styling

- Straight line borders (not boxed cells)
- Column header with uppercase text and bottom border
- Row borders with simple bottom border separators
- Consistent grid layout for alignment

### Sidebar Navigation

- Nested menu items under Products heading
- Dashboard link at top level
- Customers list added
- Copyright footer at bottom when sidebar is open
- Logo is clickable NavLink to dashboard

### Header Improvements

- Bigger toggle button (h-14 w-14 instead of h-11 w-11)
- Larger notification icon (h-6 w-6 instead of h-5 w-5)
- Circular avatar with gradient background
- User name displayed below avatar
- Search toggle with input display

### Badge Component

- Text-only styling (no background colors)
- Uses semantic color mapping per status
- No padding or rounded container

### Pagination

- 20 items per page standard
- Previous/Next buttons
- Page number buttons (shows 5 pages max)
- Summary text showing range and total count
- Disabled state on boundary pages

## Current Focus

- Current build target: ModelsPage with full CRUD UI
- Next target: Materials and Tools pages following ModelsPage pattern
- Following target: Discount campaigns and dashboard customization
