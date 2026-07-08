import {ObjectId} from "mongodb";
import {createCrudRouter} from "@coreModule/api/crudRouterFactory";
import SchemaGuard from "@coreModule/database/security/schemaGuard";
import {apiValidationException} from "armonia/src/modules/core/helpers/exceptions";
import {createReviewFormSchema} from "armonia/src/modules/eCommerceMarketplace/api/eCommerceMarketplace/private/review/createReview.form.validator";
import {editReviewFormSchema} from "armonia/src/modules/eCommerceMarketplace/api/eCommerceMarketplace/private/review/editReview.form.validator";
import {reviewListFormSchema} from "armonia/src/modules/eCommerceMarketplace/api/eCommerceMarketplace/private/review/reviewList.form.validator";
import {listingService} from "@eCommerceMarketplaceModule/database/schemas/listing/listing.service";
import {orderService} from "@eCommerceMarketplaceModule/database/schemas/order/order.service";
import Review from "@eCommerceMarketplaceModule/database/schemas/review/review";
import {reviewService} from "@eCommerceMarketplaceModule/database/schemas/review/review.service";
import {reviewToDTO, reviewsToDTO} from "@eCommerceMarketplaceModule/utilities/mappers/reviews/reviewMapper.dto";
import {reviewsToSelect} from "@eCommerceMarketplaceModule/utilities/mappers/reviews/reviewMapper.select";

async function recalculateListingRating(
    listingId: ObjectId,
    ctx: {session: any; logger: any; languageCode: string},
): Promise<void> {
    const agg = await reviewService.aggregate(
        [
            {$match: {listing: listingId, deletedAt: {$exists: false}}},
            {$group: {_id: null, avg: {$avg: "$rating"}, count: {$sum: 1}}},
        ],
        ctx,
    );
    const avg = agg.length > 0 ? Math.round((agg[0].avg as number) * 10) / 10 : 0;
    const count = agg.length > 0 ? (agg[0].count as number) : 0;
    await listingService.updateById(
        listingId,
        {$set: {avgRating: avg, reviewCount: count}},
        {...ctx, auditUserId: undefined as any},
    );
}

function listingIdFromReview(doc: any): ObjectId | null {
    const raw = doc?.listing?._id ?? doc?.listing;
    return raw ? new ObjectId(raw) : null;
}

export const basePath = "/api/eCommerceMarketplace/review";
export const {router} = createCrudRouter({
    collectionName: "reviews",
    model: Review,
    service: reviewService,
    entityName: "Review",
    defaultSort: {createdAt: -1},
    selectSearchField: "comment",
    rateLimits: {read: 60, write: 30, delete: 20},
    listSchema: reviewListFormSchema,
    createSchema: createReviewFormSchema,
    editSchema: editReviewFormSchema,
    toDTO: reviewToDTO,
    toDTOArray: reviewsToDTO,
    toSelect: reviewsToSelect,
    extraListFilter: async ({listingId, orderId, comment, rating}) => {
        const filter: Record<string, unknown> = {};

        if (listingId) {
            filter.listing = new ObjectId(listingId);
        }
        if (orderId) {
            filter.order = new ObjectId(orderId);
        }
        if (rating != null) {
            filter.rating = Array.isArray(rating) ? {$in: rating} : rating;
        }
        if (comment && typeof comment === "string" && comment.trim()) {
            filter.comment = {$regex: comment.trim(), $options: "i"};
        }

        return filter;
    },
    buildCreateData: async ({orderId, rating, comment, actionUserCtx, company, session, logger, languageCode}) => {
        const order = await orderService.findOneOrThrow(
            {_id: new ObjectId(orderId), company: company._id},
            {session, logger, languageCode},
        );

        if (order.status !== "completed") {
            throw apiValidationException("order_must_be_completed_to_review", null, null, languageCode);
        }

        const customerId = (order as any).customer?._id?.toString?.() || (order as any).customer?.toString?.();
        if (customerId !== actionUserCtx.userId.toString()) {
            throw apiValidationException("only_customer_can_review", null, null, languageCode);
        }

        const existingReview = await reviewService.findOne(
            {order: new ObjectId(orderId)},
            {session, logger, languageCode},
        );
        if (existingReview) {
            throw apiValidationException("order_already_reviewed", null, null, languageCode);
        }

        const listingId = (order as any).listing?._id || order.listing;

        return {
            order: new ObjectId(orderId),
            listing: new ObjectId(listingId),
            rating,
            comment: comment || "",
            reviewer: actionUserCtx.userId,
        };
    },
    /** Reviews are not edited via PATCH; create-only with admin delete/restore. */
    buildUpdateData: async () => ({}),
    afterCreate: async (created, params) => {
        const listingId = listingIdFromReview(created);
        if (listingId) {
            await recalculateListingRating(listingId, {
                session: params.session,
                logger: params.logger,
                languageCode: params.languageCode,
            });
        }
    },
    beforeDelete: async (params) => {
        if (!params.actionUserCtx.isAdmin) {
            throw apiValidationException("only_admin_can_delete_review", null, null, params.languageCode);
        }
    },
    afterDelete: async (params, doc) => {
        const listingId = listingIdFromReview(doc);
        if (listingId) {
            await recalculateListingRating(listingId, {
                session: params.session,
                logger: params.logger,
                languageCode: params.languageCode,
            });
        }
    },
    overrideRestoreHandler: async (params) => {
        const {logger, languageCode, session, _id, actionUserCtx, company} = params;

        logger.start(`Restoring Review ${_id}...`);
        SchemaGuard.checkModelPermission(Review, "restore", actionUserCtx, languageCode);

        const restored = await reviewService.restoreOneOrThrow(
            {_id: new ObjectId(_id), company: company._id},
            {session, logger, languageCode, auditUserId: actionUserCtx.userId},
        );

        const listingId = listingIdFromReview(restored);
        if (listingId) {
            await recalculateListingRating(listingId, {session, logger, languageCode});
        }

        logger.finish(`Restored Review ${_id}`);
        return {message: "Review successfully restored"};
    },
});
