# ACTIVE CONTEXT

## Current Goal

UI/UX polish: customer quick edit, table search behavior, header notification/search dropdowns, support chat workspace.

## Current Solution

- Header: expandable search stays open when text exists, clear-X inside input, bigger search/notification icons, unread badge, read/unread notification filter box at z-900.
- Sidebar: removed "Admin Dashboard" from logo area and footer.
- CustomersPage: export icon button in table header, row action menu scoped to table area, double-click inline edit for name/email/phone/tier, save/cancel inline controls.
- Models/Materials/Tools/ArticleCampaigns tables: action icons normalized to 18px, search toggle now input + search action button + clear-X.
- Support Chat page: 2-column customer list + chat thread + file/image send controls using a WebSocket-ready mock transport service.

## Next Build Targets

- Materials and Tools pages CRUD depth
- Discount campaigns enhancements
- Personal settings page
- Order approval & refund view
- Real support chat backend channel hookup
