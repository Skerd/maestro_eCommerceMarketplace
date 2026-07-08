import { IListingFlag } from "@eCommerceMarketplaceModule/database/schemas/listingFlag/listingFlag";
import type { ListingFlag } from "armonia/src/modules/eCommerceMarketplace/api/eCommerceMarketplace/private/listingFlag/listingFlag.dto";

export function listingFlagToDTO(f: IListingFlag | any): ListingFlag {
    return {
        _id: f._id.toString(),
        listing: f.listing
            ? {
                  _id: typeof f.listing._id === "string" ? f.listing._id : f.listing._id?.toString?.() || "",
                  title: f.listing.title,
              }
            : undefined,
        user: f.user
            ? {
                  _id: typeof f.user._id === "string" ? f.user._id : f.user._id?.toString?.() || "",
                  name: f.user.name,
                  fullName: f.user.fullName,
              }
            : undefined,
        company: f.company
            ? {
                  _id: typeof f.company._id === "string" ? f.company._id : f.company._id?.toString?.() || "",
                  name: f.company.name,
              }
            : undefined,
        reason: f.reason,
        comment: f.comment,
        status: f.status || "pending",
        resolution: f.resolution,
        createdAt: f.createdAt,
    };
}

export function listingFlagsToDTO(flags: IListingFlag[]): ListingFlag[] {
    return flags.map(listingFlagToDTO);
}
