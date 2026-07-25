import {ObjectId} from "mongodb";
import {mediaUploadMW} from "@coreModule/utilities/middlewares/mediaUploadMW";
import {createCrudRouter} from "@coreModule/api/crudRouterFactory";
import {ListingActions} from "@eCommerceMarketplaceModule/database/schemas/listing/listing.actions";
import {createListingFormSchema} from "armonia/src/modules/eCommerceMarketplace/api/eCommerceMarketplace/private/listing/createListing.form.validator";
import {editListingFormSchema} from "armonia/src/modules/eCommerceMarketplace/api/eCommerceMarketplace/private/listing/editListing.form.validator";
import {listingTableFormSchema} from "armonia/src/modules/eCommerceMarketplace/api/eCommerceMarketplace/private/listing/listing.form.validator";
import {listingSelectFormSchema} from "armonia/src/modules/eCommerceMarketplace/api/eCommerceMarketplace/private/listing/listing.select.form.validator";
import {listingService} from "@eCommerceMarketplaceModule/database/schemas/listing/listing.service";
import {listingCategoryService} from "@eCommerceMarketplaceModule/database/schemas/listingCategory/listingCategory.service";
import {currencyService} from "@coreModule/database/schemas/currency/currency.service";
import {promotionService} from "@eCommerceMarketplaceModule/database/schemas/promotion/promotion.service";
import {listingToDTO, listingsToDTO} from "@eCommerceMarketplaceModule/utilities/mappers/listing/listingMapper.dto";
import {listingsToSelect,} from "@eCommerceMarketplaceModule/utilities/mappers/listing/listingMapper.select";
import {listingAddOnService} from "@eCommerceMarketplaceModule/database/schemas/listingAddOn/listingAddOn.service";
import {listingPackageService} from "@eCommerceMarketplaceModule/database/schemas/listingPackage/listingPackage.service";
import {listingAddOnsToDTOArray} from "@eCommerceMarketplaceModule/utilities/mappers/listingAddOn/listingAddOnMapper.dto";
import {listingPackagesToDTOArray} from "@eCommerceMarketplaceModule/utilities/mappers/listingPackage/listingPackageMapper.dto";
import type {Listing as ListingDTO} from "armonia/src/modules/eCommerceMarketplace/api/eCommerceMarketplace/private/listing/listing.dto";
import type {IListing} from "@eCommerceMarketplaceModule/database/schemas/listing/listing";
import {countryService} from "@coreModule/database/schemas/country/country.service";
import {stateService} from "@coreModule/database/schemas/state/state.service";
import {cityService} from "@coreModule/database/schemas/city/city.service";
import type {SelectResponse} from "armonia/src/modules/core/types/shared.types";
import {escapeRegex} from "@coreModule/utilities/helpers";
import SchemaGuard from "@coreModule/database/security/schemaGuard";
import Listing from "@eCommerceMarketplaceModule/database/schemas/listing/listing";

async function enrichListingWithPackagesAndAddOns(listing: IListing, params: Record<string, any>,): Promise<ListingDTO> {
    const dto = listingToDTO(listing);
    const {logger, languageCode, session, company} = params;

    const filter = {listing: listing._id, company: company._id};
    const ctx = {logger, languageCode, session};

    const [addOns, packages] = await Promise.all([
        listingAddOnService.find(filter, ctx, "price.currency", "", {name: 1}),
        listingPackageService.find(filter, ctx, "price.currency", "", {order: 1, name: 1}),
    ]);

    return {
        ...dto,
        listingAddOns: listingAddOnsToDTOArray(addOns),
        listingPackages: listingPackagesToDTOArray(packages),
    };
}

const mediaUpload = mediaUploadMW({
    fields: {
        mainImage: 1,
        imageGallery: 8,
        videoGallery: 3,
    },
    maxFileSize: 250 * 1024 * 1024,
});

