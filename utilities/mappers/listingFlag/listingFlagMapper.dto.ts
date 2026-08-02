import { IListingFlag } from "@eCommerceMarketplaceModule/database/schemas/listingFlag/listingFlag";
import type { ListingFlag } from "armonia/src/modules/eCommerceMarketplace/api/eCommerceMarketplace/private/listingFlag/listingFlag.dto";
import {mapPopulatedSimpleUser} from "@coreModule/utilities/mappers/common.mapper";
import {mapOwnershipToDTO, mapSoftDeleteToDTO, mapLifeCycleToDTO} from "@coreModule/utilities/mappers/plugin/pluginMappers.dto";

export function listingFlagToDTO(f: IListingFlag): ListingFlag {
    return {
        _id: f._id.toString(),
        listing: f.listing ? {
            _id: typeof f.listing._id === "string" ? f.listing._id : f.listing._id?.toString?.() || "",
            title: f.listing.title,
        } : undefined,
        user: mapPopulatedSimpleUser(f.user),
        reason: f.reason,
        comment: f.comment,
        status: f.status || "pending",
        resolution: f.resolution,
        ...mapOwnershipToDTO(f),
        ...mapSoftDeleteToDTO(f),
        ...mapLifeCycleToDTO(f),
    };
}

export function listingFlagsToDTO(flags: IListingFlag[]): ListingFlag[] {
    return flags.map(listingFlagToDTO);
}
