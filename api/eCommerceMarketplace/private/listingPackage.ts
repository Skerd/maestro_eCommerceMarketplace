import {ObjectId} from "mongodb";
import {createCrudRouter} from "@coreModule/api/crudRouterFactory";
import {apiValidationException} from "armonia/src/modules/core/helpers/exceptions";
import {createListingPackageFormSchema} from "armonia/src/modules/eCommerceMarketplace/api/eCommerceMarketplace/private/listingPackage/createListingPackage.form.validator";
import {editListingPackageFormSchema} from "armonia/src/modules/eCommerceMarketplace/api/eCommerceMarketplace/private/listingPackage/editListingPackage.form.validator";
import {listingPackageListFormSchema} from "armonia/src/modules/eCommerceMarketplace/api/eCommerceMarketplace/private/listingPackage/listingPackageList.form.validator";
import {listingService} from "@eCommerceMarketplaceModule/database/schemas/listing/listing.service";
import ListingPackage from "@eCommerceMarketplaceModule/database/schemas/listingPackage/listingPackage";
import {listingPackageService} from "@eCommerceMarketplaceModule/database/schemas/listingPackage/listingPackage.service";
import {listingPackageToDTO, listingPackagesToDTOArray} from "@eCommerceMarketplaceModule/utilities/mappers/listingPackage/listingPackageMapper.dto";
import {listingPackagesToSelect} from "@eCommerceMarketplaceModule/utilities/mappers/listingPackage/listingPackageMapper.select";

export const basePath = "/api/eCommerceMarketplace/listingPackage";
export const {router} = createCrudRouter({
    collectionName: "listingpackages",
    model: ListingPackage,
    service: listingPackageService,
    entityName: "ListingPackage",
    defaultSort: {order: 1, name: 1},
    listSchema: listingPackageListFormSchema,
    createSchema: createListingPackageFormSchema,
    editSchema: editListingPackageFormSchema,
    toDTO: listingPackageToDTO,
    toDTOArray: listingPackagesToDTOArray,
    toSelect: listingPackagesToSelect,
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
    buildCreateData: async ({listing, name, description, price, deliveryDays, order, company, session, logger, languageCode}) => {
        await listingService.findOneOrThrow(
            {_id: new ObjectId(listing), company: company._id},
            {session, logger, languageCode},
        );

        return {
            listing: new ObjectId(listing),
            name: name.trim(),
            description: description?.trim() || "",
            price: {
                amount: price.amount,
                currency: new ObjectId(price.currency),
            },
            deliveryDays: deliveryDays ?? 1,
            order: order ?? 0,
        };
    },
    buildUpdateData: async ({name, description, price, deliveryDays, order}, writeFields) => {
        const update: Record<string, unknown> = {};

        if (name !== undefined && writeFields.name) {
            update.name = name.trim();
        }
        if (description !== undefined && writeFields.description) {
            update.description = description?.trim() || "";
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
        if (order !== undefined && writeFields.order) {
            update.order = order;
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
            throw apiValidationException("only_listing_provider_can_delete_package", null, null, params.languageCode);
        }
    },
    rateLimits: {read: 60, write: 30, delete: 20},
});