export const basePath = "/api/eCommerceMarketplace/listing";
export const {router} = createCrudRouter({
    collectionName: "listings",
    model: Listing,
    service: listingService,
    entityName: "Listing",
    defaultSort: {createdAt: -1},
    listSchema: listingTableFormSchema,
    selectSchema: listingSelectFormSchema,
    createSchema: createListingFormSchema,
    editSchema: editListingFormSchema,
    toDTO: listingToDTO,
    toDTOArray: listingsToDTO,
    toSelect: listingsToSelect,
    createMiddleware: [mediaUpload],
    editMiddleware: [mediaUpload],
    extraListFilter: async ({featuredOnly, company, logger, languageCode}) => {
        if (!featuredOnly) return {};

        const now = new Date();
        /** Dates live on Promotion docs; Listing.promotions is ObjectId[] — cannot $elemMatch startAt/endAt on Listing. */
        const activePromotionFilter = {
            company: company._id,
            lifecycleStatus: "active",
            startAt: {$lte: now},
            endAt: {$gte: now},
        };

        const activePromotions = await promotionService.find(
            activePromotionFilter,
            {logger, languageCode},
            null,
            "_id listing",
            {startAt: 1},
        );

        if (activePromotions.length === 0) {
            return {_id: {$in: []}};
        }

        const activePromotionIds = activePromotions.map((p) => p._id);
        const listingIds = [
            ...new Set(
                activePromotions
                    .map((p) => {
                        const listing = p.listing as {_id?: ObjectId} | ObjectId | undefined;
                        return (listing && typeof listing === "object" && "_id" in listing
                            ? listing._id
                            : listing)?.toString?.();
                    })
                    .filter(Boolean) as string[],
            ),
        ];

        return {
            _id: {$in: listingIds.map((id) => new ObjectId(id))},
            /** Listing row must reference at least one currently active promotion. */
            promotions: {$in: activePromotionIds},
        };
    },
    overrideSelectHandler: async (params): Promise<SelectResponse> => {
        const {logger, languageCode, company, name, limit = 20, page = 1, activeOnly, actionUserCtx} = params;

        logger.start("Fetching listings for select...");

        const sanitizedFields = SchemaGuard.sanitizeFields(Listing, { name: {}, title: {} }, "read", actionUserCtx, languageCode);
        const populate = SchemaGuard.generatePopulate(sanitizedFields, Listing.schema);

        const filter: Record<string, unknown> = {company: company._id};
        if (name?.trim()) {
            filter["$or"] = {
                name: {$regex: escapeRegex(name.trim()), $options: "i"},
                title: {$regex: escapeRegex(name.trim()), $options: "i"}
            }
        }
        if( activeOnly ){
            filter["status"] = "active";
        }

        const offset = (page - 1) * limit;
        const [listings, total] = await Promise.all([
            listingService.find(filter, {logger, languageCode}, populate.populate, populate.select, {createdAt: -1}, limit, offset),
            listingService.count(filter, {logger, languageCode}),
        ]);

        logger.finish("Finished fetching bids for select!");

        return {data: listingsToSelect(listings), total};
    },

    buildCreateData: async ({title, description, category, price, priceCurrency, pricingType, deliveryDays, address, mainImage, imageGallery, videoGallery, faqs, requirements, tags, actionUserCtx, company, logger, languageCode, session, userInfo}) => {
        let foundCategory = await listingCategoryService.findOneOrThrow({_id: new ObjectId(category), company: company._id}, {logger, languageCode, session},);
        const data: Record<string, unknown> = {
            title,
            description: description,
            category: foundCategory,
            provider: userInfo._id,
            status: "draft",
            price: price,
            priceCurrency: await currencyService.findOneOrThrow({_id: new ObjectId(priceCurrency), company: company._id}, {logger, languageCode, session}),
            pricingType: pricingType,
            deliveryDays: deliveryDays,
            requirements: requirements,
            faqs: faqs?.length ? faqs : undefined,
            tags: tags?.length ? tags.map((t: string) => String(t).trim()).filter(Boolean) : undefined,
            mainImage: Array.isArray(mainImage) ? mainImage[0] : mainImage,
            imageGallery: Array.isArray(imageGallery) ? imageGallery : (imageGallery ? [imageGallery] : []),
            videoGallery: Array.isArray(videoGallery) ? videoGallery : (videoGallery ? [videoGallery] : [])
        };
        const addrParts: Record<string, unknown> = {};
        if (address && typeof address === "object") {
            if (address.country) addrParts.country = await countryService.findOneOrThrow({_id: new ObjectId(address.country), company: company._id});
            if (address.state) addrParts.state = await stateService.findOneOrThrow({
                _id: new ObjectId(address.state),
                company: company._id,
                ...(address.country ? {country: new ObjectId(address.country)} : {})
            });
            if (address.city) addrParts.city = await cityService.findOneOrThrow({
                _id: new ObjectId(address.city),
                company: company._id,
                ...(address.country ? {country: new ObjectId(address.country)} : {}),
                ...(address.state ? {state: new ObjectId(address.state)} : {}),
            });
        }
        if (Object.keys(addrParts).length > 0) data.address = addrParts;
        return data;
    },
    buildUpdateData: async ({title, description, category, price, priceCurrency, pricingType, deliveryDays, address, status, mainImage, imageGallery, videoGallery, faqs, requirements, tags, company, logger, languageCode, session}, writeFields,) => {
        const update: Record<string, unknown> = {};
        if (title !== undefined && writeFields.title) update.title = title;
        if (description !== undefined && writeFields.description) update.description = description;
        if (category !== undefined && writeFields.category) {
            if (category) {
                update.category = await listingCategoryService.findOneOrThrow({_id: new ObjectId(category), company: company._id}, {logger, languageCode, session});
            } else {
                update.category = null;
            }
        }
        if (faqs !== undefined && writeFields.faqs) update.faqs = faqs;
        if (requirements !== undefined && writeFields.requirements) update.requirements = requirements;
        if (price !== undefined && "price" in writeFields) update.price = price;
        if (priceCurrency !== undefined && "priceCurrency" in writeFields) {
            if (priceCurrency) {
                update.priceCurrency = await currencyService.findOneOrThrow({_id: new ObjectId(priceCurrency), company: company._id}, {logger, languageCode, session});
            } else {
                update.priceCurrency = null;
            }
        }
        if (pricingType !== undefined && writeFields.pricingType) update.pricingType = pricingType;
        if (deliveryDays !== undefined && writeFields.deliveryDays) update.deliveryDays = deliveryDays;
        if (status !== undefined && writeFields.status) update.status = status;
        const addrWrite = writeFields.address as {keys?: Record<string, unknown>} | undefined;
        if (addrWrite?.keys && address !== undefined && address !== null && typeof address === "object") {
            const aw = addrWrite.keys;
            if (address.country !== undefined && aw.country) {
                update["address.country"] = address.country ? await countryService.findOneOrThrow({_id: new ObjectId(address.country), company: company._id}) : null;
            }
            if (address.state !== undefined && aw.state) {
                update["address.state"] = address.state ? await stateService.findOneOrThrow({
                    _id: new ObjectId(address.state),
                    company: company._id,
                    ...(address.country ? {country: new ObjectId(address.country)} : {})
                }) : null;
            }
            if (address.city !== undefined && aw.city) {
                update["address.city"] = address.city ? await cityService.findOneOrThrow({
                    _id: new ObjectId(address.city),
                    company: company._id,
                    ...(address.country ? {country: new ObjectId(address.country)} : {}),
                    ...(address.state ? {state: new ObjectId(address.state)} : {}),
                }) : null;
            }
        }
        if (tags !== undefined && writeFields.tags) update.tags = tags;
        if (mainImage !== undefined && writeFields.mainImage) {
            const mid = Array.isArray(mainImage) ? mainImage[0] : mainImage;
            update.mainImage = mid ? new ObjectId(mid as string) : null;
        }
        if (imageGallery !== undefined && writeFields.imageGallery) {
            const ids = Array.isArray(imageGallery) ? imageGallery : [imageGallery];
            update.imageGallery = ids.map((id: string) => new ObjectId(id));
        }
        if (videoGallery !== undefined && writeFields.videoGallery) {
            const ids = Array.isArray(videoGallery) ? videoGallery : [videoGallery];
            update.videoGallery = ids.map((id: string) => new ObjectId(id));
        }
        return update;
    },
    extraSelectFilter: async ({activeOnly}) => {
        if (!activeOnly) return {};
        return {status: "active"};
    },
    enrichSingle: async (doc, params) => enrichListingWithPackagesAndAddOns(doc, params),
    enrichUpdate: async (doc, params) => enrichListingWithPackagesAndAddOns(doc, params),
    rateLimits: {read: 60, write: 30, delete: 20},
    actions: ListingActions,
});