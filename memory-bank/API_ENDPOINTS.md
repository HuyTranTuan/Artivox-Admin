# API ENDPOINTS

**BASE:** `http://localhost:3000/api`
**AUTH:** `Authorization: Bearer <accessToken>` | refresh via cookie `refreshToken`

---

## AUTH `/auth`

| Method | Path | Auth | In | Out |
|---|---|---|---|---|
| POST | `/customer/register` | - | email, password, fullName | user, tokens |
| POST | `/customer/login` | - | email, password | user, tokens |
| POST | `/admin/login` | - | email, password | user, tokens |
| POST | `/refresh-token` | - | cookie/header | tokens |
| POST | `/logout` | ✓ | - | msg |
| GET | `/me` | ✓ | - | current user |
| PATCH | `/admin/account` | ✓ | fullName?, email?, phone?, address? | admin data |
| PATCH | `/customer/account` | ✓ | fullName?, email?, phone?, address? | customer data |
| PATCH | `/admin/change-password` | ✓ | oldPassword, newPassword | msg |
| PATCH | `/customer/change-password` | ✓ | oldPassword, newPassword | msg |
| POST | `/forgot-password` | - | email | msg |
| POST | `/reset-password` | - | token, newPassword | msg |
| POST | `/verify-email` | - | token | msg |
| POST | `/resend-verify-email` | - | email | msg |
| GET | `/customer/google` | - | - | redirect |
| GET | `/customer/google/callback` | - | - | tokens redirect |

---

## CATALOG `/catalog`

### Models `/catalog/models`
| Method | Path | Auth | In | Out |
|---|---|---|---|---|
| GET | `/` | optional | ?search&limit&skip&isActive | models list |
| GET | `/:slug` | optional | - | model detail |
| POST | `/` | ADMIN/STAFF | multipart images + body | new model |
| PUT | `/:slug` | ADMIN/STAFF | multipart images + body | updated model |
| DELETE | `/:slug` | ADMIN/STAFF | - | deleted |

### Materials `/catalog/materials`
| Method | Path | Auth | In | Out |
|---|---|---|---|---|
| GET | `/` | optional | ?type&search&limit&skip&isActive | materials list |
| GET | `/:slug` | optional | - | material detail |
| POST | `/` | ADMIN/STAFF | multipart | new material |
| PUT | `/:slug` | ADMIN/STAFF | multipart | updated material |
| DELETE | `/:slug` | ADMIN/STAFF | - | deleted |

### Tools `/catalog/tools`
| Method | Path | Auth | In | Out |
|---|---|---|---|---|
| GET | `/` | optional | ?search&limit&skip&isActive | tools list |
| GET | `/:slug` | optional | - | tool detail |
| POST | `/` | ADMIN/STAFF | multipart | new tool |
| PUT | `/:slug` | ADMIN/STAFF | multipart | updated tool |
| DELETE | `/:slug` | ADMIN/STAFF | - | deleted |

### Products `/catalog/products`
| Method | Path | Auth | In | Out |
|---|---|---|---|---|
| GET | `/` | optional | ?type&search&limit&skip | products list |
| GET | `/:slug` | optional | - | product detail |
| PATCH | `/:id` | ✓ | collectionId?, discountId? | updated product |
| POST | `/:slug/rate` | ✓ | rating, comment | rating |

### Collections `/catalog/collections`
| Method | Path | Auth | In | Out |
|---|---|---|---|---|
| GET | `/` | - | - | public collections |
| GET | `/:slug` | - | - | collection + products |
| GET | `/admin/all` | ADMIN/STAFF | - | all collections (incl. inactive) |
| POST | `/` | ADMIN/STAFF | multipart | new collection |
| PUT | `/:slug` | ADMIN/STAFF | multipart | updated collection |
| DELETE | `/:slug` | ADMIN/STAFF | - | deleted |
| POST | `/:id/products` | ADMIN/STAFF | productId | product added |
| DELETE | `/:id/products/:productId` | ADMIN/STAFF | - | product removed |

---

## CART `/cart` `[All: Lock]`

| Method | Path | In | Out |
|---|---|---|---|
| GET | `/` | - | cart items |
| POST | `/add` | productId, quantity | item |
| PATCH | `/:id` | quantity | updated item |
| DELETE | `/:id` | - | deleted |

---

## ORDERS `/orders`

| Method | Path | Auth | In | Out |
|---|---|---|---|---|
| GET | `/` | - | - | all orders |
| POST | `/` | ✓ | shippingAddress, paymentMethod, note? | order |
| GET | `/me` | ✓ | - | my orders |
| GET | `/:orderId` | - | - | order detail |
| POST | `/:orderId/cancel` | ✓ | - | cancelled |
| PATCH | `/:orderId/approve` | ✓ | - | approved |
| PATCH | `/:orderId/payment-status` | ✓ | paymentStatus | updated |

