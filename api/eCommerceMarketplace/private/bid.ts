import {ObjectId} from "mongodb";
import {createCrudRouter} from "@coreModule/api/crudRouterFactory";
import {BidActions} from "@eCommerceMarketplaceModule/database/schemas/bid/bid.actions";
import Bid from "@eCommerceMarketplaceModule/database/schemas/bid/bid";
import {bidService} from "@eCommerceMarketplaceModule/database/schemas/bid/bid.service";
import {taskRequestService} from "@eCommerceMarketplaceModule/database/schemas/taskRequest/taskRequest.service";
import {bidToDTO, bidsToDTOArray} from "@eCommerceMarketplaceModule/utilities/mappers/bids/bidMapper.dto";
import {createBidFormSchema} from "armonia/src/modules/eCommerceMarketplace/api/eCommerceMarketplace/private/bid/createBid.form.validator";
import {editBidFormSchema} from "armonia/src/modules/eCommerceMarketplace/api/eCommerceMarketplace/private/bid/editBid.form.validator";
import {bidListFormSchema} from "armonia/src/modules/eCommerceMarketplace/api/eCommerceMarketplace/private/bid/bidList.form.validator";
import {apiValidationException} from "armonia/src/modules/core/helpers/exceptions";
import type {SelectResponse} from "armonia/src/modules/core/types/shared.types";
import {bidsToSelect} from "@eCommerceMarketplaceModule/utilities/mappers/bids/bidMapper.select";
import SchemaGuard from "@coreModule/database/security/schemaGuard";

export const basePath = "/api/eCommerceMarketplace/bid";
export const {router} = createCrudRouter({
    collectionName: "bids",
    model: Bid,
    service: bidService,
    entityName: "Bid",
    defaultSort: {createdAt: -1},
    listSchema: bidListFormSchema,
    createSchema: createBidFormSchema,
    editSchema: editBidFormSchema,
    toDTO: bidToDTO,
    toDTOArray: bidsToDTOArray,
    toSelect: bidsToSelect,
    extraListFilter: async ({taskRequestId, bidderId, listingId}) => ({
        ...(listingId ? {listing: new ObjectId(listingId)} : {}),
        ...(taskRequestId ? {taskRequest: new ObjectId(taskRequestId)} : {}),
        ...(bidderId ? {bidder: new ObjectId(bidderId)} : {}),
    }),
    overrideSelectHandler: async (params): Promise<SelectResponse> => {
        const {logger, languageCode, company, name, limit = 20, page = 1, actionUserCtx} = params;

        logger.start("Fetching bids for select...");

        const sanitizedFields = SchemaGuard.sanitizeFields(Bid, { name: {}, amount: {}, taskRequest: {keys: { title: {}}}, currency: {keys: { symbol: {} }} }, "read", actionUserCtx, languageCode);
        const populate = SchemaGuard.generatePopulate(sanitizedFields, Bid.schema);

        const filter: Record<string, unknown> = {company: company._id};
        if (name?.trim()) {
            filter.status = {$regex: name.trim(), $options: "i"};
        }

        const offset = (page - 1) * limit;
        const [bids, total] = await Promise.all([
            bidService.find(filter, {logger, languageCode}, populate.populate, populate.select, {createdAt: -1}, limit, offset),
            bidService.count(filter, {logger, languageCode}),
        ]);

        logger.finish("Finished fetching bids for select!");

        return {data: bidsToSelect(bids), total};
    },
    buildCreateData: async ({listing: listingId, taskRequest: taskRequestId, amount, proposal, deliveryDays, actionUserCtx, company, logger, languageCode, session}) => {

        const taskRequest = await taskRequestService.findOneOrThrow({_id: new ObjectId(taskRequestId), company: company._id}, {session, logger, languageCode});
        if ((taskRequest as any).status !== "open") {
            throw apiValidationException("task_request_not_open", null, null, languageCode);
        }

        return {
            ...(listingId ? {listing: new ObjectId(listingId)} : {}),
            taskRequest: taskRequest,
            bidder: actionUserCtx.userId,
            amount,
            currency: taskRequest.currency,
            proposal: proposal,
            deliveryDays: deliveryDays ?? 1,
            status: "pending",
        };
    },
    buildUpdateData: async () => ({}),
    actions: BidActions,
    rateLimits: {read: 60, write: 30, delete: 20},
});
