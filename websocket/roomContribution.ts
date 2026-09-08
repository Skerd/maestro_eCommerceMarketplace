import {registerRoomDisplayNames} from "@coreModule/websocket/roomRegistry";

/**
 * Site rooms for eCommerce marketplace panel paths
 * (e.g. `/eCommerceMarketplace/bookings` → room `bookings` via SiteRoomProvider).
 *
 * Keep in sync with eCommerceMarketplace sidebarContribution + routeConfigContribution.
 */
export function registerECommerceMarketplaceRoomContributions(): void {
    registerRoomDisplayNames({
        marketplacesystemmap: "Marketplace system map",
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
        listingaddons: "Listing add-ons",
        listingpackages: "Listing packages",
        listingcategories: "Listing categories",
    });
}
