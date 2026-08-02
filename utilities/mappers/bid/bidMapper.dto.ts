import {IBid} from "@eCommerceMarketplaceModule/database/schemas/bid/bid";
import type {Bid} from "armonia/src/modules/eCommerceMarketplace/api/eCommerceMarketplace/private/bid/bid.dto";
import {mapOwnershipToDTO, mapSoftDeleteToDTO, mapLifeCycleToDTO} from "@coreModule/utilities/mappers/plugin/pluginMappers.dto";
import {mapPopulatedSimpleCurrency, mapPopulatedUserWithPhoto} from "@coreModule/utilities/mappers/common.mapper";

export function bidToDTO(bid: IBid): Bid {
    return {
        _id: bid._id.toString(),
        name: bid.name,
        taskRequest: bid.taskRequest ? {
            _id: bid.taskRequest?._id?.toString(),
            title: bid.taskRequest?.title,
            name: bid.taskRequest?.name
        } : undefined,
        bidder: mapPopulatedUserWithPhoto(bid.bidder),
        amount: bid.amount,
        currency: mapPopulatedSimpleCurrency(bid.currency),
        proposal: bid.proposal,
        deliveryDays: bid.deliveryDays,
        status: bid.status,
        ...mapOwnershipToDTO(bid),
        ...mapSoftDeleteToDTO(bid),
        ...mapLifeCycleToDTO(bid),
    };
}

export function bidsToDTOArray(bids: IBid[]): Bid[] {
    return bids.map(bidToDTO);
}