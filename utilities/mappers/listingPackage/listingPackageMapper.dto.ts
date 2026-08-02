import {IListingPackage} from "@eCommerceMarketplaceModule/database/schemas/listingPackage/listingPackage";
import type {ListingPackage} from "armonia/src/modules/eCommerceMarketplace/api/eCommerceMarketplace/private/listingPackage/listingPackage.dto";
import {mapOwnershipToDTO, mapSoftDeleteToDTO, mapLifeCycleToDTO} from "@coreModule/utilities/mappers/plugin/pluginMappers.dto";
import {mapPopulatedSimpleCurrency, mapPopulatedSimpleUser} from "@coreModule/utilities/mappers/common.mapper";

export function listingPackageToDTO(pkg: IListingPackage): ListingPackage {
    return {
        _id: pkg._id.toString(),
        listing: pkg.listing ? {
            _id: pkg.listing._id?.toString?.(),
            title: pkg.listing.title,
        } : undefined,
        provider: mapPopulatedSimpleUser(pkg.provider),
        name: pkg.name,
        description: pkg.description,
        price: {
            amount: pkg.price?.amount,
            currency: mapPopulatedSimpleCurrency(pkg.price?.currency),
        },
        deliveryDays: pkg.deliveryDays,
        order: pkg.order ?? 0,
        ...mapOwnershipToDTO(pkg),
        ...mapSoftDeleteToDTO(pkg),
        ...mapLifeCycleToDTO(pkg),
    };
}

export function listingPackagesToDTOArray(packages: IListingPackage[]): ListingPackage[] {
    return packages.map(listingPackageToDTO);
}
