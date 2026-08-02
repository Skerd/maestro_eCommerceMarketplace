import {IListingAddOn} from "@eCommerceMarketplaceModule/database/schemas/listingAddOn/listingAddOn";
import type {ListingAddOn} from "armonia/src/modules/eCommerceMarketplace/api/eCommerceMarketplace/private/listingAddOn/listingAddOn.dto";
import {mapOwnershipToDTO, mapSoftDeleteToDTO, mapLifeCycleToDTO} from "@coreModule/utilities/mappers/plugin/pluginMappers.dto";
import {mapPopulatedSimpleCurrency, mapPopulatedSimpleUser} from "@coreModule/utilities/mappers/common.mapper";

export function listingAddOnToDTO(addon: IListingAddOn | any): ListingAddOn {
    return {
        _id: addon._id.toString(),
        listing: addon.listing ? {
            _id: addon.listing._id?.toString?.(),
            title: addon.listing.title,
        } : undefined,
        provider: mapPopulatedSimpleUser(addon.provider),
        name: addon.name,
        price: {
            amount: addon.price?.amount,
            currency: mapPopulatedSimpleCurrency(addon.price?.currency),
        },
        deliveryDays: addon.deliveryDays,
        ...mapOwnershipToDTO(addon),
        ...mapSoftDeleteToDTO(addon),
        ...mapLifeCycleToDTO(addon),
    };
}

export function listingAddOnsToDTOArray(addons: (IListingAddOn)[]): ListingAddOn[] {
    return addons.map(listingAddOnToDTO);
}
