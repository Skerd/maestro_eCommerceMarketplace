import type {IListingCategory} from "@eCommerceMarketplaceModule/database/schemas/listingCategory/listingCategory";
import type {ListingCategory} from "armonia/src/modules/eCommerceMarketplace/api/eCommerceMarketplace/private/listingCategory/listingCategory.dto";
import {mapOwnershipToDTO, mapSoftDeleteToDTO} from "@coreModule/utilities/mappers/plugin/pluginMappers.dto";

export function listingCategoryToDTO(cat: IListingCategory | any): ListingCategory {
    return {
        _id: cat._id.toString(),
        name: cat.name,
        slug: cat.slug,
        parent: cat.parent ? {
            _id: cat.parent._id.toString(),
            name: cat.parent.name,
            slug: cat.parent.slug,
        } : undefined,
        order: cat.order,
        ...mapSoftDeleteToDTO(cat),
        ...mapOwnershipToDTO(cat),
    };
}

export function listingCategoriesToDTO(categories: IListingCategory[]): ListingCategory[] {
    return categories.map(listingCategoryToDTO);
}
