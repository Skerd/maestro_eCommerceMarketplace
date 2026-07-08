import {ObjectId} from "mongodb";
import {createCrudRouter} from "@coreModule/api/crudRouterFactory";
import {apiValidationException} from "armonia/src/modules/core/helpers/exceptions";
import {createProviderAvailabilityFormSchema} from "armonia/src/modules/eCommerceMarketplace/api/eCommerceMarketplace/private/providerAvailability/createProviderAvailability.form.validator";
import {editProviderAvailabilityFormSchema} from "armonia/src/modules/eCommerceMarketplace/api/eCommerceMarketplace/private/providerAvailability/editProviderAvailability.form.validator";
import {providerAvailabilityListFormSchema} from "armonia/src/modules/eCommerceMarketplace/api/eCommerceMarketplace/private/providerAvailability/providerAvailabilityList.form.validator";
import ProviderAvailability from "@eCommerceMarketplaceModule/database/schemas/providerAvailability/providerAvailability";
import {providerAvailabilityService} from "@eCommerceMarketplaceModule/database/schemas/providerAvailability/providerAvailability.service";
import {
    providerAvailabilityToDTO,
    providerAvailabilitiesToDTO,
} from "@eCommerceMarketplaceModule/utilities/mappers/providerAvailability/providerAvailabilityMapper.dto";

export const basePath = "/api/eCommerceMarketplace/providerAvailability";
export const {router} = createCrudRouter({
    collectionName: "provideravailabilities",
    model: ProviderAvailability,
    service: providerAvailabilityService,
    entityName: "ProviderAvailability",
    defaultSort: {dayOfWeek: 1, startTime: 1},
    listSchema: providerAvailabilityListFormSchema,
    createSchema: createProviderAvailabilityFormSchema,
    editSchema: editProviderAvailabilityFormSchema,
    toDTO: providerAvailabilityToDTO,
    toDTOArray: providerAvailabilitiesToDTO,
    toSelect: (docs) =>
        docs.map((doc) => ({
            value: doc._id.toString(),
            label: `Day ${doc.dayOfWeek} ${doc.startTime}–${doc.endTime}`,
        })),
    documentFilter: async ({company, actionUserCtx, languageCode}) => {
        const base: Record<string, unknown> = {company: company._id};
        if (actionUserCtx?.isAdmin) {
            return base;
        }
        const userId = actionUserCtx?.userId;
        if (!userId) {
            throw apiValidationException("unauthorized", null, null, languageCode);
        }
        return {...base, provider: new ObjectId(userId)};
    },
    extraListFilter: async ({providerId, actionUserCtx, languageCode}) => {
        if (providerId) {
            return {provider: new ObjectId(providerId)};
        }
        if (actionUserCtx?.isAdmin) {
            return {};
        }
        const userId = actionUserCtx?.userId;
        if (!userId) {
            throw apiValidationException("provider_id_required", null, null, languageCode);
        }
        return {provider: new ObjectId(userId)};
    },
    buildCreateData: async ({dayOfWeek, startTime, endTime, timezone, actionUserCtx, languageCode}) => {
        const userId = actionUserCtx?.userId;
        if (!userId) {
            throw apiValidationException("unauthorized", null, null, languageCode);
        }
        return {
            provider: new ObjectId(userId),
            dayOfWeek,
            startTime,
            endTime,
            timezone: timezone?.trim() || "UTC",
        };
    },
    buildUpdateData: async ({dayOfWeek, startTime, endTime, timezone}, writeFields) => {
        const update: Record<string, unknown> = {};
        if (dayOfWeek !== undefined && writeFields.dayOfWeek) update.dayOfWeek = dayOfWeek;
        if (startTime !== undefined && writeFields.startTime) update.startTime = startTime;
        if (endTime !== undefined && writeFields.endTime) update.endTime = endTime;
        if (timezone !== undefined && writeFields.timezone) update.timezone = timezone?.trim() || "UTC";
        return update;
    },
    rateLimits: {read: 60, write: 30, delete: 20},
});
