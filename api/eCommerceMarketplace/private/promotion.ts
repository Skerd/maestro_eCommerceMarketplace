import {ObjectId} from "mongodb";
import SchemaGuard from "@coreModule/database/security/schemaGuard";
import {createCrudRouter} from "@coreModule/api/crudRouterFactory";
import {createPromotionFormSchema} from "armonia/src/modules/eCommerceMarketplace/api/eCommerceMarketplace/private/promotion/createPromotion.form.validator";
import {editPromotionFormSchema} from "armonia/src/modules/eCommerceMarketplace/api/eCommerceMarketplace/private/promotion/editPromotion.form.validator";
import {promotionListFormSchema} from "armonia/src/modules/eCommerceMarketplace/api/eCommerceMarketplace/private/promotion/promotionList.form.validator";
import {listingService} from "@eCommerceMarketplaceModule/database/schemas/listing/listing.service";
import Promotion from "@eCommerceMarketplaceModule/database/schemas/promotion/promotion";
import {PromotionActions} from "@eCommerceMarketplaceModule/database/schemas/promotion/promotion.actions";
import {promotionService} from "@eCommerceMarketplaceModule/database/schemas/promotion/promotion.service";
import {promotionToDTO, promotionsToDTOArray} from "@eCommerceMarketplaceModule/utilities/mappers/promotion/promotionMapper.dto";
import {promotionsToSelect} from "@eCommerceMarketplaceModule/utilities/mappers/promotion/promotionMapper.select";

export const basePath = "/api/eCommerceMarketplace/promotion";
export const {router} = createCrudRouter({
    collectionName: "promotions",
    model: Promotion,
    service: promotionService,
    entityName: "Promotion",
    defaultSort: {startAt: 1},
    selectSearchField: "type",
    rateLimits: {read: 60, write: 20, delete: 20},
    actions: PromotionActions,
    listSchema: promotionListFormSchema,
    createSchema: createPromotionFormSchema,
    editSchema: editPromotionFormSchema,
    toDTO: promotionToDTO,
    toDTOArray: promotionsToDTOArray,
    toSelect: promotionsToSelect,
    buildCreateData: async ({listing: listingId, type, startAt, endAt, session, logger, languageCode, company, ...params}) => {
        const listing = await listingService.findOne({_id: new ObjectId(listingId), company: company._id, status: "active"}, {session, logger, languageCode});
        return {
            listing: listing._id,
            type: type || "featured",
            startAt: new Date(startAt),
            endAt: new Date(endAt),
        };
    },
    buildUpdateData: async () =>
        ({}) /** Promotion fields use write: no-permission — pause/resume/stop via actions */,
    afterCreate: async (created, params) => {
        const {session, logger, languageCode} = params;
        const listingId = (created.listing?._id ?? created.listing)?.toString();
        if (!listingId) return;
        await listingService.updateByIdOrThrow(
            new ObjectId(listingId),
            {$push: {promotions: created._id}},
            {session, logger, languageCode},
        );
    },
    afterDelete: async (params, doc) => {
        const {session, logger, languageCode} = params;
        const listingId = (doc.listing?._id ?? doc.listing)?.toString();
        if (!listingId) return;
        await listingService.updateByIdOrThrow(
            new ObjectId(listingId),
            {$pull: {promotions: doc._id}},
            {session, logger, languageCode},
        );
    },
    overrideRestoreHandler: async (params) => {
        const {logger, languageCode, session, _id, company, actionUserCtx} = params;
        logger.start(`Restoring Promotion ${_id}...`);
        SchemaGuard.checkModelPermission(Promotion, "restore", actionUserCtx, languageCode);
        const restored = await promotionService.restoreOneOrThrow(
            {_id: new ObjectId(_id), company: company._id},
            {session, logger, languageCode, auditUserId: actionUserCtx.userId},
        );
        const listingId = (restored.listing?._id ?? restored.listing)?.toString();
        if (listingId) {
            await listingService.updateByIdOrThrow(
                new ObjectId(listingId),
                {$push: {promotions: restored._id}},
                {session, logger, languageCode},
            );
        }
        return {message: "Promotion successfully restored"};
    },
});
