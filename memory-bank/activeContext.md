# ACTIVE CONTEXT

## Current Goal

Keep campaign/order flows stable after route migration and API field normalization.

## Current Solution

- Router lazy-loads all pages except `DashboardLayout`, `AuthLayout`, `SignInPage`, and `DashboardPage`.
- Orders list uses `/orders`; legacy `/orders/approval` route is removed; sidebar points to `/orders`.
- Campaign routes now support list + slug paths: `/campaigns/article/:slug` and `/campaigns/discount/:slug`.
- `DiscountCampaignsPage` and `ArticleCampaignsPage` now fetch list data in `useEffect`, normalize API fields to table columns, and request detail by slug for view dialogs.
- Discount/article tables apply odd-row light gray background and light-orange row hover.

## Next Build Targets

- Replace static stat cards with live summary metrics.
- Add dedicated article/discount detail pages for slug routes.
- Continue Materials/Tools CRUD depth and personal settings expansion.
