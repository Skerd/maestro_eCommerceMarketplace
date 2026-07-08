import {IReview} from "@eCommerceMarketplaceModule/database/schemas/review/review";
import {Review} from "armonia/src/modules/eCommerceMarketplace/api/eCommerceMarketplace/private/review/review.dto";
import {mapPopulatedSimpleCurrency, mapPopulatedUserWithPhoto} from "@coreModule/utilities/mappers/common.mapper";
import {mapOwnershipToDTO, mapSoftDeleteToDTO} from "@coreModule/utilities/mappers/plugin/pluginMappers.dto";

export function reviewToDTO(review: IReview | any): Review {
    return {
        _id: review._id.toString(),
        order: review.order
            ? {
                _id: review.order._id?.toString(),
                name: review.order.name,
                status: review.order.status,
                amount: review.order.amount,
                currency: mapPopulatedSimpleCurrency(review.order.currency),
                taskRequest: review.order.taskRequest
                    ? {
                        _id: review.order.taskRequest._id?.toString(),
                        name: review.order.taskRequest.name,
                        title: review.order.taskRequest.title,
                        status: review.order.taskRequest.status,
                    }
                    : undefined,
                listing: review.order.listing
                    ? {
                        _id: review.order.listing._id?.toString(),
                        name: review.order.listing.name,
                        title: review.order.listing.title,
                        status: review.order.listing.status,
                    }
                    : undefined,
            }
            : undefined,
        listing: review.listing
            ? {_id: review.listing._id.toString(), title: review.listing.title || ""}
            : undefined,
        rating: typeof review.rating === "number" ? review.rating : parseInt(String(review.rating || 0), 10),
        comment: review.comment,
        reviewer: mapPopulatedUserWithPhoto(review.reviewer),
        createdAt: review.createdAt?.toISOString?.() ?? review.createdAt,
        ...mapOwnershipToDTO(review),
        ...mapSoftDeleteToDTO(review),
    };
}

export function reviewsToDTO(reviews: IReview[]): Review[] {
    return reviews.map(reviewToDTO);
}