---

## ARTICLES `/articles`

| Method | Path | Auth | In | Out |
|---|---|---|---|---|
| GET | `/` | - | - | all articles |
| GET | `/:slug` | - | - | article detail |
| GET | `/:lang` | - | - | by locale (en/vi/vn) |
| GET | `/:lang/:slug` | - | - | localized article |
| POST | `/` | ADMIN/STAFF | multipart | created |
| PUT | `/:slug` | ADMIN/STAFF | multipart | updated |
| DELETE | `/:slug` | ADMIN/STAFF | - | deleted |
| PATCH | `/:articleId/approve` | ADMIN/MANAGER | - | approved |

---

## CHAT `/chat` `[All: Lock except /ai]`

| Method | Path | In | Out |
|---|---|---|---|
| POST | `/ai` | message, history? | AI reply (no auth) |
| GET | `/rooms` | - | my rooms |
| POST | `/rooms` | customerId? | room |
| POST | `/rooms/:roomId/claim` | - | claimed room |
| GET | `/rooms/:roomId/messages` | - | messages |
| POST | `/rooms/:roomId/messages` | content, fileUrl?, fileType? | message |
| PATCH | `/rooms/:roomId/read` | - | read ok |
| GET | `/internal-users` | - | staff list |
| GET | `/internal-rooms` | - | internal rooms |
| POST | `/internal-rooms` | targetUserId | room |
| GET | `/internal-rooms/:roomId/messages` | - | messages |
| POST | `/internal-rooms/:roomId/messages` | content, fileUrl?, fileType? | message |
| PATCH | `/internal-rooms/:roomId/read` | - | read ok |

---

## DISCOUNTS `/discounts`

| Method | Path | Auth | In | Out |
|---|---|---|---|---|
| GET | `/` | - | - | active discounts |
| GET | `/admin` | ADMIN/STAFF | - | all discounts |
| GET | `/:slug` | - | - | discount detail |
| POST | `/` | ADMIN/STAFF | name, value, type, ... | created |
| PUT | `/:slug` | ADMIN/STAFF | body | updated |
| DELETE | `/:slug` | ADMIN/STAFF | - | deleted |

---

## NOTIFICATIONS `/notifications` `[All: Lock]`

| Method | Path | In | Out |
|---|---|---|---|
| GET | `/` | ?limit&offset&isRead | list |
| GET | `/unread-count` | - | count |
| GET | `/:id` | - | detail |
| PATCH | `/:id/read` | - | marked read |
| PATCH | `/read-all` | - | all read |
| DELETE | `/:id` | - | deleted |

---

## ADMIN `/admin` `[All: Lock]`

| Method | Path | Auth | In | Out |
|---|---|---|---|---|
| GET | `/staff/dashboard` | ANY | - | personal stats |
| POST | `/staff/upload-image` | ADMIN/MANAGER/STAFF | multipart | url |
| GET | `/dashboard` | ADMIN | - | full dashboard |
| GET | `/users` | ADMIN | - | admin users |
| GET | `/customers` | ADMIN | - | all customers |
| GET | `/customers/:slug` | ADMIN | - | customer detail |
| PATCH | `/customers/:slug/banned` | ADMIN | - | ban toggle |
| GET | `/orders` | ADMIN | - | all orders |
| PATCH | `/orders/:id` | ADMIN | status | updated |
| GET | `/revenue` | ADMIN | ?period | revenue data |
| POST | `/staff-create` | ADMIN | email, password, fullName | new staff |
| PATCH | `/staff-decentralize/:email` | ADMIN | role | updated role |

---

## SEARCH `/search`

| Method | Path | In | Out |
|---|---|---|---|
| GET | `/` | ?q&limit&type | global results |
| GET | `/models` | ?q&page&limit&filters | models |
| GET | `/materials` | ?q&page&limit&type&unit | materials |
| GET | `/tools` | ?q&page&limit&priceMin&priceMax | tools |

---

## MISC

| Method | Path | In | Out |
|---|---|---|---|
| GET | `/customers` | - | customers list |
| GET | `/customers/:slug` | - | customer |
| GET | `/discount_orders` | - | discount orders |
| GET | `/discount_orders/:id` | - | one discount order |
| GET | `/customer-activity-log` | - | activity logs |
| GET | `/location/provinces` | - | provinces |
| GET | `/location/wards` | - | all wards |
| GET | `/location/wards/:provinceCode` | - | wards by province |
