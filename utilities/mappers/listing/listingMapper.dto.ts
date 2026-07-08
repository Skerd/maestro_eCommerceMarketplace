import type {IListing} from "@eCommerceMarketplaceModule/database/schemas/listing/listing";
import {Listing} from "armonia/src/modules/eCommerceMarketplace/api/eCommerceMarketplace/private/listing/listing.dto";
import {mapMedia, mapPopulatedRef, mapPopulatedSimpleCurrency, mapPopulatedSimpleUser} from "@coreModule/utilities/mappers/common.mapper";
import {mapOwnershipToDTO, mapSoftDeleteToDTO} from "@coreModule/utilities/mappers/plugin/pluginMappers.dto";

export function listingToDTO(listing: IListing): Listing {
    return {
        _id: listing._id.toString(),
        name: listing.name,
        title: listing.title,
        description: listing.description,
        category: mapPopulatedRef(listing.category),
        provider: mapPopulatedSimpleUser(listing.provider),
        price: listing.price,
        priceCurrency: mapPopulatedSimpleCurrency(listing.priceCurrency),
        status: listing.status,
        pricingType: listing.pricingType,
        deliveryDays: listing.deliveryDays,
        tags: listing.tags,
        address: listing.address ? {
            country: mapPopulatedRef(listing.address?.country),
            state: listing.address?.state ? mapPopulatedRef(listing.address?.state) : undefined,
            city: mapPopulatedRef(listing.address?.city)
        } : undefined,
        mainImage: listing.mainImage ? mapMedia(listing.mainImage) : undefined,
        imageGallery: listing.imageGallery?.map(mapMedia),
        videoGallery: listing.videoGallery?.length ? listing.videoGallery.map(mapMedia) : undefined,
        faqs: listing.faqs,
        requirements: listing.requirements,
        promotions: listing.promotions?.map((p: any) => ({
            _id: (p._id ?? p).toString(),
            name: p.name,
            type: p.type,
            startAt: p.startAt,
            endAt: p.endAt,
        })),
        avgRating: (listing as any).avgRating ?? 0,
        reviewCount: (listing as any).reviewCount ?? 0,
        ...mapSoftDeleteToDTO(listing),
        ...mapOwnershipToDTO(listing),
    };
}

export function listingsToDTO(listings: IListing[]): Listing[] {
    return listings.map(listingToDTO);
}
