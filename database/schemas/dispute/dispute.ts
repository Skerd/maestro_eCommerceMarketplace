import { Document, model, Schema, SchemaTypes } from "mongoose";
import { IOrder } from "@eCommerceMarketplaceModule/database/schemas/order/order";
import { IUser } from "@coreModule/database/schemas/user/user";
import { ICompany } from "@coreModule/database/schemas/company/company";
import { normalizeSchemaPermissions } from "@coreModule/database/utilities";
import ownershipPlugin from "@coreModule/database/plugins/ownershipPlugin";
import auditPlugin from "@coreModule/database/plugins/auditPlugin";
import {IOwnershipPluginFields, ISoftDeletePluginFields} from "@coreModule/database/types/plugin-fields";
import { addModelData } from "@coreModule/database/collections";
import { CompanyBlankSnippet } from "@coreModule/database/schemas/company/company.snippets";
import { SimpleUserSnippet } from "@coreModule/database/schemas/user/user.snippets";
import {
    OrderSimpleSnippet,
    OrderWithTaskOrListingSnippet
} from "@eCommerceMarketplaceModule/database/schemas/order/order.snippets";
import {validateSchemaDefAgainstMongoose} from "@coreModule/database/utilities/validateSchemaDefAgainstMongoose";
import {DisputeSchemaDef} from "armonia/src/modules/eCommerceMarketplace/api/eCommerceMarketplace/private/dispute/dispute.schema-def";
import { applyDisputeIndexes } from "./dispute.indexes";
import { disputeViews } from "./dispute.views";
import softDeletePlugin from "@coreModule/database/plugins/softDeletePlugin";

export type DisputeStatus = "open" | "under_review" | "resolved" | "closed";

export interface IDispute extends Document, IOwnershipPluginFields, ISoftDeletePluginFields {
    order: IOrder;
    initiator: IUser;
    company: ICompany;
    reason: string;
    status: DisputeStatus;
    resolution?: string;
}

const DisputeSchema = new Schema<IDispute>(
    {
        order: {
            type: SchemaTypes.ObjectId,
            ref: "Order",
            required: true,
            refAllowlist: OrderWithTaskOrListingSnippet,
        },
        initiator: {
            type: SchemaTypes.ObjectId,
            ref: "User",
            required: true,
            refAllowlist: SimpleUserSnippet,
        },
        reason: {
            type: SchemaTypes.String,
            required: true,
            trim: true,
        },
        status: {
            type: SchemaTypes.String,
            enum: ["open", "under_review", "resolved", "closed"],
            default: "open",
        },
        resolution: {
            type: SchemaTypes.String,
            trim: true,
        },
    },
    {
        accessMode: "loose",
    }
);

ownershipPlugin(DisputeSchema);
auditPlugin(DisputeSchema);
softDeletePlugin(DisputeSchema);
applyDisputeIndexes(DisputeSchema);
const Dispute = model<IDispute>("Dispute", DisputeSchema);
normalizeSchemaPermissions(Dispute);
export default Dispute;

addModelData(Dispute, disputeViews);
validateSchemaDefAgainstMongoose(DisputeSchema, DisputeSchemaDef, "Dispute", ["initiator", "status"]);
