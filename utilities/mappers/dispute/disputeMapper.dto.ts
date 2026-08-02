import { IDispute } from "@eCommerceMarketplaceModule/database/schemas/dispute/dispute";
import { Dispute } from "armonia/src/modules/eCommerceMarketplace/api/eCommerceMarketplace/private/dispute/dispute.dto";
import {mapPopulatedSimpleCurrency, mapPopulatedUserWithPhoto} from "@coreModule/utilities/mappers/common.mapper";
import {mapOwnershipToDTO, mapSoftDeleteToDTO, mapLifeCycleToDTO} from "@coreModule/utilities/mappers/plugin/pluginMappers.dto";

export function disputeToDTO(dispute: IDispute): Dispute {
    return {
        _id: dispute._id.toString(),
        order: dispute.order ? {
            _id: dispute.order._id?.toString(),
            name: dispute.order.name,
            status: dispute.order.status,
            currency: mapPopulatedSimpleCurrency(dispute.order.currency),
            taskRequest: dispute.order.taskRequest ? {
                _id: dispute.order.taskRequest?._id?.toString(),
                name: dispute.order.taskRequest?.name,
                status: dispute.order.taskRequest?.status,
                title: dispute.order.taskRequest?.title,
            }: undefined,
            listing: dispute.order.listing ? {
                _id: dispute.order.listing?._id?.toString(),
                name: dispute.order.listing?.name,
                status: dispute.order.listing?.status,
                title: dispute.order.listing?.title,
            }: undefined
        } : undefined,
        initiator: mapPopulatedUserWithPhoto(dispute.initiator),
        reason: dispute.reason,
        status: dispute.status,
        resolution: dispute.resolution,
        ...mapOwnershipToDTO(dispute),
        ...mapSoftDeleteToDTO(dispute),
        ...mapLifeCycleToDTO(dispute),
    };
}

export function disputesToDTO(disputes: IDispute[]): Dispute[] {
    return disputes.map(disputeToDTO);
}
