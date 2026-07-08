import { Document, model, Schema, SchemaTypes } from "mongoose";
import { IUser } from "@coreModule/database/schemas/user/user";
import { ICompany } from "@coreModule/database/schemas/company/company";
import { IMedia } from "@coreModule/database/schemas/media/media";
import { normalizeSchemaPermissions } from "@coreModule/database/utilities";
import ownershipPlugin from "@coreModule/database/plugins/ownershipPlugin";
import auditPlugin from "@coreModule/database/plugins/auditPlugin";
import softDeletePlugin from "@coreModule/database/plugins/softDeletePlugin";
import { IOwnershipPluginFields, ISoftDeletePluginFields } from "@coreModule/database/types/plugin-fields";
import { addModelData } from "@coreModule/database/collections";
import { validateSchemaDefAgainstMongoose } from "@coreModule/database/utilities/validateSchemaDefAgainstMongoose";
import { ProviderProfileSchemaDef } from "armonia/src/modules/eCommerceMarketplace/api/eCommerceMarketplace/private/providerProfile/providerProfile.schema-def";
import { CompanyBlankSnippet } from "@coreModule/database/schemas/company/company.snippets";
import { MediaSimpleSnippet } from "@coreModule/database/schemas/media/media.snippets";
import { SimpleUserSnippet } from "@coreModule/database/schemas/user/user.snippets";
import { applyProviderProfileIndexes } from "./providerProfile.indexes";
import { providerProfileViews } from "./providerProfile.views";

export interface IProviderProfile extends Document, IOwnershipPluginFields, ISoftDeletePluginFields {
    user: IUser;
    company: ICompany;
    skills?: string[];
    bio?: string;
    portfolio?: IMedia[];
}

const ProviderProfileSchema = new Schema<IProviderProfile>(
    {
        user: {
            type: SchemaTypes.ObjectId,
            ref: "User",
            required: true,
            refAllowlist: SimpleUserSnippet,
        },
        skills: {
            type: [SchemaTypes.String],
            default: [],
        },
        bio: {
            type: SchemaTypes.String,
            default: "",
            trim: true,
        },
        portfolio: {
            type: [
                {
                    type: SchemaTypes.ObjectId,
                    ref: "Media",
                    refAllowlist: MediaSimpleSnippet,
                },
            ],
            default: [],
        },
    },
    {
        accessMode: "loose",
    }
);

ownershipPlugin(ProviderProfileSchema);
auditPlugin(ProviderProfileSchema);
softDeletePlugin(ProviderProfileSchema);
applyProviderProfileIndexes(ProviderProfileSchema);
const ProviderProfile = model<IProviderProfile>("ProviderProfile", ProviderProfileSchema);
normalizeSchemaPermissions(ProviderProfile);
export default ProviderProfile;

addModelData(ProviderProfile, providerProfileViews);
validateSchemaDefAgainstMongoose(ProviderProfileSchema, ProviderProfileSchemaDef, "ProviderProfile", ["user"]);
