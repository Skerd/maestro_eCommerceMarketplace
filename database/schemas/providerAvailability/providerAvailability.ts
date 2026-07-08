import { Document, model, Schema, SchemaTypes } from "mongoose";
import { IUser } from "@coreModule/database/schemas/user/user";
import { ICompany } from "@coreModule/database/schemas/company/company";
import { normalizeSchemaPermissions } from "@coreModule/database/utilities";
import ownershipPlugin from "@coreModule/database/plugins/ownershipPlugin";
import auditPlugin from "@coreModule/database/plugins/auditPlugin";
import softDeletePlugin from "@coreModule/database/plugins/softDeletePlugin";
import { IOwnershipPluginFields, ISoftDeletePluginFields } from "@coreModule/database/types/plugin-fields";
import { addModelData } from "@coreModule/database/collections";
import { validateSchemaDefAgainstMongoose } from "@coreModule/database/utilities/validateSchemaDefAgainstMongoose";
import { ProviderAvailabilitySchemaDef } from "armonia/src/modules/eCommerceMarketplace/api/eCommerceMarketplace/private/providerAvailability/providerAvailability.schema-def";
import { CompanyBlankSnippet } from "@coreModule/database/schemas/company/company.snippets";
import { SimpleUserSnippet } from "@coreModule/database/schemas/user/user.snippets";
import { applyProviderAvailabilityIndexes } from "./providerAvailability.indexes";
import { providerAvailabilityViews } from "./providerAvailability.views";

export interface IProviderAvailability extends Document, IOwnershipPluginFields, ISoftDeletePluginFields {
    provider: IUser;
    company: ICompany;
    dayOfWeek: number; // 0 = Sunday, 6 = Saturday
    startTime: string; // "HH:mm"
    endTime: string; // "HH:mm"
    timezone: string; // e.g. "America/New_York"
}

const ProviderAvailabilitySchema = new Schema<IProviderAvailability>(
    {
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
        dayOfWeek: {
            type: SchemaTypes.Number,
            required: true,
            min: 0,
            max: 6,
        },
        startTime: {
            type: SchemaTypes.String,
            required: true,
            trim: true,
        },
        endTime: {
            type: SchemaTypes.String,
            required: true,
            trim: true,
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

ownershipPlugin(ProviderAvailabilitySchema);
auditPlugin(ProviderAvailabilitySchema);
softDeletePlugin(ProviderAvailabilitySchema);
applyProviderAvailabilityIndexes(ProviderAvailabilitySchema);
const ProviderAvailability = model<IProviderAvailability>("ProviderAvailability", ProviderAvailabilitySchema);
normalizeSchemaPermissions(ProviderAvailability);
export default ProviderAvailability;

addModelData(ProviderAvailability, providerAvailabilityViews);
validateSchemaDefAgainstMongoose(ProviderAvailabilitySchema, ProviderAvailabilitySchemaDef, "ProviderAvailability", ["provider"]);
