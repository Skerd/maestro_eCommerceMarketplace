import { Document, model, Schema, SchemaTypes } from "mongoose";
import { normalizeSchemaPermissions } from "@coreModule/database/utilities";
import ownershipPlugin from "@coreModule/database/plugins/ownershipPlugin";
import auditPlugin from "@coreModule/database/plugins/auditPlugin";
import softDeletePlugin from "@coreModule/database/plugins/softDeletePlugin";
import {IOwnershipPluginFields, ISoftDeletePluginFields} from "@coreModule/database/types/plugin-fields";
import { ICompany } from "@coreModule/database/schemas/company/company";
import { applyListingCategoryIndexes } from "./listingCategory.indexes";
import { addModelData } from "@coreModule/database/collections";
import { listingCategoryViews } from "./listingCategory.views";
import { ListingCategorySimpleSnippet } from "@eCommerceMarketplaceModule/database/schemas/listingCategory/listingCategory.snippets";
import {validateSchemaDefAgainstMongoose} from "@coreModule/database/utilities/validateSchemaDefAgainstMongoose";
import {ListingCategorySchemaDef} from "armonia/src/modules/eCommerceMarketplace/api/eCommerceMarketplace/private/listingCategory/listingCategory.schema-def";

export interface IListingCategory extends Document, IOwnershipPluginFields, ISoftDeletePluginFields {
    company: ICompany;
    name: string;
    slug: string;
    parent?: IListingCategory;
    order: number;
}

const ListingCategorySchema = new Schema<IListingCategory>(
    {
        name: {
            type: SchemaTypes.String,
            required: true,
            trim: true,
        },
        slug: {
            type: SchemaTypes.String,
            required: true,
            trim: true,
        },
        parent: {
            type: SchemaTypes.ObjectId,
            ref: "ListingCategory",
            refAllowlist: ListingCategorySimpleSnippet,
        },
        order: {
            type: SchemaTypes.Number,
            default: 0,
        },
    },
    {
        accessMode: "loose",
        collection: "listingcategories",
    }
);

ownershipPlugin(ListingCategorySchema);
auditPlugin(ListingCategorySchema);
softDeletePlugin(ListingCategorySchema);
applyListingCategoryIndexes(ListingCategorySchema);
const ListingCategory = model<IListingCategory>("ListingCategory", ListingCategorySchema);
normalizeSchemaPermissions(ListingCategory);
export default ListingCategory;

addModelData(ListingCategory, listingCategoryViews);
validateSchemaDefAgainstMongoose(ListingCategorySchema, ListingCategorySchemaDef, "ListingCategory");
