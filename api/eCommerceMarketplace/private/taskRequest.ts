import {ObjectId} from "mongodb";
import {mediaUploadMW} from "@coreModule/utilities/middlewares/mediaUploadMW";
import {createCrudRouter} from "@coreModule/api/crudRouterFactory";
import {TaskRequestActions} from "@eCommerceMarketplaceModule/database/schemas/taskRequest/taskRequest.actions";
import {createTaskRequestFormSchema} from "armonia/src/modules/eCommerceMarketplace/api/eCommerceMarketplace/private/taskRequest/createTaskRequest.form.validator";
import {editTaskRequestFormSchema} from "armonia/src/modules/eCommerceMarketplace/api/eCommerceMarketplace/private/taskRequest/editTaskRequest.form.validator";
import {taskRequestTableFormSchema} from "armonia/src/modules/eCommerceMarketplace/api/eCommerceMarketplace/private/taskRequest/taskRequest.form.validator";
import {taskRequestSelectFormSchema} from "armonia/src/modules/eCommerceMarketplace/api/eCommerceMarketplace/private/taskRequest/taskRequest.select.form.validator";
import TaskRequest from "@eCommerceMarketplaceModule/database/schemas/taskRequest/taskRequest";
import {taskRequestService} from "@eCommerceMarketplaceModule/database/schemas/taskRequest/taskRequest.service";
import {bidService} from "@eCommerceMarketplaceModule/database/schemas/bid/bid.service";
import {listingService} from "@eCommerceMarketplaceModule/database/schemas/listing/listing.service";
import {emitNotificationEvent, NotificationEventCodes} from "@coreModule/domain/notifications/notificationEventBus";
import {taskRequestToDTO, taskRequestsToDTO} from "@eCommerceMarketplaceModule/utilities/mappers/taskRequest/taskRequestMapper.dto";
import {taskRequestsToSelect} from "@eCommerceMarketplaceModule/utilities/mappers/taskRequest/taskRequestMapper.select";
import {categoryService} from "@eCommerceModule/database/schemas/category/category.service";
import {currencyService} from "@coreModule/database/schemas/currency/currency.service";
import {countryService} from "@coreModule/database/schemas/country/country.service";
import {cityService} from "@coreModule/database/schemas/city/city.service";
import {stateService} from "@coreModule/database/schemas/state/state.service";
import type {SelectResponse} from "armonia/src/modules/core/types/shared.types";
import {escapeRegex} from "@coreModule/utilities/helpers";
import SchemaGuard from "@coreModule/database/security/schemaGuard";

const mediaUpload = mediaUploadMW({
    fields: {
        mainImage: 1,
        imageGallery: 8,
        videoGallery: 3,
    },
    maxFileSize: 250 * 1024 * 1024,
});

