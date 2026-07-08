# eCommerce Marketplace Module (Maestro)

Server-side implementation of the Arpeggio marketplace layer: listings, providers, bids, bookings, orders, reviews, and disputes.

Contracts live in **armonia** at `armonia/src/modules/eCommerceMarketplace/`. This module provides Mongoose persistence, HTTP routes, and business logic.

Enable via `ENABLED_MODULES=eCommerceMarketplace`.

## Directory layout

```
eCommerceMarketplace/
├── api/eCommerceMarketplace/private/   # Express routes
├── database/
│   ├── moduleBootstrap.ts
│   └── schemas/<resource>/
├── domain/
│   └── notifications/                  # Marketplace notification handlers
└── utilities/
    └── mappers/                        # DTO mappers per resource
```

## API routes

| Route file | Description |
|------------|-------------|
| `listing.ts` | Marketplace listings |
| `listingPackage.ts` | Listing packages |
| `listingAddOn.ts` | Optional add-ons |
| `listingFlag.ts` | Moderation flags |
| `providerProfile.ts` | Provider/seller profiles |
| `providerAvailability.ts` | Provider scheduling |
| `taskRequest.ts` | Buyer task requests |
| `bid.ts` | Provider bids |
| `booking.ts` | Appointments / bookings |
| `order.ts` | Marketplace orders |
| `review.ts` | Reviews and ratings |
| `dispute.ts` | Dispute resolution |
| `promotion.ts` | Marketplace promotions |

## Database models

Registered in `database/moduleBootstrap.ts`:

- `Listing`, `TaskRequest`, `Bid`, `Order`, `Review`
- `ListingPackage`, `ListingAddOn`, `ProviderProfile`, `ProviderAvailability`
- `Booking`, `Dispute`, `Promotion`, `ListingFlag`

Each schema folder uses the standard maestro layout (model, service, indexes, snippets, views).

## Path alias

```ts
import Listing from "@eCommerceMarketplaceModule/database/schemas/listing/listing";
```

## Relationship to eCommerce

The marketplace module handles peer-to-peer / services flows (listings, bids, providers). Standard catalog commerce (products, cart, warehouse) remains in **eCommerce**. Both modules can be enabled together.

## Related packages

| Package | Location |
|---------|----------|
| Armonia contracts | [`armonia/src/modules/eCommerceMarketplace`](../../../armonia/src/modules/eCommerceMarketplace/README.md) |
| Client UI | `sinfonia/src/modules/eCommerceMarketplace/` |
