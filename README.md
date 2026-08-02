# eCommerce Marketplace Module (Maestro)

Server-side implementation of the Arpeggio marketplace layer: listings, providers, bids, bookings, orders, reviews, and disputes.

Contracts live in **armonia** at `armonia/src/modules/eCommerceMarketplace/`. This module provides Mongoose persistence, HTTP routes, and business logic.

Enable via `ENABLED_MODULES=eCommerceMarketplace`.

## Directory layout

```
eCommerceMarketplace/
├── api/eCommerceMarketplace/private/   # Express routes (auto-discovered)
├── database/
│   ├── moduleBootstrap.ts
│   └── schemas/<resource>/            # models, services, actions, views
├── domain/
│   └── notifications/                  # marketplaceNotificationHandlers + event codes
├── utilities/
│   ├── config.ts                       # Module-owned operational config
│   ├── cron/registerHandlers.ts
│   ├── cronJobs/
│   └── mappers/<resource>/             # Singular resource folders
└── websocket/
    └── roomContribution.ts
```

## Lifecycle mutations (canonical)

All order lifecycle mutations live on **`OrderActions`** (`POST /api/eCommerceMarketplace/order/<action>`):

| Action | Purpose |
|--------|---------|
| `createFromListing` | Create order from a listing |
| `accept` / `start` / `cancel` / `extend` | Order status |
| `submitDelivery` / `acceptDelivery` | Delivery + escrow release |
| `requestRevision` | Revision request |
| `createMilestone` / `releaseMilestone` | Milestone create + escrow release |

`orderDelivery`, `orderRevision`, and `orderMilestone` HTTP routes are **list-only**. Escrow hold/release/refund is invoked from OrderActions (+ auto-complete cron) via **finance** `escrowHelper` (fee percent owned by finance).

## API routes

| Route file | Base path | Notes |
|------------|-----------|-------|
| `order.ts` | `/api/eCommerceMarketplace/order` | CRUD + OrderActions |
| `orderDelivery.ts` | `/api/eCommerceMarketplace/orderDelivery` | List only |
| `orderMilestone.ts` | `/api/eCommerceMarketplace/orderMilestone` | List only |
| `orderRevision.ts` | `/api/eCommerceMarketplace/orderRevision` | List only |
| `listing.ts` … `promotion.ts` | `/api/eCommerceMarketplace/<resource>` | CRUD resources |

## Config

[`utilities/config.ts`](utilities/config.ts) (`getECommerceMarketplaceConfig()`):

| Key | Env | Default |
|-----|-----|---------|
| `autoAcceptDays` | `ECOMMERCE_MARKETPLACE_AUTO_ACCEPT_DAYS` | `3` |
| `maxRevisions` | `ECOMMERCE_MARKETPLACE_MAX_REVISIONS` | `3` |
| `stripeConnectReturnUrl` | `STRIPE_CONNECT_RETURN_URL` | derived from `CLIENT_SIDE.HOST` |
| `stripeConnectRefreshUrl` | `STRIPE_CONNECT_REFRESH_URL` | derived from `CLIENT_SIDE.HOST` |

## Cron handlers

| Code | Job |
|------|-----|
| `eCommerceMarketplace.orderAutoComplete` | Auto-complete stale submitted deliveries |
| `eCommerceMarketplace.taskRequestExpiry` | Expire open task requests |

## Related packages

| Package | Location |
|---------|----------|
| Armonia contracts | `armonia/src/modules/eCommerceMarketplace` |
| Client UI | `sinfonia/src/modules/eCommerceMarketplace` |
| Escrow ledger | `maestro/modules/finance` |
