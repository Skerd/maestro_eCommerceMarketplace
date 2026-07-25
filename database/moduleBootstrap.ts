import type {Model} from "mongoose";
import ListingCategory from "@eCommerceMarketplaceModule/database/schemas/listingCategory/listingCategory";
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
import OrderDelivery from "@eCommerceMarketplaceModule/database/schemas/orderDelivery/orderDelivery";
import OrderMilestone from "@eCommerceMarketplaceModule/database/schemas/orderMilestone/orderMilestone";
import OrderRevision from "@eCommerceMarketplaceModule/database/schemas/orderRevision/orderRevision";

export const eCommerceMarketplaceModels: Model<any>[] = [
    ListingCategory,
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
    OrderDelivery,
    OrderMilestone,
    OrderRevision,
];

export async function dropECommerceMarketplaceCollections(): Promise<void> {
    for (const model of eCommerceMarketplaceModels) {
        await model.collection.drop();
    }
}

export const moduleBootstrap = {
    models: eCommerceMarketplaceModels,
    dropModuleCollections: dropECommerceMarketplaceCollections,
};
