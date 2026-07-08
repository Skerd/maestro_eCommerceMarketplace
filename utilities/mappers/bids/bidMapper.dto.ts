import {IBid} from "@eCommerceMarketplaceModule/database/schemas/bid/bid";
import type {Bid} from "armonia/src/modules/eCommerceMarketplace/api/eCommerceMarketplace/private/bid/bid.dto";
import {mapOwnershipToDTO, mapSoftDeleteToDTO} from "@coreModule/utilities/mappers/plugin/pluginMappers.dto";
import {mapPopulatedSimpleCurrency, mapPopulatedUserWithPhoto} from "@coreModule/utilities/mappers/common.mapper";

export function bidToDTO(bid: IBid | any): Bid {
    return {
        _id: bid._id.toString(),
        listing: bid.listing
            ? {_id: bid.listing._id?.toString() ?? bid.listing.toString(), title: bid.listing.title}
            : undefined,
        name: bid.name,
        taskRequest: bid.taskRequest ? {
            _id: bid.taskRequest?._id?.toString(),
            title: bid.taskRequest?.title,
            name: bid.taskRequest?.name
        } : undefined,
        bidder: mapPopulatedUserWithPhoto(bid.bidder),
        amount: typeof bid.amount === "number" ? bid.amount : parseFloat(String(bid.amount || 0)),
        currency: mapPopulatedSimpleCurrency(bid.currency),
        proposal: bid.proposal,
        deliveryDays: bid.deliveryDays ?? 1,
        status: bid.status,
        ...mapOwnershipToDTO(bid),
        ...mapSoftDeleteToDTO(bid)
    };
}

export function bidsToDTOArray(bids: IBid[]): Bid[] {
    return bids.map(bidToDTO);
}