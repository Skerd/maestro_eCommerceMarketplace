import {Document, model, Schema, SchemaTypes} from "mongoose";
import {IUser} from "@coreModule/database/schemas/user/user";
import {ICurrency} from "@coreModule/database/schemas/currency/currency";
import {ITaskRequest} from "@eCommerceMarketplaceModule/database/schemas/taskRequest/taskRequest";
import {normalizeSchemaPermissions} from "@coreModule/database/utilities";
import ownershipPlugin from "@coreModule/database/plugins/ownershipPlugin";
import auditPlugin from "@coreModule/database/plugins/auditPlugin";
import {IOwnershipPluginFields, ISoftDeletePluginFields} from "@coreModule/database/types/plugin-fields";
import {addModelData} from "@coreModule/database/collections";
import {CurrencySimpleSnippet} from "@coreModule/database/schemas/currency/currency.snippets";
import {SimpleUserSnippet} from "@coreModule/database/schemas/user/user.snippets";
import {TaskRequestSimpleSnippet} from "@eCommerceMarketplaceModule/database/schemas/taskRequest/taskRequest.snippets";
import {validateSchemaDefAgainstMongoose} from "@coreModule/database/utilities/validateSchemaDefAgainstMongoose";
import {BidSchemaDef} from "armonia/src/modules/eCommerceMarketplace/api/eCommerceMarketplace/private/bid/bid.schema-def";
import {applyBidIndexes} from "./bid.indexes";
import {bidViews} from "./bid.views";
import softDeletePlugin from "@coreModule/database/plugins/softDeletePlugin";
import dayjs from "dayjs";
import crypto from "crypto";
import {IListing} from "@eCommerceMarketplaceModule/database/schemas/listing/listing";
import {ListingSimpleSnippet} from "@eCommerceMarketplaceModule/database/schemas/listing/listing.snippets";

export type BidStatus = "pending" | "accepted" | "rejected";

export interface IBid extends Document, IOwnershipPluginFields, ISoftDeletePluginFields {
    name: string;
    listing?: IListing;
    taskRequest: ITaskRequest;
    bidder: IUser;
    amount: number;
    currency: ICurrency;
    proposal: string;
    deliveryDays: number;
    status: BidStatus;
}

const BidSchema = new Schema<IBid>(
    {
        name: {
            type: SchemaTypes.String,
            trim: true,
            immutable: true,
            permissions: {
                self: {write: "no-permission"},
                others: {write: "no-permission"},
            },
        },
        listing: {
            type: SchemaTypes.ObjectId,
            ref: "Listing",
            required: false,
            refAllowlist: ListingSimpleSnippet,
        },
        taskRequest: {
            type: SchemaTypes.ObjectId,
            ref: "TaskRequest",
            required: true,
            refAllowlist: TaskRequestSimpleSnippet,
        },
        bidder: {
            type: SchemaTypes.ObjectId,
            ref: "User",
            required: true,
            refAllowlist: SimpleUserSnippet,
        },
        amount: {
            type: SchemaTypes.Number,
            required: true,
            default: 0,
        },
        currency: {
            type: SchemaTypes.ObjectId,
            ref: "Currency",
            required: true,
            refAllowlist: CurrencySimpleSnippet,
        },
        proposal: {
            type: SchemaTypes.String,
            required: true,
            default: "",
        },
        deliveryDays: {
            type: SchemaTypes.Number,
            required: true,
            default: 1,
        },
        status: {
            type: SchemaTypes.String,
            enum: ["pending", "accepted", "rejected"],
            default: "pending",
        },
    },
    {
        accessMode: "loose",
    },
);

BidSchema.pre("save", function (next) {
    const bid = this as IBid;
    if (bid.isNew && !bid.name) {
        const datePart = dayjs(new Date()).format("YYYYMMDD");
        const randomPart = crypto.randomBytes(4).toString("hex");
        bid.name = `BID-${datePart}-${randomPart}`.toUpperCase();
    }
    next();
});

ownershipPlugin(BidSchema);
softDeletePlugin(BidSchema);
auditPlugin(BidSchema);
applyBidIndexes(BidSchema);
const Bid = model<IBid>("Bid", BidSchema);
normalizeSchemaPermissions(Bid);
export default Bid;

addModelData(Bid, bidViews);
validateSchemaDefAgainstMongoose(BidSchema, BidSchemaDef, "Bid", ["status", "currency", "bidder"]);
