import {registerRoomDisplayNames} from "@coreModule/websocket/roomRegistry";

/**
 * Site rooms for eCommerce marketplace panel paths
 * (e.g. `/eCommerce/bookings` → room `bookings` via withSiteRoom).
 *
 * Keep in sync with eCommerceMarketplace sidebarContribution + routeConfigContribution.
 */
export function registerECommerceMarketplaceRoomContributions(): void {
    registerRoomDisplayNames({
        listings: "Listings",
        listingflags: "Listing flags",
        promotions: "Promotions",
        taskrequests: "Task requests",
        bids: "Bids",
        orders: "Orders",
        disputes: "Disputes",
        reviews: "Reviews",
        bookings: "Bookings",
        providerprofile: "Provider profile",
        provideravailability: "Provider availability",
        listingaddons: "Listing add-ons",
        listingpackages: "Listing packages",
    });
}
