import { IOrder } from "@eCommerceMarketplaceModule/database/schemas/order/order";
import type {Order} from "armonia/src/modules/eCommerceMarketplace/api/eCommerceMarketplace/private/order/order.dto";
import {mapPopulatedSimpleCurrency, mapPopulatedUserWithPhoto} from "@coreModule/utilities/mappers/common.mapper";
import {mapOwnershipToDTO, mapSoftDeleteToDTO} from "@coreModule/utilities/mappers/plugin/pluginMappers.dto";

export function orderToDTO(order: IOrder | any, deliverySubmitted = false, hasActiveDispute = false): Order {
    return {
        _id: order._id.toString(),
        name: order.name,
        listing: order.listing ? {
            _id: order.listing._id.toString(),
            name: order.listing.name,
            title: order.listing.title,
            status: order.listing.status
        } : undefined,
        taskRequest: order.taskRequest ? {
            _id: order.taskRequest._id.toString(),
            title: order.taskRequest.title,
            name: order.taskRequest.name,
            status: order.taskRequest.status
        } : undefined,
        bid: order.bid ? {
            _id: order.bid._id.toString(),
            name: order.bid.name,
            amount: order.bid.amount,
            status: order.bid.status
        } : undefined,
        customer: mapPopulatedUserWithPhoto(order.customer),
        provider: mapPopulatedUserWithPhoto(order.provider),
        amount: order.amount,
        currency: mapPopulatedSimpleCurrency(order.currency),
        status: order.status,
        deliveryDueDate: order.deliveryDueDate,
        deliverySubmitted,
        hasActiveDispute,
        ...mapOwnershipToDTO(order),
        ...mapSoftDeleteToDTO(order)
    };
}

export function ordersToDTO(
    orders: IOrder[],
    submittedDeliveryOrderIds?: Set<string>,
    activeDisputeOrderIds?: Set<string>,
): Order[] {
    return orders.map((order) =>
        orderToDTO(
            order,
            submittedDeliveryOrderIds?.has(order._id.toString()) ?? false,
            activeDisputeOrderIds?.has(order._id.toString()) ?? false,
        ),
    );
}
