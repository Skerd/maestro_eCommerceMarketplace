import {ObjectId} from "mongodb";
import slugify from "slugify";
import {createCrudRouter} from "@coreModule/api/crudRouterFactory";
import {buildCreateDataFromSchemaDef, buildUpdateDataFromSchemaDef} from "@coreModule/api/buildUpdateDataFromSchemaDef";
import {ListingCategorySchemaDef} from "armonia/src/modules/eCommerceMarketplace/api/eCommerceMarketplace/private/listingCategory/listingCategory.schema-def";
import {createListingCategoryFormSchema} from "armonia/src/modules/eCommerceMarketplace/api/eCommerceMarketplace/private/listingCategory/createListingCategory.form.validator";
import {editListingCategoryFormSchema} from "armonia/src/modules/eCommerceMarketplace/api/eCommerceMarketplace/private/listingCategory/editListingCategory.form.validator";
import {listingCategorySelectFormSchema} from "armonia/src/modules/eCommerceMarketplace/api/eCommerceMarketplace/private/listingCategory/listingCategory.select.form.validator";
import ListingCategory from "@eCommerceMarketplaceModule/database/schemas/listingCategory/listingCategory";
import {listingCategoryService} from "@eCommerceMarketplaceModule/database/schemas/listingCategory/listingCategory.service";
import {listingCategoriesToDTO, listingCategoryToDTO} from "@eCommerceMarketplaceModule/utilities/mappers/listingCategory/listingCategoryMapper.dto";
import {listingCategoriesToSelect} from "@eCommerceMarketplaceModule/utilities/mappers/listingCategory/listingCategoryMapper.select";

const buildCreate = buildCreateDataFromSchemaDef(ListingCategorySchemaDef);
const buildUpdate = buildUpdateDataFromSchemaDef(ListingCategorySchemaDef);

export const basePath = "/api/eCommerceMarketplace/listingCategory";
export const {router} = createCrudRouter({
    collectionName: "listingcategories",
    model: ListingCategory,
    service: listingCategoryService,
    entityName: "ListingCategory",
    selectSearchField: "name",
    selectSort: {order: 1, name: 1},
    defaultSort: {order: 1},
    createSchema: createListingCategoryFormSchema,
    editSchema: editListingCategoryFormSchema,
    selectSchema: listingCategorySelectFormSchema,
    toDTO: listingCategoryToDTO,
    toDTOArray: listingCategoriesToDTO,
    toSelect: listingCategoriesToSelect,
    extraSelectFilter: async ({parentId, excludeCategoryId}) => {
        const filter: Record<string, unknown> = {};
        if (parentId) filter.parent = new ObjectId(parentId as string);
        if (excludeCategoryId && ObjectId.isValid(excludeCategoryId as string)) {
            filter._id = {$ne: new ObjectId(excludeCategoryId as string)};
        }
        return filter;
    },
    buildCreateData: async (params) => {
        const createParams = {
            ...params,
            parent: params.parentId ?? params.parent,
        };
        const data = buildCreate(createParams);
        data.slug = params.slug?.trim() || slugify(params.name);
        if (data.order === undefined) data.order = 0;
        return data;
    },
    buildUpdateData: async (params, writeFields) => {
        const update = buildUpdate(params, writeFields);
        if (params.slug !== undefined && writeFields.slug && typeof update.slug === "string") {
            update.slug = update.slug.trim();
        }
        if (params.name !== undefined && writeFields.name && typeof update.name === "string") {
            update.name = update.name.trim();
        }
        return update;
    },
    rateLimits: {read: 60, write: 30, delete: 20},
});
