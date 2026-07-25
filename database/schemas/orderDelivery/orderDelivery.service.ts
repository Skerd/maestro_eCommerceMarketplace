import OrderDelivery, { IOrderDelivery } from "@eCommerceMarketplaceModule/database/schemas/orderDelivery/orderDelivery";
import { BaseCrudService } from "@coreModule/database/services/baseCrudService";

export class OrderDeliveryService extends BaseCrudService<IOrderDelivery, typeof OrderDelivery> {
    constructor() {
        super(OrderDelivery, "OrderDelivery");
    }
}

export const orderDeliveryService = new OrderDeliveryService();
