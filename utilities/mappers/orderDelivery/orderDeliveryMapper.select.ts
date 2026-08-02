import type {ApiSelectDatum} from "armonia/src/modules/core/types/shared.types";
import type {IOrderDelivery} from "@eCommerceMarketplaceModule/database/schemas/orderDelivery/orderDelivery";

export function orderDeliveryToSelect(delivery: IOrderDelivery | any): ApiSelectDatum {
    const status = delivery.status ?? "";
    const label = status ? `Delivery · ${status}` : delivery._id.toString();

    return {
        value: delivery._id.toString(),
        label,
    };
}

export function orderDeliveriesToSelect(deliveries: (IOrderDelivery | any)[]): ApiSelectDatum[] {
    return deliveries.map(orderDeliveryToSelect);
}
