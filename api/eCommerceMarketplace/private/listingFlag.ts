import {ObjectId} from "mongodb";
import {createCrudRouter} from "@coreModule/api/crudRouterFactory";
import {apiValidationException} from "armonia/src/modules/core/helpers/exceptions";
import {listingFlagService} from "@eCommerceMarketplaceModule/database/schemas/listingFlag/listingFlag.service";
import {listingService} from "@eCommerceMarketplaceModule/database/schemas/listing/listing.service";
import ListingFlag from "@eCommerceMarketplaceModule/database/schemas/listingFlag/listingFlag";
import {listingFlagListFormSchema} from "armonia/src/modules/eCommerceMarketplace/api/eCommerceMarketplace/private/listingFlag/listingFlagList.form.validator";
import {createListingFlagFormSchema} from "armonia/src/modules/eCommerceMarketplace/api/eCommerceMarketplace/private/listingFlag/createListingFlag.form.validator";
import {updateListingFlagFormSchema} from "armonia/src/modules/eCommerceMarketplace/api/eCommerceMarketplace/private/listingFlag/updateListingFlag.form.validator";
import {listingFlagToDTO, listingFlagsToDTO} from "@eCommerceMarketplaceModule/utilities/mappers/listingFlag/listingFlagMapper.dto";
import {listingFlagsToSelect} from "@eCommerceMarketplaceModule/utilities/mappers/listingFlag/listingFlagMapper.select";

export const basePath = "/api/eCommerceMarketplace/listingFlag";
export const {router} = createCrudRouter({
    collectionName: "listingflags",
    model: ListingFlag,
    service: listingFlagService,
    entityName: "ListingFlag",
    defaultSort: {createdAt: -1},
    selectSearchField: "reason",
    rateLimits: {read: 60, write: 30, delete: 20},
    listSchema: listingFlagListFormSchema,
    createSchema: createListingFlagFormSchema,
    editSchema: updateListingFlagFormSchema,
    toDTO: listingFlagToDTO,
    toDTOArray: listingFlagsToDTO,
    toSelect: listingFlagsToSelect,
    extraListFilter: async ({id, listingId, status, actionUserCtx}) => {
        const filter: Record<string, unknown> = {};

        if (id) {
            filter._id = new ObjectId(id);
        }
        if (listingId) {
            filter.listing = new ObjectId(listingId);
        }
        if (status) {
            filter.status = status;
        }
        if (!actionUserCtx.isAdmin) {
            filter.user = actionUserCtx.userId;
        }

        return filter;
    },
    buildCreateData: async ({listingId, reason, comment, actionUserCtx, company, session, logger, languageCode}) => {
        const listing = await listingService.findById(
            new ObjectId(listingId),
            {session, logger, languageCode},
            "",
            "_id company",
        );
        const listingCompanyId = (listing as any)?.company?._id ?? (listing as any)?.company;
        if (!listing || listingCompanyId?.toString?.() !== company._id.toString()) {
            throw apiValidationException("listing_not_found", null, null, languageCode);
        }

        const existing = await listingFlagService.findOne(
            {listing: new ObjectId(listingId), user: actionUserCtx.userId, company: company._id},
            {session, logger, languageCode},
        );
        if (existing) {
            throw apiValidationException("already_flagged", null, null, languageCode);
        }

        return {
            listing: new ObjectId(listingId),
            user: actionUserCtx.userId,
            reason,
            comment: comment?.trim() || undefined,
            status: "pending" as const,
        };
    },
    buildUpdateData: async ({status, resolution, actionUserCtx, languageCode}, writeFields) => {
        if (!actionUserCtx.isAdmin) {
            throw apiValidationException("admin_only", null, null, languageCode);
        }

        const update: Record<string, unknown> = {};

        if (status !== undefined && writeFields.status) {
            update.status = status;
        }
        if (resolution !== undefined && writeFields.resolution) {
            update.resolution = resolution?.trim() ? resolution.trim() : null;
        }

        return update;
    },
    afterUpdate: async (params, existing) => {
        const {status, listingAction, session, logger, languageCode, actionUserCtx, company} = params;

        if (status !== "reviewed" || listingAction !== "deactivate") {
            return;
        }

        const listingId = (existing as any).listing?._id ?? (existing as any).listing;
        if (!listingId) {
            return;
        }

        const listing = await listingService.findById(
            new ObjectId(listingId),
            {session, logger, languageCode},
            "",
            "_id company",
        );
        const listingCompanyId = (listing as any)?.company?._id ?? (listing as any)?.company;
        if (!listing || listingCompanyId?.toString?.() !== company._id.toString()) {
            return;
        }

        await listingService.updateById(
            new ObjectId(listingId),
            {$set: {status: "inactive"}},
            {session, logger, languageCode, auditUserId: actionUserCtx.userId, returnNew: true},
        );
    },
});
