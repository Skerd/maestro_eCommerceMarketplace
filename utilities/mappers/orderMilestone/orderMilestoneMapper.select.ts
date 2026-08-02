import type {ApiSelectDatum} from "armonia/src/modules/core/types/shared.types";
import type {IOrderMilestone} from "@eCommerceMarketplaceModule/database/schemas/orderMilestone/orderMilestone";

export function orderMilestoneToSelect(milestone: IOrderMilestone | any): ApiSelectDatum {
    const name = typeof milestone.name === "string" ? milestone.name.trim() : "";
    const label = name || milestone._id.toString();

    return {
        value: milestone._id.toString(),
        label,
    };
}

export function orderMilestonesToSelect(milestones: (IOrderMilestone | any)[]): ApiSelectDatum[] {
    return milestones.map(orderMilestoneToSelect);
}
