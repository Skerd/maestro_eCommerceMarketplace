import {IListingAddOn} from "@eCommerceMarketplaceModule/database/schemas/listingAddOn/listingAddOn";
import type {ListingAddOn} from "armonia/src/modules/eCommerceMarketplace/api/eCommerceMarketplace/private/listingAddOn/listingAddOn.dto";
import {mapOwnershipToDTO, mapSoftDeleteToDTO} from "@coreModule/utilities/mappers/plugin/pluginMappers.dto";
import {mapPopulatedSimpleCurrency} from "@coreModule/utilities/mappers/common.mapper";

export function listingAddOnToDTO(addon: IListingAddOn | any): ListingAddOn {
    return {
        _id: addon._id.toString(),
        listing: addon.listing
            ? {
                _id: addon.listing._id?.toString?.() ?? addon.listing.toString(),
                title: addon.listing.title,
            }
            : undefined,
        name: addon.name,
        price: {
            amount: addon.price?.amount ?? 0,
            currency: mapPopulatedSimpleCurrency(addon.price?.currency),
        },
        deliveryDays: addon.deliveryDays,
        ...mapOwnershipToDTO(addon),
        ...mapSoftDeleteToDTO(addon),
    };
}

export function listingAddOnsToDTOArray(addons: (IListingAddOn | any)[]): ListingAddOn[] {
    return addons.map(listingAddOnToDTO);
}