export const basePath = "/api/eCommerceMarketplace/taskRequest";
export const {router} = createCrudRouter({
    collectionName: "taskrequests",
    model: TaskRequest,
    service: taskRequestService,
    entityName: "TaskRequest",
    defaultSort: {createdAt: -1},
    listSchema: taskRequestTableFormSchema,
    createSchema: createTaskRequestFormSchema,
    editSchema: editTaskRequestFormSchema,
    toDTO: (doc) => taskRequestToDTO(doc),
    toDTOArray: (docs) => taskRequestsToDTO(docs),
    toSelect: taskRequestsToSelect,
    selectSchema: taskRequestSelectFormSchema,
    extraSelectFilter: async ({activeOnly}) => {
        if (!activeOnly) return {};
        return {status: "open"};
    },
    createMiddleware: [mediaUpload],
    editMiddleware: [mediaUpload],
    overrideSelectHandler: async (params): Promise<SelectResponse> => {
        const {logger, languageCode, company, name, limit = 20, page = 1, activeOnly, actionUserCtx} = params;

        logger.start("Fetching taskRequests for select...");

        const sanitizedFields = SchemaGuard.sanitizeFields(TaskRequest, { name: {}, title: {} }, "read", actionUserCtx, languageCode);
        const populate = SchemaGuard.generatePopulate(sanitizedFields, TaskRequest.schema);

        const filter: Record<string, unknown> = {company: company._id};
        if (name?.trim()) {
            filter["$or"] = {
                name: {$regex: escapeRegex(name.trim()), $options: "i"},
                title: {$regex: escapeRegex(name.trim()), $options: "i"}
            }
        }
        if( activeOnly ){
            filter["status"] = "open";
        }

        const offset = (page - 1) * limit;
        const [taskRequests, total] = await Promise.all([
            taskRequestService.find(filter, {logger, languageCode}, populate.populate, populate.select, {createdAt: -1}, limit, offset),
            taskRequestService.count(filter, {logger, languageCode}),
        ]);

        logger.finish("Finished fetching taskRequests for select!");

        return {data: taskRequestsToSelect(taskRequests), total};
    },
    afterCreate: async (created, params) => {
        const {logger, languageCode, company} = params;
        if (!created.category || !created.address?.city) return;
        const providers = await listingService.aggregate(
            [
                {$match: {company: company._id, category: created.category, "address.city": created.address.city, status: "active", deletedAt: {$exists: false}}},
                {$group: {_id: "$provider"}},
            ],
            {logger, languageCode},
        );
        const providerIds = providers.map((p: any) => p._id?.toString()).filter(Boolean) as string[];
        if (providerIds.length === 0) return;
        emitNotificationEvent(NotificationEventCodes.TASK_REQUEST_CREATED, {
            receiverIds: providerIds,
            payload: {
                companyId: company._id.toString(),
                languageCode,
                taskRequestId: created._id.toString(),
                taskRequestTitle: created.title,
                categoryId: created.category.toString(),
                cityId: created.address.city.toString(),
            },
        });
    },
    enrichList: async (docs, params) => {
        const {logger, languageCode} = params;
        const ids = docs.map((d) => d._id);
        let bidCounts = new Map<string, number>();
        if( ids.length > 0 ){
            const counts = await bidService.aggregate([{$match: {taskRequest: {$in: ids}}}, {$group: {_id: "$taskRequest", count: {$sum: 1}}}], {logger, languageCode});
            counts.forEach((c) => bidCounts.set(c._id.toString(), c.count));
        }
        return taskRequestsToDTO(docs, bidCounts);
    },
    enrichSingle: async (doc, params) => {
        const {logger, languageCode, company} = params;
        return taskRequestToDTO(doc, await bidService.count({taskRequest: doc._id, company: company._id}, {logger, languageCode}));
    },
    enrichUpdate: async (doc, params) => {
        const {logger, languageCode, company} = params;
        return taskRequestToDTO(doc, await bidService.count({taskRequest: doc._id, company: company._id}, {logger, languageCode}));
    },
    buildCreateData: async ({title, description, category, budgetMin, budgetMax, currency, address, mainImage, imageGallery, videoGallery, actionUserCtx, company, logger, languageCode,session,}) => {
        const [foundCategory, foundCurrency, foundCountry, foundCity] = await Promise.all([
            categoryService.findOneOrThrow({_id: new ObjectId(category), company: company._id}, {logger, languageCode, session}),
            currencyService.findOneOrThrow({_id: new ObjectId(currency), company: company._id}, {logger, languageCode, session}),
            countryService.findOneOrThrow({ company: company._id, _id: new ObjectId(address.country) }, { session, logger, languageCode }),
            cityService.findOneOrThrow({ company: company._id, _id: new ObjectId(address.city), country: new ObjectId(address.country) }, { session, logger, languageCode }),
        ])
        const foundState = address.state ? await stateService.findOne({ company: company._id, _id: new ObjectId(address.state), country: new ObjectId(address.country) }) : undefined;
        const data: Record<string, unknown> = {
            requester: actionUserCtx.userId,
            title: title.trim(),
            description: description?.trim() || undefined,
            status: "open",
            budgetMin,
            budgetMax,
            currency: foundCurrency,
            category: foundCategory,
            expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
            address: {
                street:     address.street,
                postalCode: address.postalCode,
                country:    foundCountry,
                state:      foundState,
                city:       foundCity,
                latitude:   address.latitude,
                longitude:  address.longitude,
            },
            mainImage: Array.isArray(mainImage)    ? mainImage[0] : mainImage,
            imageGallery: Array.isArray(imageGallery) ? imageGallery : (imageGallery ? [imageGallery] : []),
            videoGallery: Array.isArray(videoGallery) ? videoGallery : (videoGallery ? [videoGallery] : [])
        };
        return data;
    },
    buildUpdateData: async ({_id, title, description, category, budgetMin, budgetMax, currency, address, mainImage, imageGallery, videoGallery, company, logger, languageCode, session, existing}, writeFields,) => {
        const update: Record<string, unknown> = {
            _id: new ObjectId(_id)
        };
        if (title !== undefined && writeFields.title) update.title = title.trim();
        if (description !== undefined && writeFields.description) update.description = description?.trim() || "";
        if (category !== undefined && writeFields.category) {
            if (category) {
                update.category = await categoryService.findOneOrThrow({_id: new ObjectId(category), company: company._id}, {logger, languageCode, session});
            } else {
                update.category = null;
            }
        }
        if (budgetMin !== undefined && writeFields.budgetMin) update.budgetMin = budgetMin;
        if (budgetMax !== undefined && writeFields.budgetMax) update.budgetMax = budgetMax;
        if (currency !== undefined && writeFields.currency) {
            if (currency) {
                update.currency = await currencyService.findOneOrThrow({_id: new ObjectId(currency), company: company._id}, {logger, languageCode, session});
            } else {
                update.currency = null;
            }
        }
        if (mainImage !== undefined && writeFields.mainImage) {
            const mid = Array.isArray(mainImage) ? mainImage[0] : mainImage;
            update.mainImage = mid ? new ObjectId(mid as string) : null;
        }
        if (imageGallery !== undefined && writeFields.imageGallery) {
            update.imageGallery = Array.isArray(imageGallery) ? imageGallery : [imageGallery];
        }
        if (videoGallery !== undefined && writeFields.videoGallery) {
            update.videoGallery = Array.isArray(videoGallery) ? videoGallery : [videoGallery];
        }
        if (address !== undefined && writeFields.address) {
            let countryFilter = {};
            const updatedAddress: any = {};
            if (address.country !== undefined && writeFields.address.keys?.country) {
                updatedAddress.country = await countryService.findOneOrThrow({ _id: new ObjectId(address.country), company: company._id });
                countryFilter = { country: new ObjectId(address.country) };
            }
            if (address.state !== undefined && writeFields.address.keys?.state)          updatedAddress.state      = await stateService.findOne({ _id: new ObjectId(address.state), company: company._id, ...countryFilter });
            if (address.street !== undefined && writeFields.address.keys?.street)        updatedAddress.street     = address.street;
            if (address.postalCode !== undefined && writeFields.address.keys?.postalCode) updatedAddress.postalCode = address.postalCode;
            if (address.city && writeFields.address.keys?.city)                          updatedAddress.city       = await cityService.findOneOrThrow({ _id: new ObjectId(address.city), company: company._id, ...countryFilter });
            if (address.latitude !== undefined && writeFields.address.keys?.latitude)    updatedAddress.latitude   = address.latitude;
            if (address.longitude !== undefined && writeFields.address.keys?.longitude)  updatedAddress.longitude  = address.longitude;
            update.address = updatedAddress;
        }
        return update;
    },
    rateLimits: {read: 60, write: 30, delete: 20},
    actions: TaskRequestActions,
});
