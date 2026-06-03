# Active Context

**Updated:** Jun 4, 2026

## Current Focus

- Catalog pages (Models, Materials, Tools) — search/filter/pagination wired to real BE
- Active file: `ModelsPage.jsx`, `ToolsPage.jsx`

## Architecture Notes

- Data flow: Component → Hook (`usePaginatedApi`) → Service → Axios
- Services live in `src/services/` — named exports only
- No direct Axios in components
- Socket: `notificationSocket.js` (notifications), `supportChatSocket.js` (customer chat)
- Internal staff chat: `/chat/internal-rooms`, `/chat/internal-users`
- Admin API prefix: `/admin/*` (requires auth + role)
- Catalog admin routes: POST/PUT/DELETE on `/catalog/models|materials|tools|collections`

## Hot Paths

- `src/services/` — all API calls
- `src/hooks/usePaginatedApi.js` — pagination logic
- `src/pages/catalog/` — ModelsPage, MaterialsPage, ToolsPage, CollectionsPage
- `src/pages/support/` — Chat UI
- `src/pages/notifications/` — notifications

## Next Tasks

- Wire notification list page to real API + socket
- Product page: assign collection + discount (PATCH /catalog/products/:id)
- Mobile responsive pass
