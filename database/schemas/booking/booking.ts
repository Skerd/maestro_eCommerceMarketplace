import { Document, model, Schema, SchemaTypes } from "mongoose";
import { IOrder } from "@eCommerceMarketplaceModule/database/schemas/order/order";
import { ICompany } from "@coreModule/database/schemas/company/company";
import { IUser } from "@coreModule/database/schemas/user/user";
import { normalizeSchemaPermissions } from "@coreModule/database/utilities";
import ownershipPlugin from "@coreModule/database/plugins/ownershipPlugin";
import auditPlugin from "@coreModule/database/plugins/auditPlugin";
import softDeletePlugin from "@coreModule/database/plugins/softDeletePlugin";
import { IOwnershipPluginFields, ISoftDeletePluginFields } from "@coreModule/database/types/plugin-fields";
import { addModelData } from "@coreModule/database/collections";
import { CompanyBlankSnippet } from "@coreModule/database/schemas/company/company.snippets";
import { SimpleUserSnippet } from "@coreModule/database/schemas/user/user.snippets";
import { OrderSimpleSnippet } from "@eCommerceMarketplaceModule/database/schemas/order/order.snippets";
import { validateSchemaDefAgainstMongoose } from "@coreModule/database/utilities/validateSchemaDefAgainstMongoose";
import { BookingSchemaDef } from "armonia/src/modules/eCommerceMarketplace/api/eCommerceMarketplace/private/booking/booking.schema-def";
import { applyBookingIndexes } from "./booking.indexes";
import { bookingViews } from "./booking.views";

export interface IBooking extends Document, IOwnershipPluginFields, ISoftDeletePluginFields {
    order: IOrder;
    provider: IUser;
    company: ICompany;
    startAt: Date;
    endAt: Date;
    timezone: string;
}

const BookingSchema = new Schema<IBooking>(
    {
        order: {
            type: SchemaTypes.ObjectId,
            ref: "Order",
            required: true,
            refAllowlist: OrderSimpleSnippet,
        },
        provider: {
            type: SchemaTypes.ObjectId,
            ref: "User",
            required: true,
            refAllowlist: SimpleUserSnippet,
        },
        company: {
            type: SchemaTypes.ObjectId,
            ref: "Company",
            required: true,
            refAllowlist: CompanyBlankSnippet,
        },
        startAt: {
            type: SchemaTypes.Date,
            required: true,
        },
        endAt: {
            type: SchemaTypes.Date,
            required: true,
        },
        timezone: {
            type: SchemaTypes.String,
            required: true,
            default: "UTC",
            trim: true,
        },
    },
    {
        accessMode: "loose",
    }
);

ownershipPlugin(BookingSchema);
auditPlugin(BookingSchema);
softDeletePlugin(BookingSchema);
applyBookingIndexes(BookingSchema);
const Booking = model<IBooking>("Booking", BookingSchema);
normalizeSchemaPermissions(Booking);
export default Booking;

addModelData(Booking, bookingViews);
validateSchemaDefAgainstMongoose(BookingSchema, BookingSchemaDef, "Booking", ["startAt", "endAt"]);
