import {IListingPackage} from "@eCommerceMarketplaceModule/database/schemas/listingPackage/listingPackage";
import type {ListingPackage} from "armonia/src/modules/eCommerceMarketplace/api/eCommerceMarketplace/private/listingPackage/listingPackage.dto";
import {mapOwnershipToDTO, mapSoftDeleteToDTO} from "@coreModule/utilities/mappers/plugin/pluginMappers.dto";
import {mapPopulatedSimpleCurrency} from "@coreModule/utilities/mappers/common.mapper";

export function listingPackageToDTO(pkg: IListingPackage | any): ListingPackage {
    return {
        _id: pkg._id.toString(),
        listing: pkg.listing
            ? {
                _id: pkg.listing._id?.toString?.() ?? pkg.listing.toString(),
                title: pkg.listing.title,
            }
            : undefined,
        name: pkg.name,
        description: pkg.description,
        price: {
            amount: pkg.price?.amount ?? 0,
            currency: mapPopulatedSimpleCurrency(pkg.price?.currency),
        },
        deliveryDays: pkg.deliveryDays ?? 0,
        order: pkg.order ?? 0,
        ...mapOwnershipToDTO(pkg),
        ...mapSoftDeleteToDTO(pkg),
    };
}

export function listingPackagesToDTOArray(packages: (IListingPackage | any)[]): ListingPackage[] {
    return packages.map(listingPackageToDTO);
}
