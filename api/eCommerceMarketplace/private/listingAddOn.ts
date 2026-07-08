import {ObjectId} from "mongodb";
import {createCrudRouter} from "@coreModule/api/crudRouterFactory";
import {apiValidationException} from "armonia/src/modules/core/helpers/exceptions";
import {createListingAddOnFormSchema} from "armonia/src/modules/eCommerceMarketplace/api/eCommerceMarketplace/private/listingAddOn/createListingAddOn.form.validator";
import {editListingAddOnFormSchema} from "armonia/src/modules/eCommerceMarketplace/api/eCommerceMarketplace/private/listingAddOn/editListingAddOn.form.validator";
import {listingAddOnListFormSchema} from "armonia/src/modules/eCommerceMarketplace/api/eCommerceMarketplace/private/listingAddOn/listingAddOnList.form.validator";
import {listingService} from "@eCommerceMarketplaceModule/database/schemas/listing/listing.service";
import ListingAddOn from "@eCommerceMarketplaceModule/database/schemas/listingAddOn/listingAddOn";
import {listingAddOnService} from "@eCommerceMarketplaceModule/database/schemas/listingAddOn/listingAddOn.service";
import {listingAddOnToDTO, listingAddOnsToDTOArray} from "@eCommerceMarketplaceModule/utilities/mappers/listingAddOn/listingAddOnMapper.dto";
import {listingAddOnsToSelect} from "@eCommerceMarketplaceModule/utilities/mappers/listingAddOn/listingAddOnMapper.select";

export const basePath = "/api/eCommerceMarketplace/listingAddOn";
export const {router} = createCrudRouter({
    collectionName: "listingaddons",
    model: ListingAddOn,
    service: listingAddOnService,
    entityName: "ListingAddOn",
    defaultSort: {name: 1},
    listSchema: listingAddOnListFormSchema,
    createSchema: createListingAddOnFormSchema,
    editSchema: editListingAddOnFormSchema,
    toDTO: listingAddOnToDTO,
    toDTOArray: listingAddOnsToDTOArray,
    toSelect: listingAddOnsToSelect,
    extraListFilter: async ({listingId, company, logger, languageCode}) => {
        if (!listingId) {
            return {};
        }

        await listingService.findOneOrThrow(
            {_id: new ObjectId(listingId), company: company._id},
            {logger, languageCode},
        );

        return {listing: new ObjectId(listingId)};
    },
    buildCreateData: async ({listing, name, price, deliveryDays, company, session, logger, languageCode}) => {
        await listingService.findOneOrThrow(
            {_id: new ObjectId(listing), company: company._id},
            {session, logger, languageCode},
        );

        return {
            listing: new ObjectId(listing),
            name: name.trim(),
            price: {
                amount: price.amount,
                currency: new ObjectId(price.currency),
            },
            ...(deliveryDays != null ? {deliveryDays} : {}),
        };
    },
    buildUpdateData: async ({name, price, deliveryDays}, writeFields) => {
        const update: Record<string, unknown> = {};

        if (name !== undefined && writeFields.name) {
            update.name = name.trim();
        }

        const pricePerms = writeFields.price as {keys?: {amount?: boolean; currency?: boolean}} | boolean | undefined;
        if (price !== undefined && pricePerms) {
            const keys = typeof pricePerms === "object" && pricePerms.keys
                ? pricePerms.keys
                : {amount: true, currency: true};

            if (price.amount !== undefined && keys.amount) {
                update["price.amount"] = price.amount;
            }
            if (price.currency !== undefined && keys.currency) {
                update["price.currency"] = new ObjectId(price.currency);
            }
        }

        if (deliveryDays !== undefined && writeFields.deliveryDays) {
            update.deliveryDays = deliveryDays;
        }

        return update;
    },
    beforeDelete: async (params, doc) => {
        const listingId = (doc as any).listing?._id ?? (doc as any).listing;
        const listing = await listingService.findOneOrThrow(
            {_id: listingId, company: params.company._id},
            {session: params.session, logger: params.logger, languageCode: params.languageCode},
        );

        const listingProviderId = (listing as any).provider?._id?.toString?.() ?? (listing as any).provider?.toString?.();
        if (!params.actionUserCtx.isAdmin && listingProviderId !== params.actionUserCtx.userId?.toString?.()) {
            throw apiValidationException("only_listing_provider_can_delete_add_on", null, null, params.languageCode);
        }
    },
    rateLimits: {read: 60, write: 30, delete: 20},
});
