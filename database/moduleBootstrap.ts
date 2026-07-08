import type {Model} from "mongoose";
import Listing from "@eCommerceMarketplaceModule/database/schemas/listing/listing";
import TaskRequest from "@eCommerceMarketplaceModule/database/schemas/taskRequest/taskRequest";
import Bid from "@eCommerceMarketplaceModule/database/schemas/bid/bid";
import Order from "@eCommerceMarketplaceModule/database/schemas/order/order";
import Review from "@eCommerceMarketplaceModule/database/schemas/review/review";
import ListingPackage from "@eCommerceMarketplaceModule/database/schemas/listingPackage/listingPackage";
import ListingAddOn from "@eCommerceMarketplaceModule/database/schemas/listingAddOn/listingAddOn";
import ProviderProfile from "@eCommerceMarketplaceModule/database/schemas/providerProfile/providerProfile";
import ProviderAvailability from "@eCommerceMarketplaceModule/database/schemas/providerAvailability/providerAvailability";
import Booking from "@eCommerceMarketplaceModule/database/schemas/booking/booking";
import Dispute from "@eCommerceMarketplaceModule/database/schemas/dispute/dispute";
import Promotion from "@eCommerceMarketplaceModule/database/schemas/promotion/promotion";
import ListingFlag from "@eCommerceMarketplaceModule/database/schemas/listingFlag/listingFlag";

export const eCommerceMarketplaceModels: Model<any>[] = [
    Listing,
    TaskRequest,
    Bid,
    Order,
    Review,
    ListingPackage,
    ListingAddOn,
    ProviderProfile,
    ProviderAvailability,
    Booking,
    Dispute,
    Promotion,
    ListingFlag,
];

export async function dropECommerceMarketplaceCollections(): Promise<void> {
    for (const model of eCommerceMarketplaceModels) {
        await model.collection.drop();
    }
}
